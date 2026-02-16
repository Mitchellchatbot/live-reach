import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { DashboardTour } from '@/components/dashboard/DashboardTour';
import { PageHeader, HeaderButton } from '@/components/dashboard/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, Mail, Loader2, Trash2, RefreshCw, Send, Upload, Bot, Globe, ChevronDown, Save, KeyRound } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Agent {
  id: string;
  name: string;
  email: string;
  status: string;
  invitation_status: string;
  user_id: string;
  assigned_properties: string[];
  avatar_url?: string;
}

const TeamMembers = () => {
  const { user } = useAuth();
  const { properties } = useConversations();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createName, setCreateName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createPropertyIds, setCreatePropertyIds] = useState<string[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteAgentId, setDeleteAgentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [uploadingAvatarFor, setUploadingAvatarFor] = useState<string | null>(null);
  const [creatingAIForId, setCreatingAIForId] = useState<string | null>(null);
  const [linkedAIAgents, setLinkedAIAgents] = useState<Record<string, string>>({}); // agent_id -> ai_name

  const [searchParams] = useSearchParams();
  const isTourActive = searchParams.get('tour') === '1';

  // Demo agents shown during tour when no real agents exist
  const demoAgents: Agent[] = useMemo(() => [
    {
      id: 'demo-1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      status: 'online',
      invitation_status: 'accepted',
      user_id: 'demo',
      assigned_properties: properties.slice(0, 1).map(p => p.id),
      avatar_url: undefined,
    },
    {
      id: 'demo-2',
      name: 'Michael Chen',
      email: 'michael@example.com',
      status: 'offline',
      invitation_status: 'accepted',
      user_id: 'demo',
      assigned_properties: [],
      avatar_url: undefined,
    },
  ], [properties]);

  // Use demo agents during tour if no real agents exist
  const displayAgents = (isTourActive && agents.length === 0) ? demoAgents : agents;
  const isDemoMode = isTourActive && agents.length === 0;

  useEffect(() => {
    fetchAgents();
    fetchLinkedAIAgents();
  }, [user]);

  // Real-time agent status updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('team-agent-status')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'agents' },
        (payload) => {
          const updated = payload.new as any;
          setAgents(prev => prev.map(a => 
            a.id === updated.id ? { ...a, status: updated.status, invitation_status: updated.invitation_status || a.invitation_status } : a
          ));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchLinkedAIAgents = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_agents')
      .select('id, name, linked_agent_id')
      .eq('owner_id', user.id)
      .not('linked_agent_id', 'is', null);

    if (!error && data) {
      const map: Record<string, string> = {};
      data.forEach(ai => {
        if (ai.linked_agent_id) {
          map[ai.linked_agent_id] = ai.name;
        }
      });
      setLinkedAIAgents(map);
    }
  };

  const fetchAgents = async () => {
    if (!user) return;

    setLoading(true);
    
    const { data: agentsData, error: agentsError } = await supabase
      .from('agents')
      .select('*')
      .eq('invited_by', user.id);

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      setLoading(false);
      return;
    }

    const agentIds = agentsData?.map(a => a.id) || [];
    const { data: assignmentsData } = await supabase
      .from('property_agents')
      .select('agent_id, property_id')
      .in('agent_id', agentIds.length > 0 ? agentIds : ['none']);

    const agentsWithAssignments: Agent[] = (agentsData || []).map(agent => {
      const assignments = assignmentsData?.filter(a => a.agent_id === agent.id) || [];
      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        status: agent.status,
        invitation_status: agent.invitation_status || 'accepted',
        user_id: agent.user_id,
        assigned_properties: assignments.map(a => a.property_id),
        avatar_url: agent.avatar_url,
      };
    });

    setAgents(agentsWithAssignments);
    setLoading(false);
  };

  const sendInvitationEmail = async (agentId: string, agentName: string, agentEmail: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user?.id)
      .maybeSingle();

    const { data, error } = await supabase.functions.invoke('send-agent-invitation', {
      body: {
        agentId,
        agentName,
        agentEmail,
        inviterName: profile?.full_name || 'A team member',
        appUrl: window.location.origin,
      },
    });

    if (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }

    return data;
  };

  const handleInviteAgent = async () => {
    if (!inviteEmail.trim() || !inviteName.trim() || !user) return;

    const email = inviteEmail.trim().toLowerCase();
    const name = inviteName.trim();

    setIsInviting(true);

    try {
      const { data: existingAgent } = await supabase
        .from('agents')
        .select('id')
        .eq('email', email)
        .eq('invited_by', user.id)
        .maybeSingle();

      if (existingAgent) {
        toast.error('This email has already been invited');
        setIsInviting(false);
        return;
      }

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .maybeSingle();

      const { data: newAgent, error: agentError } = await supabase
        .from('agents')
        .insert({
          name,
          email,
          user_id: existingProfile?.user_id || crypto.randomUUID(),
          invited_by: user.id,
          invitation_status: 'pending',
          status: 'offline',
        })
        .select()
        .single();

      if (agentError) {
        toast.error('Failed to invite agent: ' + agentError.message);
        setIsInviting(false);
        return;
      }

      if (selectedPropertyIds.length > 0 && newAgent) {
        const assignments = selectedPropertyIds.map((propertyId) => ({
          agent_id: newAgent.id,
          property_id: propertyId,
        }));

        await supabase.from('property_agents').insert(assignments);
      }

      try {
        await sendInvitationEmail(newAgent.id, name, email);
        toast.success('Invitation sent! They will receive an email to join.');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        const message = emailError instanceof Error ? emailError.message : String(emailError);
        toast.error(`Email failed to send: ${message}`);
      }

      // Log invitation_sent notification
      if (newAgent && user) {
        const propId = selectedPropertyIds[0] || null;
        // We need at least one property_id for the notification log; use first assigned or fetch one
        let notifPropertyId = propId;
        if (!notifPropertyId) {
          const { data: firstProp } = await supabase
            .from('properties')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();
          notifPropertyId = firstProp?.id || null;
        }
        if (notifPropertyId) {
          await supabase.from('notification_logs').insert({
            property_id: notifPropertyId,
            notification_type: 'invitation_sent',
            channel: 'in_app',
            recipient: 'system',
            recipient_type: 'system',
            status: 'sent',
            visitor_name: name,
          });
        }
      }

      setIsInviteDialogOpen(false);
      setInviteEmail('');
      setInviteName('');
      setSelectedPropertyIds([]);
      fetchAgents();
    } catch (error) {
      console.error('Error inviting agent:', error);
      toast.error('Failed to invite agent');
    }

    setIsInviting(false);
  };

  const handleCreateAccount = async () => {
    if (!createEmail.trim() || !createName.trim() || !createPassword.trim() || !user) return;

    setIsCreating(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-agent-account', {
        body: {
          agentName: createName.trim(),
          agentEmail: createEmail.trim().toLowerCase(),
          password: createPassword,
          invitedBy: user.id,
          propertyIds: createPropertyIds,
        },
      });

      if (error) {
        console.error('Error creating account:', error);
        toast.error('Failed to create account: ' + error.message);
        setIsCreating(false);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setIsCreating(false);
        return;
      }

      toast.success(`Agent account created! They can now sign in with email: ${createEmail.trim()} and the password you set.`);
      setIsCreateDialogOpen(false);
      setCreateEmail('');
      setCreateName('');
      setCreatePassword('');
      setCreatePropertyIds([]);
      fetchAgents();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create agent account');
    }

    setIsCreating(false);
  };

  const handleResendInvitation = async (agent: Agent) => {
    setResendingId(agent.id);
    
    try {
      await sendInvitationEmail(agent.id, agent.name, agent.email);
      toast.success('Invitation resent successfully!');
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      toast.error('Failed to resend invitation');
    }

    setResendingId(null);
  };

  const handleRemoveAgent = async () => {
    if (!deleteAgentId) return;
    
    setIsDeleting(true);
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', deleteAgentId);

    if (error) {
      toast.error('Failed to remove agent');
      setIsDeleting(false);
      return;
    }

    toast.success('Agent removed');
    setDeleteAgentId(null);
    setIsDeleting(false);
    fetchAgents();
  };

  const handleToggleProperty = async (agentId: string, propertyId: string, isAssigned: boolean) => {
    if (isAssigned) {
      await supabase
        .from('property_agents')
        .delete()
        .eq('agent_id', agentId)
        .eq('property_id', propertyId);
    } else {
      await supabase
        .from('property_agents')
        .insert({ agent_id: agentId, property_id: propertyId });
    }
    
    fetchAgents();
  };

  const handleAvatarUpload = async (agentId: string, file: File) => {
    if (!user) return;

    setUploadingAvatarFor(agentId);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `human-${agentId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('agent-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
          toast.error('Avatar storage not configured. Please contact support.');
          setUploadingAvatarFor(null);
          return;
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('agent-avatars')
        .getPublicUrl(filePath);

      await supabase
        .from('agents')
        .update({ avatar_url: publicUrl })
        .eq('id', agentId);
      fetchAgents();

      toast.success('Avatar uploaded!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    }

    setUploadingAvatarFor(null);
  };


  const handleCreateAIFromAgent = async (agent: Agent) => {
    if (!user) return;

    // Check if AI already linked to this agent
    if (linkedAIAgents[agent.id]) {
      toast.error(`AI persona "${linkedAIAgents[agent.id]}" is already linked to this agent`);
      return;
    }

    setCreatingAIForId(agent.id);

    try {
      const { data: newAI, error } = await supabase
        .from('ai_agents')
        .insert({
          name: agent.name,
          avatar_url: agent.avatar_url || null,
          owner_id: user.id,
          status: 'active',
          linked_agent_id: agent.id,
        })
        .select()
        .single();

      if (error) {
        toast.error('Failed to create AI persona: ' + error.message);
        setCreatingAIForId(null);
        return;
      }

      toast.success(`AI persona "${agent.name}" created!`);
      fetchLinkedAIAgents();
    } catch (error) {
      console.error('Error creating AI from agent:', error);
      toast.error('Failed to create AI persona');
    }

    setCreatingAIForId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-primary';
      case 'away': return 'bg-primary/60';
      default: return 'bg-muted-foreground/40';
    }
  };

  const getInvitationBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-primary border-primary">Pending</Badge>;
      case 'accepted': return <Badge variant="outline" className="text-primary border-primary">Active</Badge>;
      case 'revoked': return <Badge variant="outline" className="text-destructive border-destructive">Revoked</Badge>;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <PageHeader title="Team Members" docsLink="/documentation/team/inviting-agents" tourSection="team">
          <HeaderButton size="icon" onClick={fetchAgents}>
            <RefreshCw className="h-4 w-4" />
          </HeaderButton>
          <HeaderButton onClick={() => { fetchAgents(); toast.success('Changes saved'); }}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </HeaderButton>
        </PageHeader>

        {/* Content */}
        <div className="flex-1 p-2 overflow-hidden">
          <div className="h-full overflow-auto scrollbar-hide rounded-lg border border-border/30 bg-background dark:bg-background/50 dark:backdrop-blur-sm p-3 md:p-6">
            <div className="max-w-4xl mx-auto">
          {isDemoMode && (
            <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
              <span className="font-medium text-primary">Tour Mode:</span> Showing sample agents. Your real team will appear here once you invite agents.
            </div>
          )}
          <Card data-tour="team-table">
            <CardHeader className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Team Members</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Agents can respond to conversations on assigned properties
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                {/* Create Account Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-tour="create-account-btn" size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                      <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                      Create Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-base">Create Agent Account</DialogTitle>
                      <DialogDescription className="text-xs">
                        Create login credentials for an agent.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="create-name" className="text-xs">Name</Label>
                        <Input
                          id="create-name"
                          placeholder="John Smith"
                          className="h-8 text-sm"
                          value={createName}
                          onChange={(e) => setCreateName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="create-email" className="text-xs">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            id="create-email"
                            type="email"
                            placeholder="agent@company.com"
                            className="pl-8 h-8 text-sm"
                            value={createEmail}
                            onChange={(e) => setCreateEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="create-password" className="text-xs">Password</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            id="create-password"
                            type="password"
                            placeholder="At least 6 characters"
                            className="pl-8 h-8 text-sm"
                            value={createPassword}
                            onChange={(e) => setCreatePassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Assign to Properties</Label>
                        <div className="space-y-1.5 max-h-24 overflow-auto border rounded-md p-2">
                          {properties.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No properties available</p>
                          ) : (
                            properties.map((prop) => (
                              <label key={prop.id} className="flex items-center gap-1.5 cursor-pointer">
                                <Checkbox
                                  className="h-3.5 w-3.5"
                                  checked={createPropertyIds.includes(prop.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setCreatePropertyIds([...createPropertyIds, prop.id]);
                                    } else {
                                      setCreatePropertyIds(createPropertyIds.filter(id => id !== prop.id));
                                    }
                                  }}
                                />
                                <span className="text-xs truncate">{prop.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleCreateAccount} 
                        disabled={isCreating || !createEmail.trim() || !createName.trim() || createPassword.length < 6}
                      >
                        {isCreating && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                        Create Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Invite Agent Dialog */}
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-tour="invite-agent-btn" size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                      <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                      Invite Agent
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-base">Invite Agent</DialogTitle>
                      <DialogDescription className="text-xs">
                        Send an email invitation. The agent will create their own password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="agent-name" className="text-xs">Name</Label>
                        <Input
                          id="agent-name"
                          placeholder="John Smith"
                          className="h-8 text-sm"
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="agent-email" className="text-xs">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            id="agent-email"
                            type="email"
                            placeholder="agent@company.com"
                            className="pl-8 h-8 text-sm"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Assign to Properties</Label>
                        <div className="space-y-1.5 max-h-24 overflow-auto border rounded-md p-2">
                          {properties.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No properties available</p>
                          ) : (
                            properties.map((prop) => (
                              <label key={prop.id} className="flex items-center gap-1.5 cursor-pointer">
                                <Checkbox
                                  className="h-3.5 w-3.5"
                                  checked={selectedPropertyIds.includes(prop.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedPropertyIds([...selectedPropertyIds, prop.id]);
                                    } else {
                                      setSelectedPropertyIds(selectedPropertyIds.filter(id => id !== prop.id));
                                    }
                                  }}
                                />
                                <span className="text-xs truncate">{prop.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" size="sm" onClick={() => setIsInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleInviteAgent} disabled={isInviting || !inviteEmail.trim() || !inviteName.trim()}>
                        {isInviting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Loading agents...
                </div>
              ) : displayAgents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">No agents yet</p>
                  <p className="text-sm mb-4">Invite agents to help respond to conversations</p>
                  <Button onClick={() => setIsInviteDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Your First Agent
                  </Button>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Agent</TableHead>
                          <TableHead>Activity</TableHead>
                          <TableHead>Invitation</TableHead>
                          <TableHead>Assigned Properties</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayAgents.map((agent) => (
                          <TableRow key={agent.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="relative group">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={agent.avatar_url} />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {agent.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    {uploadingAvatarFor === agent.id ? (
                                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                                    ) : (
                                      <Upload className="h-4 w-4 text-white" />
                                    )}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleAvatarUpload(agent.id, file);
                                      }}
                                    />
                                  </label>
                                </div>
                                <div>
                                  <p className="font-medium">{agent.name}</p>
                                  <p className="text-sm text-muted-foreground">{agent.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "w-2.5 h-2.5 rounded-full",
                                  agent.status === 'online' ? "bg-green-500" : agent.status === 'away' ? "bg-yellow-500" : "bg-muted-foreground/40"
                                )} />
                                <span className="text-sm capitalize text-muted-foreground">{agent.status}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getInvitationBadge(agent.invitation_status)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8">
                                    <Globe className="h-3.5 w-3.5 mr-2" />
                                    {agent.assigned_properties.length === 0 
                                      ? 'None' 
                                      : agent.assigned_properties.length === 1
                                        ? properties.find(p => p.id === agent.assigned_properties[0])?.name || '1 property'
                                        : `${agent.assigned_properties.length} properties`
                                    }
                                    <ChevronDown className="h-3.5 w-3.5 ml-2" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48">
                                  {properties.length === 0 ? (
                                    <DropdownMenuItem disabled>No properties available</DropdownMenuItem>
                                  ) : (
                                    properties.map((prop) => {
                                      const isAssigned = agent.assigned_properties.includes(prop.id);
                                      return (
                                        <DropdownMenuItem
                                          key={prop.id}
                                          onClick={() => handleToggleProperty(agent.id, prop.id, isAssigned)}
                                          className="flex items-center gap-2"
                                        >
                                          <Checkbox checked={isAssigned} className="pointer-events-none" />
                                          <span className="truncate">{prop.name}</span>
                                        </DropdownMenuItem>
                                      );
                                    })
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Create AI button */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleCreateAIFromAgent(agent)}
                                      disabled={creatingAIForId === agent.id || !!linkedAIAgents[agent.id]}
                                      className={linkedAIAgents[agent.id] 
                                        ? "text-primary/50" 
                                        : "text-muted-foreground hover:text-primary"
                                      }
                                    >
                                      {creatingAIForId === agent.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Bot className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {linkedAIAgents[agent.id] 
                                      ? `AI "${linkedAIAgents[agent.id]}" linked` 
                                      : "Create AI Persona"
                                    }
                                  </TooltipContent>
                                </Tooltip>

                                {agent.invitation_status === 'pending' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleResendInvitation(agent)}
                                    disabled={resendingId === agent.id}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    {resendingId === agent.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Send className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteAgentId(agent.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-3">
                    {displayAgents.map((agent) => (
                      <div key={agent.id} className="rounded-xl border border-border/50 p-3 space-y-3">
                        {/* Agent info row */}
                        <div className="flex items-center gap-3">
                          <div className="relative group flex-shrink-0">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={agent.avatar_url} />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {agent.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                              {uploadingAvatarFor === agent.id ? (
                                <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                              ) : (
                                <Upload className="h-3.5 w-3.5 text-white" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleAvatarUpload(agent.id, file);
                                }}
                              />
                            </label>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{agent.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              agent.status === 'online' ? "bg-green-500" : agent.status === 'away' ? "bg-yellow-500" : "bg-muted-foreground/40"
                            )} />
                            {getInvitationBadge(agent.invitation_status)}
                          </div>
                        </div>

                        {/* Properties + Actions row */}
                        <div className="flex items-center justify-between gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-7 text-xs">
                                <Globe className="h-3 w-3 mr-1.5" />
                                {agent.assigned_properties.length === 0 
                                  ? 'No properties' 
                                  : agent.assigned_properties.length === 1
                                    ? properties.find(p => p.id === agent.assigned_properties[0])?.name || '1 property'
                                    : `${agent.assigned_properties.length} properties`
                                }
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              {properties.length === 0 ? (
                                <DropdownMenuItem disabled>No properties available</DropdownMenuItem>
                              ) : (
                                properties.map((prop) => {
                                  const isAssigned = agent.assigned_properties.includes(prop.id);
                                  return (
                                    <DropdownMenuItem
                                      key={prop.id}
                                      onClick={() => handleToggleProperty(agent.id, prop.id, isAssigned)}
                                      className="flex items-center gap-2"
                                    >
                                      <Checkbox checked={isAssigned} className="pointer-events-none" />
                                      <span className="truncate">{prop.name}</span>
                                    </DropdownMenuItem>
                                  );
                                })
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCreateAIFromAgent(agent)}
                              disabled={creatingAIForId === agent.id || !!linkedAIAgents[agent.id]}
                            >
                              {creatingAIForId === agent.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </Button>
                            {agent.invitation_status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleResendInvitation(agent)}
                                disabled={resendingId === agent.id}
                              >
                                {resendingId === agent.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Send className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteAgentId(agent.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Agent Confirmation */}
      <AlertDialog open={!!deleteAgentId} onOpenChange={(open) => !open && setDeleteAgentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this agent? They will no longer be able to access conversations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAgent}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Removing...' : 'Remove Agent'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DashboardTour />
    </DashboardLayout>
  );
};

export default TeamMembers;
