import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { triggerSalesforceAutoExport } from '@/hooks/useConversations';
import { ChatPanel } from '@/components/dashboard/ChatPanel';
import { ConversationList } from '@/components/dashboard/ConversationList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { UserAvatarUpload } from '@/components/sidebar/UserAvatarUpload';
import { Input } from '@/components/ui/input';
import { LogOut, MessageSquare, RefreshCw, Inbox, Archive, ArrowLeft, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Conversation, Message, Visitor } from '@/types/chat';

export default function AgentDashboard() {
  const { user, isAgent, loading, signOut, role, isAdmin, isClient, hasAgentAccess } = useAuth();
  const { profile, updateAvatarUrl } = useUserProfile();
  const navigate = useNavigate();
  const { conversationId: urlConversationId } = useParams();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(() => {
    try {
      const cached = sessionStorage.getItem('agent-selected-conversation');
      if (cached && urlConversationId) {
        const parsed = JSON.parse(cached);
        if (parsed?.id === urlConversationId) {
          // Restore dates from JSON
          return {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt),
            visitor: { ...parsed.visitor, createdAt: new Date(parsed.visitor.createdAt) },
            messages: parsed.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
            lastMessage: parsed.lastMessage ? { ...parsed.lastMessage, timestamp: new Date(parsed.lastMessage.timestamp) } : undefined,
          };
        }
      }
    } catch {}
    return null;
  });
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'away'>('online');
  const [agentProfile, setAgentProfile] = useState<{ id: string; name: string; email: string; avatar_url?: string } | null>(null);
  const [assignedPropertyIds, setAssignedPropertyIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('active');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  

  // Redirect if no agent access at all
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && !isAgent && !hasAgentAccess) {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, isAgent, hasAgentAccess, loading, navigate, role]);

  // Fetch agent profile and assigned properties
  useEffect(() => {
    const fetchAgentProfile = async () => {
      if (!user) return;
      
      const { data: agentData } = await supabase
        .from('agents')
        .select('id, name, email, status, avatar_url')
        .eq('user_id', user.id)
        .single();
      
      if (agentData) {
        setAgentProfile({ 
          id: agentData.id, 
          name: agentData.name, 
          email: agentData.email,
          avatar_url: agentData.avatar_url 
        });
        setAgentStatus(agentData.status as 'online' | 'offline' | 'away');

        // Fetch assigned properties
        const { data: assignments } = await supabase
          .from('property_agents')
          .select('property_id')
          .eq('agent_id', agentData.id);

        if (assignments) {
          setAssignedPropertyIds(assignments.map(a => a.property_id));
        }
      }
    };

    if (isAgent || hasAgentAccess) {
      fetchAgentProfile();
    }
  }, [user, isAgent, hasAgentAccess]);

  // Fetch conversations for assigned properties
  const fetchConversations = useCallback(async () => {
    if (!user || assignedPropertyIds.length === 0) {
      setConversations([]);
      return;
    }

    const { data: convData, error } = await supabase
      .from('conversations')
      .select(`*, visitors!inner(*), property:properties(name, domain)`)
      .in('property_id', assignedPropertyIds)
      .or(`assigned_agent_id.is.null,assigned_agent_id.eq.${agentProfile?.id}`)
      .order('updated_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    if (convData) {
      const conversationsWithMessages = await Promise.all(
        convData.map(async (c: any) => {
          const { data: messagesData } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', c.id)
            .order('created_at', { ascending: true });

          const messages: Message[] = (messagesData || []).map((m: any) => ({
            id: m.id,
            conversationId: m.conversation_id,
            senderId: m.sender_id,
            senderType: m.sender_type as 'agent' | 'visitor',
            content: m.content,
            read: m.read,
            timestamp: new Date(m.created_at),
          }));

          const visitor: Visitor = {
            id: c.visitors.id,
            name: c.visitors.name || undefined,
            email: c.visitors.email || undefined,
            sessionId: c.visitors.session_id,
            propertyId: c.visitors.property_id,
            currentPage: c.visitors.current_page || undefined,
            browserInfo: c.visitors.browser_info || undefined,
            location: c.visitors.location || undefined,
            createdAt: new Date(c.visitors.created_at),
          };

          const unreadCount = messages.filter(m => !m.read && m.senderType === 'visitor').length;

          const conversation: Conversation & { ai_enabled?: boolean; aiQueuedAt?: Date | null; aiQueuedPreview?: string | null; aiQueuedPaused?: boolean } = {
            id: c.id,
            visitorId: c.visitor_id,
            propertyId: c.property_id,
            propertyName: (c as any).property?.name || (c as any).property?.domain || undefined,
            status: c.status as 'pending' | 'active' | 'closed',
            assignedAgentId: c.assigned_agent_id,
            createdAt: new Date(c.created_at),
            updatedAt: new Date(c.updated_at),
            visitor,
            messages,
            lastMessage: messages.length > 0 ? messages[messages.length - 1] : undefined,
            unreadCount,
            ai_enabled: c.ai_enabled ?? true,
            aiQueuedAt: c.ai_queued_at ? new Date(c.ai_queued_at) : null,
            aiQueuedPreview: c.ai_queued_preview ?? null,
            aiQueuedPaused: c.ai_queued_paused ?? false,
          };

          return conversation;
        })
      );

      setConversations(conversationsWithMessages);
    }
  }, [user, assignedPropertyIds, agentProfile?.id]);

  // Filter conversations by status tab
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      if (statusFilter === 'active' && conv.status === 'closed') return false;
      if (statusFilter === 'closed' && conv.status !== 'closed') return false;
      return true;
    });
  }, [conversations, statusFilter]);

  // Badge counts
  const activeCount = useMemo(() => conversations.filter(c => c.status !== 'closed').length, [conversations]);
  const closedCount = useMemo(() => conversations.filter(c => c.status === 'closed').length, [conversations]);

  // Sync selected conversation from URL & update cache when fresh data arrives
  useEffect(() => {
    if (urlConversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === urlConversationId);
      if (conv) {
        setSelectedConversation(conv);
        try { sessionStorage.setItem('agent-selected-conversation', JSON.stringify(conv)); } catch {}
      }
    }
  }, [urlConversationId, conversations]);

  // Cache selected conversation on manual selection
  useEffect(() => {
    if (selectedConversation) {
      try { sessionStorage.setItem('agent-selected-conversation', JSON.stringify(selectedConversation)); } catch {}
    } else {
      sessionStorage.removeItem('agent-selected-conversation');
    }
  }, [selectedConversation]);

  // Fetch conversations when assigned properties change
  useEffect(() => {
    if ((isAgent || hasAgentAccess) && assignedPropertyIds.length > 0) {
      fetchConversations();
    }
  }, [isAgent, hasAgentAccess, assignedPropertyIds, fetchConversations]);

  // Real-time subscriptions for new conversations and messages
  useEffect(() => {
    if ((!isAgent && !hasAgentAccess) || assignedPropertyIds.length === 0) return;

    // Subscribe to new conversations
    const conversationChannel = supabase
      .channel('agent-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          console.log('Conversation change:', payload);
          // Check if it's for our assigned properties
          const newConv = payload.new as any;
          if (newConv && assignedPropertyIds.includes(newConv.property_id)) {
            fetchConversations();
          }
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messageChannel = supabase
      .channel('agent-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('New message:', payload);
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [isAgent, assignedPropertyIds, fetchConversations]);

  // Update agent status
  const updateAgentStatus = async (status: 'online' | 'offline' | 'away') => {
    if (!user || !agentProfile) return;

    const { error } = await supabase
      .from('agents')
      .update({ status })
      .eq('user_id', user.id);

    if (!error) {
      setAgentStatus(status);
      
      // Log status change notification (only for online/offline, not away)
      if (status === 'online' || status === 'offline') {
        const propId = assignedPropertyIds[0];
        if (propId) {
          supabase.from('notification_logs').insert({
            property_id: propId,
            notification_type: status === 'online' ? 'agent_online' : 'agent_offline',
            channel: 'in_app',
            recipient: 'system',
            recipient_type: 'system',
            status: 'sent',
            visitor_name: agentProfile.name,
          }).then(() => {});
        }
      }
    }
  };

  const handleSignOut = async () => {
    await updateAgentStatus('offline');
    await signOut();
    navigate('/auth');
  };

  const handleSaveName = async () => {
    if (!editName.trim() || !user || !agentProfile) return;
    const { error } = await supabase
      .from('agents')
      .update({ name: editName.trim() })
      .eq('user_id', user.id);
    if (error) {
      toast.error('Failed to update name');
      return;
    }
    setAgentProfile({ ...agentProfile, name: editName.trim() });
    setIsEditingName(false);
    toast.success('Name updated');
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !user || !agentProfile) return;

    // IMPORTANT: The widget polling relies on monotonically increasing sequence_number.
    // If we omit it, messages default to 1 and will never be picked up once the visitor
    // has already advanced the sequence.
    const { data: maxSeqData, error: maxSeqError } = await supabase
      .from('messages')
      .select('sequence_number')
      .eq('conversation_id', selectedConversation.id)
      .order('sequence_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxSeqError) {
      console.error('Error fetching max sequence_number:', maxSeqError);
      return;
    }

    const nextSeq = (maxSeqData?.sequence_number || 0) + 1;

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConversation.id,
        sender_id: agentProfile.id,
        sender_type: 'agent',
        content,
        read: true,
        sequence_number: nextSeq,
      });

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    // IMPORTANT: When a human agent sends a message, disable AI for this conversation
    // so the widget knows a human has taken over and won't generate AI responses.
    await supabase
      .from('conversations')
      .update({ ai_enabled: false })
      .eq('id', selectedConversation.id);
    
    // Update local state to reflect AI is now disabled
    setConversations(prev => prev.map(c => 
      c.id === selectedConversation.id 
        ? { ...c, ai_enabled: false } as any
        : c
    ));

    // Fire-and-forget: auto-export on escalation
    triggerSalesforceAutoExport(selectedConversation.id, 'auto_export_on_escalation');

    // Update conversation status to active if pending
    if (selectedConversation.status === 'pending') {
      await supabase
        .from('conversations')
        .update({
          status: 'active',
          assigned_agent_id: agentProfile.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedConversation.id);
    } else {
      // Always bump updated_at so inbox ordering stays correct.
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);
    }

    // Refetch messages and update selected conversation
    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', selectedConversation.id)
      .order('sequence_number', { ascending: true });

    if (messagesData) {
      const messages: Message[] = messagesData.map((m: any) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        senderType: m.sender_type as 'agent' | 'visitor',
        content: m.content,
        read: m.read,
        timestamp: new Date(m.created_at),
      }));

      setSelectedConversation({
        ...selectedConversation,
        messages,
        lastMessage: messages[messages.length - 1],
        status: 'active',
      });

      // Update in list
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, messages, lastMessage: messages[messages.length - 1], status: 'active' as const }
          : c
      ));
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;

    await supabase
      .from('conversations')
      .update({ status: 'closed' })
      .eq('id', selectedConversation.id);

    setSelectedConversation({ ...selectedConversation, status: 'closed' });
    setConversations(prev => prev.map(c => 
      c.id === selectedConversation.id ? { ...c, status: 'closed' as const } : c
    ));

    // Fire-and-forget: auto-export on conversation end
    triggerSalesforceAutoExport(selectedConversation.id, 'auto_export_on_conversation_end');
  };

  // AI toggle for conversations - use persisted value from database
  const selectedDbConv = selectedConversation 
    ? (conversations.find(c => c.id === selectedConversation.id) as any) 
    : null;
  const isAIEnabled = selectedDbConv?.ai_enabled ?? true;
  const aiQueuedAt = selectedDbConv?.aiQueuedAt ?? null;
  const aiQueuedPaused = selectedDbConv?.aiQueuedPaused ?? false;

  const handlePauseAIQueue = async (paused: boolean) => {
    if (!selectedConversation?.id) return;
    await supabase
      .from('conversations')
      .update({ ai_queued_paused: paused })
      .eq('id', selectedConversation.id);
    setConversations(prev => prev.map(c =>
      c.id === selectedConversation.id ? { ...c, aiQueuedPaused: paused } as any : c
    ));
  };

  const handleCancelAIQueue = async () => {
    if (!selectedConversation?.id) return;
    await supabase
      .from('conversations')
      .update({ ai_queued_at: null, ai_queued_preview: null, ai_queued_paused: false })
      .eq('id', selectedConversation.id);
    setConversations(prev => prev.map(c =>
      c.id === selectedConversation.id ? { ...c, aiQueuedAt: null, aiQueuedPreview: null, aiQueuedPaused: false } as any : c
    ));
  };

  const handleToggleAI = async () => {
    if (!selectedConversation?.id) return;
    const newValue = !isAIEnabled;
    
    // Update local state immediately for responsive UI
    setConversations(prev => prev.map(c => 
      c.id === selectedConversation.id 
        ? { ...c, ai_enabled: newValue } as any
        : c
    ));
    
    const { error } = await supabase
      .from('conversations')
      .update({ ai_enabled: newValue })
      .eq('id', selectedConversation.id);

    if (error) {
      console.error('Error toggling AI:', error);
      // Revert on error
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, ai_enabled: !newValue } as any
          : c
      ));
    } else if (!newValue) {
      // AI disabled = escalation to human
      triggerSalesforceAutoExport(selectedConversation.id, 'auto_export_on_escalation');
    }
  };

  // Show admin/client portal access
  const canSwitchToAdmin = isAdmin || isClient;

  if (loading || (!isAgent && !hasAgentAccess)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Agent Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserAvatarUpload
                userId={user?.id || ''}
                avatarUrl={profile?.avatar_url || agentProfile?.avatar_url}
                initials={agentProfile?.name?.charAt(0).toUpperCase() || 'A'}
                onAvatarUpdate={updateAvatarUrl}
                size="md"
              />
              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-6 text-sm px-1 py-0"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleSaveName}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setIsEditingName(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 group">
                    <p className="font-medium text-sm">{agentProfile?.name || 'Agent'}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => { setEditName(agentProfile?.name || ''); setIsEditingName(true); }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{agentProfile?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Status Selector */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={agentStatus === 'online' ? 'default' : 'outline'}
              onClick={() => updateAgentStatus('online')}
              className="flex-1"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              Online
            </Button>
            <Button
              size="sm"
              variant={agentStatus === 'away' ? 'default' : 'outline'}
              onClick={() => updateAgentStatus('away')}
              className="flex-1"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
              Away
            </Button>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Conversations</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={fetchConversations} className="h-7 w-7">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Badge variant="secondary">{filteredConversations.length}</Badge>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="px-3 py-2 border-b border-border">
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'closed')}>
              <TabsList className="w-full grid grid-cols-3 h-8">
                <TabsTrigger value="all" className="text-xs h-7">
                  All
                  <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{conversations.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs h-7">
                  <Inbox className="h-3 w-3 mr-1" />
                  Active
                  {activeCount > 0 && <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{activeCount}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="closed" className="text-xs h-7">
                  <Archive className="h-3 w-3 mr-1" />
                  Closed
                  {closedCount > 0 && <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{closedCount}</Badge>}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex-1 overflow-auto">
            <ConversationList
              conversations={filteredConversations}
              selectedId={selectedConversation?.id}
              onSelect={(conv) => {
                setSelectedConversation(conv);
                navigate(`/conversations/${conv.id}`, { replace: true });
              }}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-3 border-t border-border space-y-2">
          {canSwitchToAdmin && (
            <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatPanel
          conversation={selectedConversation}
          onSendMessage={handleSendMessage}
          onCloseConversation={handleCloseConversation}
          isAIEnabled={isAIEnabled}
          onToggleAI={handleToggleAI}
          aiQueuedAt={aiQueuedAt}
          aiQueuedPaused={aiQueuedPaused}
          onPauseAIQueue={handlePauseAIQueue}
          onCancelAIQueue={handleCancelAIQueue}
        />
      </div>
    </div>
  );
}