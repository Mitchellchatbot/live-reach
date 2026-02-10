import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { supabase } from '@/integrations/supabase/client';
import { PropertySelector } from '@/components/PropertySelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, Loader2, Bell, Mail, MessageCircle, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface NotificationLog {
  id: string;
  notification_type: string;
  channel: string;
  recipient: string;
  recipient_type: string;
  status: string;
  error_message: string | null;
  visitor_name: string | null;
  created_at: string;
}

interface NotificationSettings {
  emailEnabled: boolean;
  slackEnabled: boolean;
}

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  slack: <MessageCircle className="h-4 w-4" />,
};

const statusIcons: Record<string, React.ReactNode> = {
  sent: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  failed: <XCircle className="h-4 w-4 text-destructive" />,
  skipped: <Clock className="h-4 w-4 text-muted-foreground" />,
};

const typeLabels: Record<string, string> = {
  new_conversation: 'New Chat',
  escalation: 'Escalation',
  phone_collected: 'Phone Collected',
};

const NotificationLogs = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { properties, loading: dataLoading } = useConversations();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({ emailEnabled: false, slackEnabled: false });

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  // Fetch notification settings status
  useEffect(() => {
    if (!selectedPropertyId) return;

    const fetchSettings = async () => {
      const [emailRes, slackRes] = await Promise.all([
        supabase.from('email_notification_settings').select('enabled').eq('property_id', selectedPropertyId).maybeSingle(),
        supabase.from('slack_notification_settings').select('enabled').eq('property_id', selectedPropertyId).maybeSingle(),
      ]);

      setSettings({
        emailEnabled: emailRes.data?.enabled ?? false,
        slackEnabled: slackRes.data?.enabled ?? false,
      });
    };

    fetchSettings();
  }, [selectedPropertyId]);

  // Fetch logs
  useEffect(() => {
    if (!selectedPropertyId) return;

    const fetchLogs = async () => {
      setLogsLoading(true);
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('property_id', selectedPropertyId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setLogs(data as NotificationLog[]);
      }
      setLogsLoading(false);
    };

    fetchLogs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`notification-logs-${selectedPropertyId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notification_logs',
        filter: `property_id=eq.${selectedPropertyId}`,
      }, (payload) => {
        setLogs(prev => [payload.new as NotificationLog, ...prev].slice(0, 100));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedPropertyId]);

  // Toggle notification enable/disable
  const handleToggleEmail = async (enabled: boolean) => {
    const { error } = await supabase
      .from('email_notification_settings')
      .upsert({ property_id: selectedPropertyId, enabled }, { onConflict: 'property_id' });

    if (error) { toast.error('Failed to update email notifications'); return; }
    setSettings(prev => ({ ...prev, emailEnabled: enabled }));
    toast.success(`Email notifications ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleToggleSlack = async (enabled: boolean) => {
    const { error } = await supabase
      .from('slack_notification_settings')
      .upsert({ property_id: selectedPropertyId, enabled }, { onConflict: 'property_id' });

    if (error) { toast.error('Failed to update Slack notifications'); return; }
    setSettings(prev => ({ ...prev, slackEnabled: enabled }));
    toast.success(`Slack notifications ${enabled ? 'enabled' : 'disabled'}`);
  };

  if (authLoading || dataLoading || !user) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader title="Notification Logs" />

        <div className="flex-1 p-2 overflow-hidden">
          <div className="h-full overflow-auto scrollbar-hide rounded-lg border border-border/30 bg-background dark:bg-background/50 dark:backdrop-blur-sm p-6">
            <div className="max-w-5xl mx-auto space-y-6">

              {/* Property Selector */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Select Property</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <PropertySelector
                    properties={properties}
                    selectedPropertyId={selectedPropertyId}
                    onPropertyChange={setSelectedPropertyId}
                    onDeleteProperty={async () => false}
                    showDomain
                    showIcon={false}
                    className="w-full"
                  />
                </CardContent>
              </Card>

              {selectedPropertyId && (
                <>
                  {/* Notification Settings */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base">Notification Settings</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Label>Email Notifications</Label>
                        </div>
                        <Switch checked={settings.emailEnabled} onCheckedChange={handleToggleEmail} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <Label>Slack Notifications</Label>
                        </div>
                        <Switch checked={settings.slackEnabled} onCheckedChange={handleToggleSlack} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Configure recipients and event triggers in the{' '}
                        <a href="/dashboard/notifications" className="text-primary hover:underline">Notifications</a> page.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Activity Log */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-base">Activity Log</CardTitle>
                        </div>
                        <Badge variant="outline">{logs.length} entries</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {logsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Notifications Yet</h3>
                          <p className="text-muted-foreground">
                            Notifications will appear here once visitors start chatting
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Mobile cards */}
                          <div className="md:hidden space-y-3">
                            {logs.map((log) => (
                              <div key={log.id} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {statusIcons[log.status] || statusIcons.sent}
                                    <Badge variant="outline" className="text-xs">
                                      {typeLabels[log.notification_type] || log.notification_type}
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  {channelIcons[log.channel]}
                                  <span className="capitalize">{log.channel}</span>
                                  <span className="text-muted-foreground">→</span>
                                  <span className="truncate">{log.recipient}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="capitalize">{log.recipient_type}</span>
                                  {log.visitor_name && <span>Visitor: {log.visitor_name}</span>}
                                </div>
                                {log.error_message && (
                                  <p className="text-xs text-destructive">{log.error_message}</p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Desktop table */}
                          <div className="hidden md:block">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Channel</TableHead>
                                  <TableHead>Recipient</TableHead>
                                  <TableHead>To</TableHead>
                                  <TableHead>Visitor</TableHead>
                                  <TableHead>Time</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {logs.map((log) => (
                                  <TableRow key={log.id}>
                                    <TableCell>{statusIcons[log.status] || statusIcons.sent}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="text-xs">
                                        {typeLabels[log.notification_type] || log.notification_type}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1.5 capitalize">
                                        {channelIcons[log.channel]}
                                        {log.channel}
                                      </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">{log.recipient}</TableCell>
                                    <TableCell className="capitalize">{log.recipient_type}</TableCell>
                                    <TableCell>{log.visitor_name || '—'}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationLogs;
