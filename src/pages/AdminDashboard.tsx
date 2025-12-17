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
import { Users, Shield, ArrowLeft, Building2, MessageSquare, BarChart3, Globe } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
  role: 'admin' | 'client' | 'agent';
}

interface ClientOverview {
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
  properties_count: number;
  conversations_count: number;
  agents_count: number;
}

interface PlatformStats {
  totalClients: number;
  totalAgents: number;
  totalConversations: number;
  totalProperties: number;
  activeConversations: number;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [clients, setClients] = useState<ClientOverview[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalClients: 0,
    totalAgents: 0,
    totalConversations: 0,
    totalProperties: 0,
    activeConversations: 0,
  });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchClientOverview();
      fetchPlatformStats();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) {
      toast({
        title: 'Error',
        description: 'Failed to load user roles',
        variant: 'destructive',
      });
      return;
    }

    const usersWithRoles = profiles.map((profile) => {
      const userRole = roles.find((r) => r.user_id === profile.user_id);
      return {
        ...profile,
        role: (userRole?.role || 'client') as 'admin' | 'client' | 'agent',
      };
    });

    setUsers(usersWithRoles);
    setLoadingUsers(false);
  };

  const fetchClientOverview = async () => {
    // Get all profiles with client role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'client');

    const clientUserIds = roles?.map(r => r.user_id) || [];

    if (clientUserIds.length === 0) {
      setClients([]);
      setLoadingClients(false);
      return;
    }

    // Get profiles for clients
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', clientUserIds);

    // Get properties count per client
    const { data: properties } = await supabase
      .from('properties')
      .select('user_id, id');

    // Get agents count per client
    const { data: agents } = await supabase
      .from('agents')
      .select('invited_by, id');

    // Get conversations count per client (through properties)
    const { data: conversations } = await supabase
      .from('conversations')
      .select('property_id, id, status');

    const clientOverviews: ClientOverview[] = (profiles || []).map(profile => {
      const clientProperties = properties?.filter(p => p.user_id === profile.user_id) || [];
      const propertyIds = clientProperties.map(p => p.id);
      const clientConversations = conversations?.filter(c => propertyIds.includes(c.property_id)) || [];
      const clientAgents = agents?.filter(a => a.invited_by === profile.user_id) || [];

      return {
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        company_name: profile.company_name,
        created_at: profile.created_at,
        properties_count: clientProperties.length,
        conversations_count: clientConversations.length,
        agents_count: clientAgents.length,
      };
    });

    setClients(clientOverviews);
    setLoadingClients(false);
  };

  const fetchPlatformStats = async () => {
    // Count clients
    const { count: clientCount } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client');

    // Count agents
    const { count: agentCount } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'agent');

    // Count conversations
    const { count: conversationCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    // Count active conversations
    const { count: activeConversationCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'pending']);

    // Count properties
    const { count: propertyCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    setPlatformStats({
      totalClients: clientCount || 0,
      totalAgents: agentCount || 0,
      totalConversations: conversationCount || 0,
      totalProperties: propertyCount || 0,
      activeConversations: activeConversationCount || 0,
    });
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'client' | 'agent') => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'User role updated successfully',
    });

    fetchUsers();
    fetchClientOverview();
    fetchPlatformStats();
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
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Platform Stats */}
        <div className="grid gap-4 md:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalClients}</div>
              <p className="text-xs text-muted-foreground">Website owners</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalAgents}</div>
              <p className="text-xs text-muted-foreground">Chat representatives</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">Websites with widget</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalConversations}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{platformStats.activeConversations}</div>
              <p className="text-xs text-muted-foreground">Active & pending</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList>
            <TabsTrigger value="clients">
              <Building2 className="mr-2 h-4 w-4" />
              Client Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              User Management
            </TabsTrigger>
          </TabsList>

          {/* Client Overview Tab */}
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Client Overview</CardTitle>
                <CardDescription>View performance metrics for all clients</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingClients ? (
                  <div className="text-center py-8 text-muted-foreground">Loading clients...</div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No clients yet</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-center">Properties</TableHead>
                        <TableHead className="text-center">Agents</TableHead>
                        <TableHead className="text-center">Conversations</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.user_id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{client.full_name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{client.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{client.company_name || 'N/A'}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{client.properties_count}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{client.agents_count}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default">{client.conversations_count}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(client.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
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
                      {users.map((userProfile) => (
                        <TableRow key={userProfile.id}>
                          <TableCell className="font-medium">
                            {userProfile.full_name || 'N/A'}
                          </TableCell>
                          <TableCell>{userProfile.email}</TableCell>
                          <TableCell>{userProfile.company_name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(userProfile.role)}>
                              {userProfile.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(userProfile.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={userProfile.role}
                              onValueChange={(value: 'admin' | 'client' | 'agent') =>
                                updateUserRole(userProfile.user_id, value)
                              }
                              disabled={userProfile.user_id === user?.id}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
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