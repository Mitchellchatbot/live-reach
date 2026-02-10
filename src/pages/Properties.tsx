import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardTour } from '@/components/dashboard/DashboardTour';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Building2, Globe, Plus, Trash2, ExternalLink } from 'lucide-react';

const Properties = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { properties, refetch } = useConversations();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isTourMode = searchParams.get('tour') === '1';

  // Mock data for tour mode on empty accounts
  const mockProperties = useMemo(() => [
    { id: 'mock-1', name: 'alcoholawareness.org', domain: 'alcoholawareness.org', widget_color: 'hsl(255, 100%, 17%)' },
    { id: 'mock-2', name: 'recoveryhelp.com', domain: 'recoveryhelp.com', widget_color: '#22C55E' },
  ], []);

  const displayProperties = isTourMode && properties.length === 0 ? mockProperties : properties;

  const handleAdd = () => {
    navigate('/onboarding');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('properties').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Property deleted');
      refetch?.();
    } catch {
      toast.error('Failed to delete property');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout className="bg-background">
      <DashboardTour />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader title="Properties" tourSection="properties">
          <Button data-tour="properties-add-btn" onClick={handleAdd} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        </PageHeader>

        <main className="flex-1 overflow-y-auto p-6" data-tour="properties-grid">
          {displayProperties.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No properties yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  Add your first website to start receiving and managing live chat conversations.
                </p>
                <Button onClick={() => navigate('/onboarding')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayProperties.map((property) => (
                <Card key={property.id} className="group relative hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${property.widget_color || '#F97316'}18` }}
                        >
                          <Building2 className="h-5 w-5" style={{ color: property.widget_color || '#F97316' }} />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base truncate">{property.name}</CardTitle>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <Globe className="h-3 w-3" />
                            <span className="truncate">{property.domain}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                        onClick={() => window.open(`https://${property.domain}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit Site
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(property.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this property and all associated conversations, visitors, and settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Properties;
