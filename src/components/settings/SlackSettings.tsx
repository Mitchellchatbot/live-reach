import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Eye, EyeOff, Link2, ExternalLink } from 'lucide-react';

interface SlackSettingsProps {
  propertyId: string;
}

interface SlackConfig {
  id: string;
  enabled: boolean;
  webhook_url: string;
  channel_name: string;
  notify_on_new_conversation: boolean;
  notify_on_escalation: boolean;
}

export const SlackSettings = ({ propertyId }: SlackSettingsProps) => {
  const [config, setConfig] = useState<SlackConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWebhookUrl, setShowWebhookUrl] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [propertyId]);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('slack_notification_settings')
      .select('*')
      .eq('property_id', propertyId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching Slack settings:', error);
      toast.error('Failed to load Slack settings');
      setLoading(false);
      return;
    }

    if (data) {
      setConfig({
        id: data.id,
        enabled: data.enabled,
        webhook_url: data.webhook_url || '',
        channel_name: data.channel_name || '',
        notify_on_new_conversation: data.notify_on_new_conversation,
        notify_on_escalation: data.notify_on_escalation,
      });
    } else {
      setConfig(null);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const settingsData = {
      property_id: propertyId,
      enabled: config?.enabled ?? false,
      webhook_url: config?.webhook_url || null,
      channel_name: config?.channel_name || null,
      notify_on_new_conversation: config?.notify_on_new_conversation ?? true,
      notify_on_escalation: config?.notify_on_escalation ?? true,
    };

    let result;
    if (config?.id) {
      result = await supabase
        .from('slack_notification_settings')
        .update(settingsData)
        .eq('id', config.id);
    } else {
      result = await supabase
        .from('slack_notification_settings')
        .insert(settingsData)
        .select()
        .single();
    }

    setSaving(false);

    if (result.error) {
      console.error('Error saving Slack settings:', result.error);
      toast.error('Failed to save Slack settings');
      return;
    }

    if (!config?.id && result.data) {
      setConfig({
        ...settingsData,
        id: result.data.id,
        webhook_url: config?.webhook_url || '',
        channel_name: config?.channel_name || '',
      });
    }

    toast.success('Slack settings saved');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Slack Integration</CardTitle>
              <CardDescription>
                Receive notifications in Slack when new conversations start
              </CardDescription>
            </div>
            <Badge variant={config?.webhook_url ? 'default' : 'secondary'}>
              {config?.webhook_url ? 'Configured' : 'Not Configured'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Webhook URL */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook_url">Webhook URL</Label>
              <div className="relative">
                <Input
                  id="webhook_url"
                  type={showWebhookUrl ? 'text' : 'password'}
                  placeholder="https://hooks.slack.com/services/..."
                  value={config?.webhook_url || ''}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, webhook_url: e.target.value } : {
                    id: '',
                    enabled: false,
                    webhook_url: e.target.value,
                    channel_name: '',
                    notify_on_new_conversation: true,
                    notify_on_escalation: true,
                  })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowWebhookUrl(!showWebhookUrl)}
                >
                  {showWebhookUrl ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Create an incoming webhook in your Slack workspace settings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel_name">Channel Name (optional)</Label>
              <Input
                id="channel_name"
                type="text"
                placeholder="#customer-support"
                value={config?.channel_name || ''}
                onChange={(e) => setConfig(prev => prev ? { ...prev, channel_name: e.target.value } : {
                  id: '',
                  enabled: false,
                  webhook_url: '',
                  channel_name: e.target.value,
                  notify_on_new_conversation: true,
                  notify_on_escalation: true,
                })}
              />
              <p className="text-xs text-muted-foreground">
                For your reference only - the channel is determined by the webhook
              </p>
            </div>
          </div>

          {/* Help link */}
          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground flex-1">
              Need help setting up a Slack webhook?
            </p>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://api.slack.com/messaging/webhooks" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
              >
                View Guide
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Triggers</CardTitle>
          <CardDescription>
            Choose when to receive Slack notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Slack Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Turn on/off all Slack notifications
              </p>
            </div>
            <Switch
              checked={config?.enabled ?? false}
              onCheckedChange={(checked) => setConfig(prev => prev ? { ...prev, enabled: checked } : {
                id: '',
                enabled: checked,
                webhook_url: '',
                channel_name: '',
                notify_on_new_conversation: true,
                notify_on_escalation: true,
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Conversation</Label>
              <p className="text-sm text-muted-foreground">
                Notify when a new chat conversation starts
              </p>
            </div>
            <Switch
              checked={config?.notify_on_new_conversation ?? true}
              onCheckedChange={(checked) => setConfig(prev => prev ? { ...prev, notify_on_new_conversation: checked } : null)}
              disabled={!config?.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Escalation</Label>
              <p className="text-sm text-muted-foreground">
                Notify when a conversation is escalated to a human agent
              </p>
            </div>
            <Switch
              checked={config?.notify_on_escalation ?? true}
              onCheckedChange={(checked) => setConfig(prev => prev ? { ...prev, notify_on_escalation: checked } : null)}
              disabled={!config?.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Slack Settings
        </Button>
      </div>
    </div>
  );
};
