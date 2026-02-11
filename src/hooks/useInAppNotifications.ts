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

    // Fetch properties first for name lookup
    const { data: properties } = await supabase
      .from('properties')
      .select('id, name, created_at');

    const propMap = new Map((properties || []).map(p => [p.id, p.name]));

    const [convResult, logsResult] = await Promise.all([
      supabase
        .from('conversations')
        .select('id, status, created_at, property_id, visitor_id')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('notification_logs')
        .select('id, notification_type, channel, status, visitor_name, created_at, property_id, conversation_id')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const items: InAppNotification[] = [];

    // New conversations
    if (convResult.data) {
      for (const c of convResult.data) {
        const propName = propMap.get(c.property_id) || 'Unknown';
        items.push({
          id: `conv-${c.id}`,
          type: 'new_chat',
          title: 'New Conversation',
          description: `A visitor started a chat on ${propName}`,
          timestamp: new Date(c.created_at),
          propertyName: propName,
          conversationId: c.id,
        });
      }
    }

    // Notification logs — map all types
    if (logsResult.data) {
      for (const log of logsResult.data) {
        const propName = propMap.get(log.property_id) || 'Unknown';
        const visitor = log.visitor_name || 'A visitor';
        const nt = log.notification_type;
        const ch = log.channel;
        const failed = log.status === 'failed';

        let mapped: { type: NotificationType; title: string; description: string } | null = null;

        if (nt === 'escalation') {
          mapped = { type: 'escalation', title: 'Escalation Alert', description: `${visitor} needs human help on ${propName}` };
        } else if (nt === 'phone_submission') {
          mapped = { type: 'phone_captured', title: 'Phone Number Captured', description: `${visitor} shared their phone on ${propName}` };
        } else if (nt === 'new_conversation') {
          // Already covered by conversations query — skip to avoid duplicates
          continue;
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
          // Catch-all for any other log types
          mapped = { type: failed ? 'email_failed' : 'new_message', title: nt?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Notification', description: `${nt} on ${propName}` };
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

    // New properties
    if (properties) {
      for (const p of properties) {
        if (new Date(p.created_at) >= since) {
          items.push({
            id: `prop-${p.id}`,
            type: 'property_added',
            title: 'Property Added',
            description: `${p.name} was added to your account`,
            timestamp: new Date(p.created_at),
            propertyName: p.name,
          });
        }
      }
    }

    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setNotifications(items.slice(0, 50));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime: listen for new conversations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('in-app-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, (payload) => {
        const c = payload.new as any;
        setNotifications(prev => [{
          id: `conv-${c.id}`,
          type: 'new_chat' as const,
          title: 'New Conversation',
          description: 'A new chat just started',
          timestamp: new Date(c.created_at),
          conversationId: c.id,
        }, ...prev].slice(0, 50));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notification_logs' }, () => {
        // Re-fetch to pick up any new log type with full context
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

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
