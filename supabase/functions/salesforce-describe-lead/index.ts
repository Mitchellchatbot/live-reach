import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Call Salesforce Lead describe API
    const describeUrl = `${settings.instance_url}/services/data/v59.0/sobjects/Lead/describe`;
    
    const sfResponse = await fetch(describeUrl, {
      headers: {
        "Authorization": `Bearer ${settings.access_token}`,
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
              "Authorization": `Bearer ${refreshed.access_token}`,
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
      return new Response(
        JSON.stringify({ error: "Failed to fetch Lead fields from Salesforce" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

async function refreshAccessToken(supabase: any, settings: any) {
  try {
    const tokenUrl = "https://login.salesforce.com/services/oauth2/token";
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: settings.client_id,
      client_secret: settings.client_secret,
      refresh_token: settings.refresh_token,
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

    // Update stored tokens
    await supabase
      .from("salesforce_settings")
      .update({
        access_token: tokenData.access_token,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id);

    return tokenData;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}
