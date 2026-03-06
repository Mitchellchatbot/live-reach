import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, ArrowLeft, Building2, Users, AlertTriangle } from 'lucide-react';
import { AdminStatsCards } from '@/components/admin/AdminStatsCards';
import { AdminClientTable, ClientOverview } from '@/components/admin/AdminClientTable';
import { AdminComplaintsTab } from '@/components/admin/AdminComplaintsTab';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
  role: 'admin' | 'client' | 'agent';
}

interface Complaint {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_email: string;
  property_name: string | null;
  category: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [clients, setClients] = useState<ClientOverview[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [platformStats, setPlatformStats] = useState({
    totalClients: 0, totalAgents: 0, totalConversations: 0, totalProperties: 0,
    activeConversations: 0, totalPhones: 0, totalLeads: 0, openComplaints: 0,
  });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
    else if (!loading && !isAdmin) navigate('/dashboard');
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchClientOverview();
      fetchPlatformStats();
      fetchComplaints();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('user_roles').select('*'),
    ]);

    if (!profiles || !roles) {
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
      return;
    }

    setUsers(profiles.map((p) => {
      const r = roles.find((r) => r.user_id === p.user_id);
      return { ...p, role: (r?.role || 'client') as 'admin' | 'client' | 'agent' };
    }));
    setLoadingUsers(false);
  };

  const fetchComplaints = async () => {
    const { data: rawComplaints } = await supabase.from('agent_complaints').select('*');
    if (!rawComplaints) { setLoadingComplaints(false); return; }

    const agentIds = [...new Set(rawComplaints.map(c => c.agent_id))];
    const propertyIds = [...new Set(rawComplaints.filter(c => c.property_id).map(c => c.property_id!))];

    const [{ data: agents }, { data: props }] = await Promise.all([
      supabase.from('agents').select('id, name, email').in('id', agentIds.length ? agentIds : ['_']),
      supabase.from('properties').select('id, name').in('id', propertyIds.length ? propertyIds : ['_']),
    ]);

    const agentMap = Object.fromEntries((agents || []).map(a => [a.id, a]));
    const propMap = Object.fromEntries((props || []).map(p => [p.id, p]));

    setComplaints(rawComplaints.map(c => ({
      ...c,
      agent_name: agentMap[c.agent_id]?.name || 'Unknown',
      agent_email: agentMap[c.agent_id]?.email || '',
      property_name: c.property_id ? propMap[c.property_id]?.name || null : null,
    })));
    setLoadingComplaints(false);
  };

  const fetchClientOverview = async () => {
    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'client');
    const clientUserIds = roles?.map(r => r.user_id) || [];
    if (clientUserIds.length === 0) { setClients([]); setLoadingClients(false); return; }

    const [{ data: profiles }, { data: properties }, { data: agents }, { data: conversations }, { data: visitors }, { data: agentComplaints }] = await Promise.all([
      supabase.from('profiles').select('*').in('user_id', clientUserIds),
      supabase.from('properties').select('id, user_id, name, domain'),
      supabase.from('agents').select('id, invited_by, name, email, status'),
      supabase.from('conversations').select('id, property_id, status'),
      supabase.from('visitors').select('id, property_id, name, email, phone'),
      supabase.from('agent_complaints').select('id, property_id, status'),
    ]);

    setClients((profiles || []).map(profile => {
      const clientProps = (properties || []).filter(p => p.user_id === profile.user_id);
      const propIds = clientProps.map(p => p.id);
      const clientConvos = (conversations || []).filter(c => propIds.includes(c.property_id));
      const clientVisitors = (visitors || []).filter(v => propIds.includes(v.property_id));
      const clientAgents = (agents || []).filter(a => a.invited_by === profile.user_id);
      const clientComplaints = (agentComplaints || []).filter(c => c.property_id && propIds.includes(c.property_id));

      // Per-property conversation counts
      const propConvoCounts = Object.fromEntries(propIds.map(id => [id, 0]));
      clientConvos.forEach(c => { if (propConvoCounts[c.property_id] !== undefined) propConvoCounts[c.property_id]++; });

      return {
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        company_name: profile.company_name,
        created_at: profile.created_at,
        properties_count: clientProps.length,
        conversations_count: clientConvos.length,
        agents_count: clientAgents.length,
        phones_count: clientVisitors.filter(v => v.phone).length,
        leads_count: clientVisitors.filter(v => v.name || v.email || v.phone).length,
        complaints_count: clientComplaints.length,
        properties: clientProps.map(p => ({ id: p.id, name: p.name, domain: p.domain, conversations_count: propConvoCounts[p.id] || 0 })),
        agents: clientAgents.map(a => ({ name: a.name, email: a.email, status: a.status })),
      };
    }));
    setLoadingClients(false);
  };

  const fetchPlatformStats = async () => {
    const [
      { count: clientCount }, { count: agentCount }, { count: conversationCount },
      { count: activeCount }, { count: propertyCount },
      { data: allVisitors }, { count: openComplaintsCount },
    ] = await Promise.all([
      supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
      supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'agent'),
      supabase.from('conversations').select('*', { count: 'exact', head: true }),
      supabase.from('conversations').select('*', { count: 'exact', head: true }).in('status', ['active', 'pending']),
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('visitors').select('id, phone, name, email'),
      supabase.from('agent_complaints').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    ]);

    setPlatformStats({
      totalClients: clientCount || 0,
      totalAgents: agentCount || 0,
      totalConversations: conversationCount || 0,
      totalProperties: propertyCount || 0,
      activeConversations: activeCount || 0,
      totalPhones: (allVisitors || []).filter(v => v.phone).length,
      totalLeads: (allVisitors || []).filter(v => v.name || v.email || v.phone).length,
      openComplaints: openComplaintsCount || 0,
    });
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'client' | 'agent') => {
    const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('user_id', userId);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update user role', variant: 'destructive' });
      return;
    }
    toast({ title: 'Success', description: 'User role updated successfully' });
    fetchUsers(); fetchClientOverview(); fetchPlatformStats();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'client': return 'secondary';
      case 'agent': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <AdminStatsCards stats={platformStats} />

        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList>
            <TabsTrigger value="clients"><Building2 className="mr-2 h-4 w-4" />Client Overview</TabsTrigger>
            <TabsTrigger value="complaints">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Complaints
              {platformStats.openComplaints > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">{platformStats.openComplaints}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <AdminClientTable clients={clients} loading={loadingClients} />
          </TabsContent>

          <TabsContent value="complaints">
            <AdminComplaintsTab complaints={complaints} loading={loadingComplaints} onRefresh={() => { fetchComplaints(); fetchPlatformStats(); }} />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and roles</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-8 text-muted-foreground">Loading users...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.full_name || 'N/A'}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.company_name || 'N/A'}</TableCell>
                          <TableCell><Badge variant={getRoleBadgeVariant(u.role)}>{u.role}</Badge></TableCell>
                          <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Select value={u.role} onValueChange={(v: 'admin' | 'client' | 'agent') => updateUserRole(u.user_id, v)} disabled={u.user_id === user?.id}>
                              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="client">Client</SelectItem>
                                <SelectItem value="agent">Agent</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
