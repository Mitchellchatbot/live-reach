import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- Decryption helpers (AES-256-GCM, key derived from service role key) ---

async function deriveKey(usage: "encrypt" | "decrypt"): Promise<CryptoKey> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("salesforce-token-encryption-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    [usage]
  );
}

async function decryptToken(encrypted: string): Promise<string> {
  // If not encrypted (legacy plaintext), return as-is
  if (!encrypted.startsWith("enc:")) {
    return encrypted;
  }
  const parts = encrypted.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted token format");

  const ivB64 = parts[1];
  const ctB64 = parts[2];
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0));

  const key = await deriveKey("decrypt");
  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(plainBuffer);
}

async function encryptToken(plaintext: string): Promise<string> {
  const key = await deriveKey("encrypt");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  return `enc:${ivB64}:${ctB64}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- Authentication ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const callerUserId = userData.user.id;

    const { propertyId } = await req.json();

    if (!propertyId) {
      return new Response(
        JSON.stringify({ error: "Property ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --- Authorization: Verify caller owns the property ---
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("user_id")
      .eq("id", propertyId)
      .single();

    if (propError || !property || property.user_id !== callerUserId) {
      console.error("Forbidden: caller does not own property", propertyId);
      return new Response(
        JSON.stringify({ error: "Forbidden: you do not own this property" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch Salesforce settings for this property
    const { data: settings, error: settingsError } = await supabase
      .from("salesforce_settings")
      .select("*")
      .eq("property_id", propertyId)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: "Salesforce settings not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.instance_url || !settings.access_token) {
      return new Response(
        JSON.stringify({ error: "Salesforce not connected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decrypt the access token
    const accessToken = await decryptToken(settings.access_token);

    // Call Salesforce Lead describe API
    const describeUrl = `${settings.instance_url}/services/data/v59.0/sobjects/Lead/describe`;
    
    const sfResponse = await fetch(describeUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!sfResponse.ok) {
      // Token might be expired, try to refresh
      if (sfResponse.status === 401 && settings.refresh_token) {
        const refreshed = await refreshAccessToken(supabase, settings);
        if (refreshed) {
          // Retry with new token
          const retryResponse = await fetch(describeUrl, {
            headers: {
              "Authorization": `Bearer ${refreshed}`,
              "Content-Type": "application/json",
            },
          });

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            return new Response(
              JSON.stringify({ fields: extractLeadFields(data) }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }

      const errorText = await sfResponse.text();
      console.error("Salesforce API error:", errorText);
      // Detect session expiry and return a specific error
      const isSessionExpired = errorText.includes("INVALID_SESSION_ID") || errorText.includes("Session expired");
      return new Response(
        JSON.stringify({ error: isSessionExpired ? "Session expired or invalid. Please reconnect your Salesforce account." : "Failed to fetch Lead fields from Salesforce" }),
        { status: isSessionExpired ? 401 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await sfResponse.json();
    const fields = extractLeadFields(data);

    return new Response(
      JSON.stringify({ fields }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function extractLeadFields(describeData: any) {
  return describeData.fields
    .filter((field: any) => field.createable && !field.deprecatedAndHidden)
    .map((field: any) => ({
      name: field.name,
      label: field.label,
      type: field.type,
      required: !field.nillable && !field.defaultedOnCreate,
    }))
    .sort((a: any, b: any) => a.label.localeCompare(b.label));
}

async function refreshAccessToken(supabase: any, settings: any): Promise<string | null> {
  try {
    // Decrypt the refresh token
    const refreshToken = await decryptToken(settings.refresh_token);

    // Use managed credentials from env vars (DB fields may be null for managed apps)
    const clientId = Deno.env.get("SALESFORCE_CLIENT_ID") || settings.client_id;
    const clientSecret = Deno.env.get("SALESFORCE_CLIENT_SECRET") || settings.client_secret;

    if (!clientId || !clientSecret) {
      console.error("No Salesforce client credentials available for token refresh");
      return null;
    }

    const tokenUrl = "https://login.salesforce.com/services/oauth2/token";
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error("Token refresh failed");
      return null;
    }

    const tokenData = await response.json();

    // Encrypt the new access token before storing
    const encryptedAccessToken = await encryptToken(tokenData.access_token);

    // Update stored tokens
    await supabase
      .from("salesforce_settings")
      .update({
        access_token: encryptedAccessToken,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id);

    return tokenData.access_token; // Return plaintext for immediate use
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}
