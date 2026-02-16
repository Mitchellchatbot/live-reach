import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function renderPage(type: 'success' | 'error', message: string, postMessageScript: string): string {
  const isSuccess = type === 'success';
  const iconColor = isSuccess ? '#16a34a' : '#dc2626';
  const iconBg = isSuccess ? '#dcfce7' : '#fee2e2';
  const icon = isSuccess
    ? `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
    : `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Salesforce ${isSuccess ? 'Connected' : 'Error'}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc}
.card{background:#fff;border-radius:16px;padding:48px 40px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08);max-width:400px;width:90%;animation:fadeIn .4s ease}
.icon{width:80px;height:80px;border-radius:50%;background:${iconBg};display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
h1{font-size:20px;font-weight:600;color:#0f172a;margin-bottom:8px}
p{font-size:14px;color:#64748b;line-height:1.5}
.close-btn{margin-top:24px;padding:10px 24px;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;background:${isSuccess ? '#16a34a' : '#64748b'};color:#fff;transition:opacity .2s}
.close-btn:hover{opacity:.85}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
</style>
</head>
<body>
<div class="card">
  <div class="icon">${icon}</div>
  <h1>${isSuccess ? 'Connected Successfully' : 'Connection Failed'}</h1>
  <p>${message}</p>
  <button class="close-btn" onclick="window.close()">Close Window</button>
</div>
<script>${postMessageScript}setTimeout(()=>window.close(),5000);</script>
</body>
</html>`;
}

// --- Encryption helpers (AES-256-GCM, key derived from service role key) ---

async function deriveKey(): Promise<CryptoKey> {
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
    ["encrypt"]
  );
}

async function encryptToken(plaintext: string): Promise<string> {
  const key = await deriveKey();
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
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // "propertyId:csrfToken"
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    if (error) {
      console.error("OAuth error:", error, errorDescription);
      return new Response(
        renderPage('error', errorDescription || error || 'Authentication failed.', `window.opener?.postMessage({type:'salesforce-oauth-error',error:'${error}'},'*');`),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    if (!code || !state) {
      return new Response(
        renderPage('error', 'Missing required parameters.', `window.opener?.postMessage({type:'salesforce-oauth-error',error:'missing_params'},'*');`),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // Parse state: "propertyId:csrfToken"
    const colonIdx = state.indexOf(":");
    if (colonIdx === -1) {
      console.error("Invalid state format - expected propertyId:csrfToken");
      return new Response(
        renderPage('error', 'Invalid state parameter.', `window.opener?.postMessage({type:'salesforce-oauth-error',error:'invalid_state'},'*');`),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    const propertyId = state.substring(0, colonIdx);
    const csrfToken = state.substring(colonIdx + 1);

    if (!propertyId || !csrfToken) {
      return new Response(
        renderPage('error', 'Invalid state parameter.', `window.opener?.postMessage({type:'salesforce-oauth-error',error:'invalid_state'},'*');`),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch settings and validate CSRF token
    const { data: settings, error: settingsError } = await supabase
      .from("salesforce_settings")
      .select("*")
      .eq("property_id", propertyId)
      .single();

    if (settingsError || !settings) {
      console.error("Error fetching settings:", settingsError);
      return new Response(
        renderPage('error', 'Settings not found for this property.', `window.opener?.postMessage({type:'salesforce-oauth-error',error:'settings_not_found'},'*');`),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // CSRF validation
    if (!settings.pending_oauth_token || settings.pending_oauth_token !== csrfToken) {
      console.error("CSRF token mismatch for property:", propertyId);
      return new Response(
        renderPage('error', 'Security validation failed. Please try connecting again.', `window.opener?.postMessage({type:'salesforce-oauth-error',error:'csrf_mismatch'},'*');`),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // Check token expiration (10 minute window)
    if (settings.pending_oauth_expires_at && new Date(settings.pending_oauth_expires_at) < new Date()) {
      console.error("OAuth CSRF token expired for property:", propertyId);
      await supabase
        .from("salesforce_settings")
        .update({ pending_oauth_token: null, pending_oauth_expires_at: null, pending_code_verifier: null })
        .eq("property_id", propertyId);
      return new Response(
        renderPage('error', 'Connection request expired. Please try again.', `window.opener?.postMessage({type:'salesforce-oauth-error',error:'token_expired'},'*');`),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // Get code verifier from database (stored by salesforce-oauth-start)
    const codeVerifier = (settings as any).pending_code_verifier;
    if (!codeVerifier) {
      console.error("Missing code verifier for property:", propertyId);
      return new Response(
        renderPage('error', 'Missing security data. Please try connecting again.', `window.opener?.postMessage({type:'salesforce-oauth-error',error:'missing_verifier'},'*');`),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // Clear the CSRF token + code verifier immediately (single-use)
    await supabase
      .from("salesforce_settings")
      .update({ pending_oauth_token: null, pending_oauth_expires_at: null, pending_code_verifier: null })
      .eq("property_id", propertyId);

    // Read managed credentials from env secrets
    const clientId = Deno.env.get("SALESFORCE_CLIENT_ID");
    const clientSecret = Deno.env.get("SALESFORCE_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      console.error("Missing SALESFORCE_CLIENT_ID or SALESFORCE_CLIENT_SECRET env vars");
      return new Response(
        renderPage('error', 'Salesforce integration is not configured.', `window.opener?.postMessage({type:'salesforce-oauth-error',error:'missing_credentials'},'*');`),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // Exchange code for tokens
    const redirectUri = `${supabaseUrl}/functions/v1/salesforce-oauth-callback`;
    const tokenResponse = await fetch("https://login.salesforce.com/services/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      console.error("Token exchange error:", tokenData);
      return new Response(
        renderPage('error', `Token exchange failed: ${tokenData.error_description || tokenData.error}`, `window.opener?.postMessage({type:'salesforce-oauth-error',error:'${tokenData.error || 'token_error'}'},'*');`),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 7200) * 1000).toISOString();

    // Encrypt tokens before storage
    console.log("Encrypting Salesforce tokens before storage...");
    const encryptedAccessToken = await encryptToken(tokenData.access_token);
    const encryptedRefreshToken = tokenData.refresh_token
      ? await encryptToken(tokenData.refresh_token)
      : null;

    // Update the settings with encrypted tokens
    const { error: updateError } = await supabase
      .from("salesforce_settings")
      .update({
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        instance_url: tokenData.instance_url,
        token_expires_at: expiresAt,
        enabled: true,
      })
      .eq("property_id", propertyId);

    if (updateError) {
      console.error("Error updating settings:", updateError);
      return new Response(
        renderPage('error', 'Failed to save connection tokens.', `window.opener?.postMessage({type:'salesforce-oauth-error',error:'update_failed'},'*');`),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    console.log("Salesforce OAuth successful for property:", propertyId, "(tokens encrypted)");

    return new Response(
      renderPage('success', 'Your Salesforce account has been connected. This window will close automatically.', `window.opener?.postMessage({type:'salesforce-oauth-success'},'*');`),
      { headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      renderPage('error', 'An unexpected error occurred. Please try again.', `window.opener?.postMessage({type:'salesforce-oauth-error',error:'unexpected'},'*');`),
      { headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  }
});
