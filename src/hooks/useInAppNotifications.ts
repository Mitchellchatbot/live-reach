import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type NotificationType =
  | 'new_chat'
  | 'escalation'
  | 'phone_captured'
  | 'property_added'
  | 'new_message'
  | 'email_sent'
  | 'email_failed'
  | 'slack_sent'
  | 'slack_failed'
  | 'export_success'
  | 'export_failed';

export interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  propertyName?: string;
  conversationId?: string;
}

const SEEN_KEY = 'care-assist-notif-seen-at';

export function useInAppNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSeenAt, setLastSeenAt] = useState<Date>(() => {
    const stored = localStorage.getItem(SEEN_KEY);
    return stored ? new Date(stored) : new Date(0);
  });

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    const since = new Date();
    since.setDate(since.getDate() - 7);

    // Fetch properties for name lookup
    const [propsResult, logsResult] = await Promise.all([
      supabase.from('properties').select('id, name'),
      supabase
        .from('notification_logs')
        .select('id, notification_type, channel, status, visitor_name, created_at, property_id, conversation_id')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const propMap = new Map((propsResult.data || []).map(p => [p.id, p.name]));
    const items: InAppNotification[] = [];

    if (logsResult.data) {
      for (const log of logsResult.data) {
        const propName = propMap.get(log.property_id) || 'Unknown';
        const visitor = log.visitor_name || 'A visitor';
        const nt = log.notification_type;
        const ch = log.channel;
        const failed = log.status === 'failed';

        let mapped: { type: NotificationType; title: string; description: string };

        if (nt === 'new_conversation') {
          mapped = { type: 'new_chat', title: 'New Conversation', description: `${visitor} started a chat on ${propName}` };
        } else if (nt === 'escalation') {
          mapped = { type: 'escalation', title: 'Escalation Alert', description: `${visitor} needs human help on ${propName}` };
        } else if (nt === 'phone_submission') {
          mapped = { type: 'phone_captured', title: 'Phone Number Captured', description: `${visitor} shared their phone on ${propName}` };
        } else if (nt === 'property_added') {
          mapped = { type: 'property_added', title: 'Property Added', description: `${propName} was added to your account` };
        } else if (nt === 'export_success' || nt === 'salesforce_export') {
          mapped = { type: 'export_success', title: 'Export Successful', description: `Lead exported to Salesforce from ${propName}` };
        } else if (nt === 'export_failed') {
          mapped = { type: 'export_failed', title: 'Export Failed', description: `Salesforce export failed for ${propName}` };
        } else if (ch === 'email' || nt === 'email') {
          mapped = failed
            ? { type: 'email_failed', title: 'Email Failed', description: `Email notification failed for ${propName}` }
            : { type: 'email_sent', title: 'Email Sent', description: `Email notification sent for ${visitor} on ${propName}` };
        } else if (ch === 'slack' || nt === 'slack') {
          mapped = failed
            ? { type: 'slack_failed', title: 'Slack Failed', description: `Slack notification failed for ${propName}` }
            : { type: 'slack_sent', title: 'Slack Sent', description: `Slack alert delivered for ${visitor} on ${propName}` };
        } else {
          mapped = {
            type: failed ? 'email_failed' : 'new_message',
            title: nt?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Notification',
            description: `${nt} on ${propName}`,
          };
        }

        items.push({
          id: `log-${log.id}`,
          ...mapped,
          timestamp: new Date(log.created_at),
          propertyName: propName,
          conversationId: log.conversation_id ?? undefined,
        });
      }
    }

    setNotifications(items);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime: re-fetch on any new notification_logs entry
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('in-app-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notification_logs' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchNotifications]);

  const markAllSeen = useCallback(() => {
    const now = new Date();
    setLastSeenAt(now);
    localStorage.setItem(SEEN_KEY, now.toISOString());
  }, []);

  const unseenCount = useMemo(
    () => notifications.filter(n => n.timestamp > lastSeenAt).length,
    [notifications, lastSeenAt]
  );

  return { notifications, unseenCount, loading, markAllSeen, refetch: fetchNotifications };
}
