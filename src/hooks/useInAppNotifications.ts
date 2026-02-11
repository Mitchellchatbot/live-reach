import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface InAppNotification {
  id: string;
  type: 'new_chat' | 'escalation' | 'phone_captured' | 'property_added' | 'new_message';
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

    // Fetch recent conversations (new chats) from user's properties
    const since = new Date();
    since.setDate(since.getDate() - 7); // last 7 days

    const [convResult, logsResult, propsResult] = await Promise.all([
      supabase
        .from('conversations')
        .select('id, status, created_at, property_id, visitor_id, visitors!inner(name), properties!inner(name)')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('notification_logs')
        .select('id, notification_type, channel, visitor_name, created_at, property_id, properties!inner(name)')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('properties')
        .select('id, name, created_at')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    const items: InAppNotification[] = [];

    // New conversations
    if (convResult.data) {
      for (const c of convResult.data) {
        const propName = (c as any).properties?.name || 'Unknown';
        const visitorName = (c as any).visitors?.name || 'A visitor';
        items.push({
          id: `conv-${c.id}`,
          type: 'new_chat',
          title: 'New Conversation',
          description: `${visitorName} started a chat on ${propName}`,
          timestamp: new Date(c.created_at),
          propertyName: propName,
          conversationId: c.id,
        });
      }
    }

    // Notification logs (escalations, phone submissions)
    if (logsResult.data) {
      for (const log of logsResult.data) {
        const propName = (log as any).properties?.name || 'Unknown';
        const notifType = log.notification_type;
        if (notifType === 'escalation') {
          items.push({
            id: `log-${log.id}`,
            type: 'escalation',
            title: 'Escalation Alert',
            description: `${log.visitor_name || 'A visitor'} needs human help on ${propName}`,
            timestamp: new Date(log.created_at),
            propertyName: propName,
          });
        } else if (notifType === 'phone_submission') {
          items.push({
            id: `log-${log.id}`,
            type: 'phone_captured',
            title: 'Phone Number Captured',
            description: `${log.visitor_name || 'A visitor'} shared their phone on ${propName}`,
            timestamp: new Date(log.created_at),
            propertyName: propName,
          });
        }
      }
    }

    // New properties
    if (propsResult.data) {
      for (const p of propsResult.data) {
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

    // Sort by timestamp descending
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notification_logs' }, (payload) => {
        const log = payload.new as any;
        if (log.notification_type === 'escalation') {
          setNotifications(prev => [{
            id: `log-${log.id}`,
            type: 'escalation' as const,
            title: 'Escalation Alert',
            description: `${log.visitor_name || 'A visitor'} needs human help`,
            timestamp: new Date(log.created_at),
          }, ...prev].slice(0, 50));
        }
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
