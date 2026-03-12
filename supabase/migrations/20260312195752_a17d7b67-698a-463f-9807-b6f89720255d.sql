
-- Re-add scoped anon SELECT on conversations for Realtime widget subscriptions
-- The widget subscribes to a specific conversation by ID. Without anon SELECT,
-- Realtime won't deliver updates. We use conversation_exists() as a minimal check.
-- UUIDs are not enumerable, and the widget only knows its own conversation ID.
CREATE POLICY "Widget can read specific conversations"
ON public.conversations
FOR SELECT
TO anon
USING (conversation_exists(id));

-- Create a secure RPC for agent invitation lookup by token
-- This replaces the dropped blanket SELECT policy on agents for pending invitations
CREATE OR REPLACE FUNCTION public.lookup_agent_by_invitation_token(token text)
RETURNS TABLE (
  name text,
  email text,
  invitation_expires_at timestamptz,
  invited_by uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT a.name, a.email, a.invitation_expires_at, a.invited_by
  FROM public.agents a
  WHERE a.invitation_token = token
    AND a.invitation_status = 'pending'
  LIMIT 1;
$$;

-- Also create a function for verifying invitation during signup
CREATE OR REPLACE FUNCTION public.verify_agent_invitation(
  p_token text,
  p_email text
)
RETURNS TABLE (
  id uuid,
  email text,
  invitation_expires_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT a.id, a.email, a.invitation_expires_at
  FROM public.agents a
  WHERE a.invitation_token = p_token
    AND a.invitation_status = 'pending'
    AND a.email = p_email
  LIMIT 1;
$$;
