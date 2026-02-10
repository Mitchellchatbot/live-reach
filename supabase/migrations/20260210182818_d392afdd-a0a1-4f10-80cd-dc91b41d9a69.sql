
-- Fix the overly permissive INSERT policy - restrict to authenticated users only
-- Edge functions use service role key which bypasses RLS anyway
DROP POLICY "Service can insert notification logs" ON public.notification_logs;

CREATE POLICY "Authenticated users can insert notification logs"
ON public.notification_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
