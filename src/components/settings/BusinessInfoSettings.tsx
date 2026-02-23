import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Phone, Mail, MapPin, Clock, FileText, Image, Building2, Info } from 'lucide-react';

interface BusinessInfoSettingsProps {
  propertyId?: string;
  bulkPropertyIds?: string[];
}

interface BusinessInfo {
  business_phone: string;
  business_email: string;
  business_address: string;
  business_hours: string;
  business_description: string;
  business_logo_url: string;
}

const emptyInfo: BusinessInfo = {
  business_phone: '',
  business_email: '',
  business_address: '',
  business_hours: '',
  business_description: '',
  business_logo_url: '',
};

export const BusinessInfoSettings = ({ propertyId, bulkPropertyIds }: BusinessInfoSettingsProps) => {
  const [info, setInfo] = useState<BusinessInfo>(emptyInfo);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rescanning, setRescanning] = useState(false);
  const [propertyDomain, setPropertyDomain] = useState<string | null>(null);

  const isBulk = !propertyId && !!bulkPropertyIds?.length;

  useEffect(() => {
    if (!propertyId) {
      setInfo(emptyInfo);
      return;
    }
    const fetchInfo = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('business_phone, business_email, business_address, business_hours, business_description, business_logo_url, domain')
        .eq('id', propertyId)
        .single();
      if (!error && data) {
        setInfo({
          business_phone: (data as any).business_phone || '',
          business_email: (data as any).business_email || '',
          business_address: (data as any).business_address || '',
          business_hours: (data as any).business_hours || '',
          business_description: (data as any).business_description || '',
          business_logo_url: (data as any).business_logo_url || '',
        });
        setPropertyDomain(data.domain);
      }
      setLoading(false);
    };
    fetchInfo();
  }, [propertyId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const ids = isBulk ? bulkPropertyIds! : [propertyId!];
      for (const id of ids) {
        const { error } = await supabase
          .from('properties')
          .update({
            business_phone: info.business_phone || null,
            business_email: info.business_email || null,
            business_address: info.business_address || null,
            business_hours: info.business_hours || null,
            business_description: info.business_description || null,
            business_logo_url: info.business_logo_url || null,
          } as any)
          .eq('id', id);
        if (error) throw error;
      }
      toast.success(isBulk ? `Saved to ${ids.length} properties` : 'Business info saved');
    } catch {
      toast.error('Failed to save business info');
    } finally {
      setSaving(false);
    }
  };

  const handleRescan = async () => {
    const domain = propertyDomain;
    if (!domain) {
      toast.error('No domain found for this property');
      return;
    }
    setRescanning(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('extract-website-info', {
        body: { url: domain },
      });
      if (error) throw error;
      if (result?.success && result?.data) {
        const d = result.data;
        setInfo(prev => ({
          ...prev,
          business_phone: d.businessPhone || prev.business_phone,
          business_email: d.businessEmail || prev.business_email,
          business_address: d.businessAddress || prev.business_address,
          business_hours: d.businessHours || prev.business_hours,
          business_description: d.description || prev.business_description,
          business_logo_url: d.logo || prev.business_logo_url,
        }));
        toast.success('Website re-scanned! Review the updated fields and save.');
      } else {
        toast.info('Scan complete but no new info was found.');
      }
    } catch {
      toast.error('Failed to re-scan website');
    } finally {
      setRescanning(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Business Information</CardTitle>
          </div>
          {!isBulk && propertyId && (
            <Button variant="outline" size="sm" onClick={handleRescan} disabled={rescanning} className="gap-1.5">
              {rescanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Re-scan Website
            </Button>
          )}
        </div>
        <CardDescription>
          {isBulk
            ? 'Set business information for all properties at once'
            : 'Auto-populated from your website. Edit as needed.'}
        </CardDescription>
        {isBulk && (
          <Badge variant="secondary" className="w-fit mt-1">
            <Info className="h-3 w-3 mr-1" />
            Bulk mode — {bulkPropertyIds!.length} properties
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              Phone Number
            </Label>
            <Input
              placeholder="(555) 123-4567"
              value={info.business_phone}
              onChange={e => setInfo(prev => ({ ...prev, business_phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email
            </Label>
            <Input
              type="email"
              placeholder="info@company.com"
              value={info.business_email}
              onChange={e => setInfo(prev => ({ ...prev, business_email: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            Address
          </Label>
          <Input
            placeholder="123 Main St, City, ST 12345"
            value={info.business_address}
            onChange={e => setInfo(prev => ({ ...prev, business_address: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            Hours of Operation
          </Label>
          <Input
            placeholder="Mon-Fri 9am-5pm"
            value={info.business_hours}
            onChange={e => setInfo(prev => ({ ...prev, business_hours: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-sm">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            Business Description
          </Label>
          <Textarea
            placeholder="A short description of your business..."
            value={info.business_description}
            onChange={e => setInfo(prev => ({ ...prev, business_description: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-sm">
            <Image className="h-3.5 w-3.5 text-muted-foreground" />
            Logo URL
          </Label>
          <div className="flex items-center gap-3">
            <Input
              placeholder="https://example.com/logo.png"
              value={info.business_logo_url}
              onChange={e => setInfo(prev => ({ ...prev, business_logo_url: e.target.value }))}
              className="flex-1"
            />
            {info.business_logo_url && (
              <img
                src={info.business_logo_url}
                alt="Logo preview"
                className="h-10 w-10 rounded-md object-contain border border-border"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isBulk ? `Save to All ${bulkPropertyIds!.length} Properties` : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};
