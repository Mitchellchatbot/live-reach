import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Plus, Trash2, Mail } from 'lucide-react';

interface EmailSettingsProps {
  propertyId: string;
}

interface EmailConfig {
  id: string;
  enabled: boolean;
  notification_emails: string[];
  notify_on_new_conversation: boolean;
  notify_on_escalation: boolean;
}

export const EmailSettings = ({ propertyId }: EmailSettingsProps) => {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [propertyId]);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('email_notification_settings')
      .select('*')
      .eq('property_id', propertyId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching Email settings:', error);
      toast.error('Failed to load Email settings');
      setLoading(false);
      return;
    }

    if (data) {
      setConfig({
        id: data.id,
        enabled: data.enabled,
        notification_emails: data.notification_emails || [],
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
      notification_emails: config?.notification_emails || [],
      notify_on_new_conversation: config?.notify_on_new_conversation ?? true,
      notify_on_escalation: config?.notify_on_escalation ?? true,
    };

    let result;
    if (config?.id) {
      result = await supabase
        .from('email_notification_settings')
        .update(settingsData)
        .eq('id', config.id);
    } else {
      result = await supabase
        .from('email_notification_settings')
        .insert(settingsData)
        .select()
        .single();
    }

    setSaving(false);

    if (result.error) {
      console.error('Error saving Email settings:', result.error);
      toast.error('Failed to save Email settings');
      return;
    }

    if (!config?.id && result.data) {
      setConfig({
        ...settingsData,
        id: result.data.id,
      });
    }

    toast.success('Email settings saved');
  };

  const addEmail = () => {
    if (!newEmail.trim()) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    const emails = config?.notification_emails || [];
    if (emails.includes(newEmail.trim().toLowerCase())) {
      toast.error('Email already added');
      return;
    }

    setConfig(prev => prev ? {
      ...prev,
      notification_emails: [...prev.notification_emails, newEmail.trim().toLowerCase()],
    } : {
      id: '',
      enabled: false,
      notification_emails: [newEmail.trim().toLowerCase()],
      notify_on_new_conversation: true,
      notify_on_escalation: true,
    });
    setNewEmail('');
  };

  const removeEmail = (email: string) => {
    setConfig(prev => prev ? {
      ...prev,
      notification_emails: prev.notification_emails.filter(e => e !== email),
    } : null);
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
      {/* Email Recipients */}
      <Card data-tour="email-recipients">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Receive email notifications for new conversations
              </CardDescription>
            </div>
            <Badge variant={(config?.notification_emails?.length ?? 0) > 0 ? 'default' : 'secondary'}>
              {(config?.notification_emails?.length ?? 0) > 0 
                ? `${config?.notification_emails.length} recipient${config?.notification_emails.length === 1 ? '' : 's'}` 
                : 'No Recipients'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Email */}
          <div className="space-y-2">
            <Label>Notification Recipients</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="team@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEmail()}
              />
              <Button onClick={addEmail} variant="secondary">
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add email addresses to receive notifications
            </p>
          </div>

          {/* Email List */}
          {(config?.notification_emails?.length ?? 0) > 0 && (
            <div className="space-y-2">
              {config?.notification_emails.map((email) => (
                <div 
                  key={email} 
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEmail(email)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {(config?.notification_emails?.length ?? 0) === 0 && (
            <div className="flex flex-col items-center gap-2 py-6 border rounded-lg bg-muted/50">
              <Mail className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground text-center">
                No email recipients added yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card data-tour="email-triggers">
        <CardHeader>
          <CardTitle>Notification Triggers</CardTitle>
          <CardDescription>
            Choose when to receive email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Turn on/off all email notifications
              </p>
            </div>
            <Switch
              checked={config?.enabled ?? false}
              onCheckedChange={(checked) => setConfig(prev => prev ? { ...prev, enabled: checked } : {
                id: '',
                enabled: checked,
                notification_emails: [],
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
          Save Email Settings
        </Button>
      </div>
    </div>
  );
};
