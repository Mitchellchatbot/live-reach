import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ChatPanel } from '@/components/dashboard/ChatPanel';
import { ConversationList } from '@/components/dashboard/ConversationList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut, MessageSquare, User } from 'lucide-react';
import type { Conversation, Message, Visitor } from '@/types/chat';

export default function AgentDashboard() {
  const { user, isAgent, loading, signOut, role } = useAuth();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'away'>('online');
  const [agentProfile, setAgentProfile] = useState<{ name: string; email: string } | null>(null);

  // Redirect if not agent
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && !isAgent) {
      // Non-agents go to their respective dashboards
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, isAgent, loading, navigate, role]);

  // Fetch agent profile
  useEffect(() => {
    const fetchAgentProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('agents')
        .select('name, email, status')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setAgentProfile({ name: data.name, email: data.email });
        setAgentStatus(data.status as 'online' | 'offline' | 'away');
      }
    };

    if (isAgent) {
      fetchAgentProfile();
    }
  }, [user, isAgent]);

  // Fetch conversations assigned to this agent
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      const { data: convData, error } = await supabase
        .from('conversations')
        .select(`
          *,
          visitors!inner(*)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      if (convData) {
        // Fetch messages for each conversation
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

            const conversation: Conversation = {
              id: c.id,
              visitorId: c.visitor_id,
              propertyId: c.property_id,
              status: c.status as 'pending' | 'active' | 'closed',
              assignedAgentId: c.assigned_agent_id,
              createdAt: new Date(c.created_at),
              updatedAt: new Date(c.updated_at),
              visitor,
              messages,
              lastMessage: messages.length > 0 ? messages[messages.length - 1] : undefined,
              unreadCount,
            };

            return conversation;
          })
        );

        setConversations(conversationsWithMessages);
      }
    };

    if (isAgent) {
      fetchConversations();
    }
  }, [user, isAgent]);

  // Update agent status
  const updateAgentStatus = async (status: 'online' | 'offline' | 'away') => {
    if (!user) return;

    const { error } = await supabase
      .from('agents')
      .update({ status })
      .eq('user_id', user.id);

    if (!error) {
      setAgentStatus(status);
    }
  };

  const handleSignOut = async () => {
    await updateAgentStatus('offline');
    await signOut();
    navigate('/auth');
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !user) return;

    const { data: agentData } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConversation.id,
        sender_id: agentData?.id || user.id,
        sender_type: 'agent',
        content,
      });

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    // Update conversation status to active if pending
    if (selectedConversation.status === 'pending') {
      await supabase
        .from('conversations')
        .update({ status: 'active', assigned_agent_id: agentData?.id })
        .eq('id', selectedConversation.id);
    }

    // Refetch messages and update selected conversation
    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', selectedConversation.id)
      .order('created_at', { ascending: true });

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
  };

  if (loading || !isAgent) {
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
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{agentProfile?.name || 'Agent'}</p>
                <p className="text-xs text-muted-foreground">{agentProfile?.email}</p>
              </div>
            </div>
            <ThemeToggle />
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
            <Badge variant="secondary">{conversations.length}</Badge>
          </div>
          
          <div className="flex-1 overflow-auto">
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation?.id}
              onSelect={(conv) => setSelectedConversation(conv)}
            />
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t border-border">
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
        />
      </div>
    </div>
  );
}