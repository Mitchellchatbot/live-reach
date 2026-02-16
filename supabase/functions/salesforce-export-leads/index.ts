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

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { propertyId, visitorIds, _serviceRoleExport } = await req.json();

    if (!propertyId || !visitorIds || visitorIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Property ID and visitor IDs are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let exportType = "manual";
    let callerUserId: string | null = null;

    // If called with service role key (automated export from extract-visitor-info), skip user ownership check
    if (_serviceRoleExport && token === supabaseServiceKey) {
      exportType = "auto_insurance";
      console.log("Service-role auto-export for property", propertyId);
    } else {
      // Standard user auth
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData, error: authError } = await authClient.auth.getUser(token);
      if (authError || !userData?.user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      callerUserId = userData.user.id;

      if (propertyId !== 'all') {
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
      }
      // For 'all' properties, ownership is verified per-visitor below via RLS
    }

    // For 'all' properties mode, we handle settings per-visitor's property
    // For single property, fetch settings once
    let singleSettings: any = null;
    if (propertyId !== 'all') {
      const { data: settings, error: settingsError } = await supabase
        .from("salesforce_settings")
        .select("*")
        .eq("property_id", propertyId)
        .maybeSingle();

      if (settingsError || !settings) {
        return new Response(
          JSON.stringify({ error: "Salesforce settings not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!settings.instance_url || !settings.access_token) {
        return new Response(
          JSON.stringify({ error: "Salesforce not connected. Please connect your account first." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      singleSettings = settings;
    }

    // Fetch visitors
    let visitorsQuery = supabase
      .from("visitors")
      .select("*")
      .in("id", visitorIds);
    
    // Only filter by property_id if not exporting across all properties
    if (propertyId !== 'all') {
      visitorsQuery = visitorsQuery.eq("property_id", propertyId);
    }

    const { data: visitors, error: visitorsError } = await visitorsQuery;

    if (visitorsError || !visitors || visitors.length === 0) {
      return new Response(
        JSON.stringify({ error: "No visitors found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get field mappings from single settings or will be fetched per visitor
    const fieldMappings = singleSettings ? (singleSettings.field_mappings || {}) : {};
    
    // Decrypt the access token if single settings
    let accessToken = singleSettings ? await decryptToken(singleSettings.access_token) : '';
    let currentSettings = singleSettings;
    let exported = 0;
    const errors: string[] = [];

    // Export each visitor as a Lead
    for (const visitor of visitors) {
      // For 'all' properties mode, fetch settings per visitor's property
      if (propertyId === 'all') {
        const { data: visitorSettings } = await supabase
          .from("salesforce_settings")
          .select("*")
          .eq("property_id", visitor.property_id)
          .maybeSingle();

        if (!visitorSettings || !visitorSettings.instance_url || !visitorSettings.access_token) {
          errors.push(`No Salesforce connection for ${visitor.name || visitor.email || visitor.id}`);
          continue;
        }
        currentSettings = visitorSettings;
        accessToken = await decryptToken(visitorSettings.access_token);
      }

      const currentFieldMappings = propertyId === 'all' 
        ? (currentSettings.field_mappings || {}) 
        : fieldMappings;

      const leadData: Record<string, string> = {};

      // Map visitor fields to Salesforce Lead fields
      for (const [sfField, visitorField] of Object.entries(currentFieldMappings)) {
        const value = visitor[visitorField as keyof typeof visitor];
        if (value !== null && value !== undefined) {
          leadData[sfField] = String(value);
        }
      }

      // Ensure required fields have values
      if (!leadData.LastName) {
        leadData.LastName = visitor.name || visitor.email?.split('@')[0] || 'Unknown';
      }
      if (!leadData.Company) {
        leadData.Company = '[Not Provided]';
      }

      // Add lead source with property name
      const visitorPropertyId = propertyId === 'all' ? visitor.property_id : propertyId;
      const { data: propertyData } = await supabase
        .from("properties")
        .select("name")
        .eq("id", visitorPropertyId)
        .maybeSingle();
      leadData.LeadSource = propertyData?.name ? `Website Chat - ${propertyData.name}` : 'Website Chat';

      try {
        let response = await fetch(
          `${currentSettings.instance_url}/services/data/v59.0/sobjects/Lead`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(leadData),
          }
        );

        // Handle token refresh if needed
        if (response.status === 401 && currentSettings.refresh_token) {
          const newToken = await refreshAccessToken(supabase, currentSettings);
          if (newToken) {
            accessToken = newToken;
            response = await fetch(
              `${currentSettings.instance_url}/services/data/v59.0/sobjects/Lead`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(leadData),
              }
            );
          }
        }

        if (response.ok) {
          const result = await response.json();
          
          // Find conversation for this visitor to record the export
          const { data: conversation } = await supabase
            .from("conversations")
            .select("id")
            .eq("visitor_id", visitor.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (conversation) {
            await supabase
              .from("salesforce_exports")
              .insert({
                conversation_id: conversation.id,
                salesforce_lead_id: result.id,
                export_type: exportType,
                exported_by: null,
              });

            // Log notification for the export
            await supabase
              .from("notification_logs")
              .insert({
                property_id: visitorPropertyId,
                conversation_id: conversation.id,
                notification_type: "salesforce_export",
                channel: "in_app",
                recipient: "system",
                recipient_type: "system",
                status: "sent",
                visitor_name: visitor.name || visitor.email || null,
              });
          }

          exported++;
        } else {
          const errorData = await response.json();
          console.error("Salesforce error:", errorData);
          errors.push(`Failed to export ${visitor.name || visitor.email || visitor.id}`);

          // Log failed export notification
          await supabase
            .from("notification_logs")
            .insert({
              property_id: visitorPropertyId,
              notification_type: "export_failed",
              channel: "in_app",
              recipient: "system",
              recipient_type: "system",
              status: "failed",
              visitor_name: visitor.name || visitor.email || null,
              error_message: JSON.stringify(errorData).substring(0, 500),
            });
        }
      } catch (err) {
        console.error("Export error:", err);
        errors.push(`Error exporting ${visitor.name || visitor.email || visitor.id}`);
      }
    }

    console.log(`Exported ${exported}/${visitors.length} leads by user ${callerUserId}`);

    return new Response(
      JSON.stringify({ 
        exported, 
        total: visitors.length,
        errors: errors.length > 0 ? errors : undefined 
      }),
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

async function refreshAccessToken(supabase: any, settings: any): Promise<string | null> {
  try {
    // Decrypt the refresh token
    const refreshToken = await decryptToken(settings.refresh_token);

    const tokenUrl = "https://login.salesforce.com/services/oauth2/token";
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: settings.client_id,
      client_secret: settings.client_secret,
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
