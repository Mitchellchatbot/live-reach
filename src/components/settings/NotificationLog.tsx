import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface NotificationLogProps {
  propertyId: string;
}

interface LogEntry {
  id: string;
  notification_type: string;
  channel: string;
  recipient: string;
  recipient_type: string;
  status: string;
  visitor_name: string | null;
  error_message: string | null;
  created_at: string;
}

export const NotificationLog = ({ propertyId }: NotificationLogProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notification_logs')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [propertyId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`notification-logs-${propertyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_logs',
          filter: `property_id=eq.${propertyId}`,
        },
        (payload) => {
          setLogs((prev) => [payload.new as LogEntry, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const channelLabel = (ch: string) => {
    switch (ch) {
      case 'slack': return 'Slack';
      case 'email': return 'Email';
      case 'sms': return 'SMS';
      default: return ch;
    }
  };

  const typeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notification Activity</CardTitle>
            <CardDescription>Recent notification delivery log</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No notifications sent yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-auto scrollbar-hide">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-border/50 bg-muted/30"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {channelLabel(log.channel)}
                    </Badge>
                    <span className="text-sm font-medium truncate">
                      {typeLabel(log.notification_type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span className="truncate">To: {log.recipient}</span>
                    {log.visitor_name && (
                      <span className="truncate">• Visitor: {log.visitor_name}</span>
                    )}
                  </div>
                  {log.error_message && (
                    <p className="text-xs text-destructive truncate">{log.error_message}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusColor(log.status)} className="text-xs capitalize">
                    {log.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
