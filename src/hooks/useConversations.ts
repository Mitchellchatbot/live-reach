import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DbProperty {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  widget_color: string;
  greeting: string;
  offline_message: string;
  created_at: string;
  updated_at: string;
}

export interface DbVisitor {
  id: string;
  property_id: string;
  session_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  age: string | null;
  occupation: string | null;
  browser_info: string | null;
  location: string | null;
  current_page: string | null;
  created_at: string;
  addiction_history: string | null;
  drug_of_choice: string | null;
  treatment_interest: string | null;
  insurance_info: string | null;
  urgency_level: string | null;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'agent' | 'visitor';
  content: string;
  read: boolean;
  created_at: string;
  sequence_number: number;
}

export interface DbConversation {
  id: string;
  property_id: string;
  visitor_id: string;
  assigned_agent_id: string | null;
  status: 'active' | 'closed' | 'pending';
  is_test: boolean;
  ai_enabled: boolean;
  created_at: string;
  updated_at: string;
  visitor?: DbVisitor;
  messages?: DbMessage[];
  property?: DbProperty;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<DbConversation[]>([]);
  const [properties, setProperties] = useState<DbProperty[]>([]);

  // Avoid channel-name collisions when this hook is mounted in multiple places
  const realtimeChannelSuffixRef = useRef<string>(
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const [loading, setLoading] = useState(true);
  const [propertiesLoaded, setPropertiesLoaded] = useState(false);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);

  const fetchProperties = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
        setPropertiesLoaded(true);
        return;
      }

      setProperties(data || []);
    } catch (err) {
      console.error('[fetchProperties] unexpected error:', err);
      setProperties([]);
    } finally {
      setPropertiesLoaded(true);
    }
  }, [user]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      // Step 1: Fetch all conversations with visitor and property data
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          visitor:visitors(*),
          property:properties(*)
        `)
        .order('updated_at', { ascending: false });

      if (convError) {
        console.error('Error fetching conversations:', convError);
        setConversations([]);
        setConversationsLoaded(true);
        return;
      }

      if (!convData || convData.length === 0) {
        setConversations([]);
        setConversationsLoaded(true);
        return;
      }

      // Step 2: Batch fetch ALL messages in a single query (fixes N+1 problem)
      const conversationIds = convData.map(c => c.id);
      const { data: allMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('sequence_number', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      }

      // Step 3: Group messages by conversation_id in memory
      const messagesByConversation: Record<string, DbMessage[]> = {};
      (allMessages || []).forEach((msg) => {
        const convId = msg.conversation_id;
        if (!messagesByConversation[convId]) {
          messagesByConversation[convId] = [];
        }
        messagesByConversation[convId].push({
          ...msg,
          sender_type: msg.sender_type as 'agent' | 'visitor',
        });
      });

      // Step 4: Combine conversations with their messages
      const conversationsWithMessages = convData.map((conv) => ({
        ...conv,
        status: conv.status as 'active' | 'closed' | 'pending',
        messages: messagesByConversation[conv.id] || [],
      }));

      // Filter out conversations where visitor hasn't sent any messages
      const conversationsWithVisitorMessage = conversationsWithMessages.filter(
        (conv) => conv.messages && conv.messages.some((m) => m.sender_type === 'visitor')
      );

      setConversations(conversationsWithVisitorMessage as DbConversation[]);
    } catch (err) {
      console.error('[fetchConversations] unexpected error:', err);
      setConversations([]);
    } finally {
      setConversationsLoaded(true);
    }
  }, [user]);

  const sendMessage = async (conversationId: string, content: string, senderId: string) => {
    // Get next sequence number for this conversation
    const { data: maxSeqData } = await supabase
      .from('messages')
      .select('sequence_number')
      .eq('conversation_id', conversationId)
      .order('sequence_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSeq = (maxSeqData?.sequence_number || 0) + 1;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_type: 'agent',
        content,
        read: true,
        sequence_number: nextSeq,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return null;
    }

    // Update conversation status and disable AI
    await supabase
      .from('conversations')
      .update({ 
        status: 'active', 
        updated_at: new Date().toISOString(),
        ai_enabled: false,
      })
      .eq('id', conversationId);

    // Update local state immediately (optimistic update)
    const newMessage: DbMessage = {
      ...data,
      sender_type: 'agent',
    };
    
    setConversations(prev => 
      prev.map(c => c.id === conversationId 
        ? { 
            ...c, 
            ai_enabled: false, 
            status: 'active' as const,
            messages: [...(c.messages || []), newMessage],
          } 
        : c
      )
    );

    return data;
  };

  const markMessagesAsRead = async (conversationId: string) => {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('sender_type', 'visitor');
  };

  const closeConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from('conversations')
      .update({ status: 'closed' })
      .eq('id', conversationId);

    if (error) {
      console.error('Error closing conversation:', error);
      toast.error('Failed to close conversation');
      return false;
    }

    // Optimistic update
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, status: 'closed' as const } : c)
    );

    return true;
  };

  const closeConversations = async (conversationIds: string[]) => {
    const { error } = await supabase
      .from('conversations')
      .update({ status: 'closed' })
      .in('id', conversationIds);

    if (error) {
      console.error('Error closing conversations:', error);
      toast.error('Failed to close conversations');
      return false;
    }

    toast.success(`${conversationIds.length} conversation${conversationIds.length > 1 ? 's' : ''} closed`);
    
    // Optimistic update
    setConversations(prev =>
      prev.map(c => conversationIds.includes(c.id) ? { ...c, status: 'closed' as const } : c)
    );
    
    return true;
  };

  const deleteConversation = async (conversationId: string) => {
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      toast.error('Failed to delete conversation');
      return false;
    }

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
      return false;
    }

    toast.success('Conversation deleted');
    
    // Optimistic update
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    
    return true;
  };

  const deleteConversations = async (conversationIds: string[]) => {
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .in('conversation_id', conversationIds);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      toast.error('Failed to delete conversations');
      return false;
    }

    const { error } = await supabase
      .from('conversations')
      .delete()
      .in('id', conversationIds);

    if (error) {
      console.error('Error deleting conversations:', error);
      toast.error('Failed to delete conversations');
      return false;
    }

    toast.success(`${conversationIds.length} conversation${conversationIds.length > 1 ? 's' : ''} deleted`);
    
    // Optimistic update
    setConversations(prev => prev.filter(c => !conversationIds.includes(c.id)));
    
    return true;
  };

  const createProperty = async (
    name: string,
    domain: string,
    options?: {
      greeting?: string;
      collectEmail?: boolean;
      collectName?: boolean;
      collectPhone?: boolean;
      basePrompt?: string;
      agentName?: string;
      agentAvatarUrl?: string;
      widgetIcon?: string;
    }
  ) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('properties')
      .insert({
        user_id: user.id,
        name,
        domain,
        greeting: options?.greeting,
        require_email_before_chat: options?.collectEmail,
        require_name_before_chat: options?.collectName,
        require_phone_before_chat: options?.collectPhone,
        ai_base_prompt: options?.basePrompt,
        widget_icon: options?.widgetIcon || 'message-circle',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating property:', error);
      toast.error('Failed to create property');
      return null;
    }

    // Create AI agent
    const agentNameToUse = options?.agentName?.trim() || 'Support Assistant';
    const { data: aiAgent, error: agentError } = await supabase
      .from('ai_agents')
      .insert({
        owner_id: user.id,
        name: agentNameToUse,
        avatar_url: options?.agentAvatarUrl || null,
        personality_prompt: options?.basePrompt || null,
        status: 'active',
      })
      .select()
      .single();

    if (agentError) {
      console.error('Error creating AI agent:', agentError);
    } else if (aiAgent) {
      const { error: linkError } = await supabase
        .from('ai_agent_properties')
        .insert({
          ai_agent_id: aiAgent.id,
          property_id: data.id,
        });

      if (linkError) {
        console.error('Error linking AI agent to property:', linkError);
      }
    }

    toast.success('Property created successfully');
    await fetchProperties();
    return data;
  };

  const deleteProperty = async (propertyId: string) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
      return false;
    }

    toast.success('Property deleted successfully');
    await fetchProperties();
    return true;
  };

  const toggleAI = async (conversationId: string, enabled: boolean) => {
    const { error } = await supabase
      .from('conversations')
      .update({ ai_enabled: enabled })
      .eq('id', conversationId);

    if (error) {
      console.error('Error toggling AI:', error);
      toast.error('Failed to update AI setting');
      return false;
    }

    setConversations(prev => 
      prev.map(c => c.id === conversationId ? { ...c, ai_enabled: enabled } : c)
    );
    return true;
  };

  // Initial data fetch with parallel loading
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setProperties([]);
      setLoading(false);
      setPropertiesLoaded(false);
      setConversationsLoaded(false);
      return;
    }

    setLoading(true);
    setPropertiesLoaded(false);
    setConversationsLoaded(false);

    // Fetch both in parallel
    Promise.all([fetchProperties(), fetchConversations()]).catch((err) => {
      console.error('[useConversations] parallel fetch error:', err);
    });
  }, [user, fetchProperties, fetchConversations]);

  useEffect(() => {
    if (propertiesLoaded && conversationsLoaded) {
      setLoading(false);
    }
  }, [propertiesLoaded, conversationsLoaded]);

  // Optimized realtime subscriptions with incremental updates
  useEffect(() => {
    if (!user) return;

    console.log('[useConversations] Setting up realtime subscriptions');

    const messagesChannel = supabase
      .channel(`messages-realtime-${realtimeChannelSuffixRef.current}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('[useConversations] New message:', payload);
          const newMessage = payload.new as DbMessage;
          
          // Incremental update: append message to existing conversation
          setConversations(prev => {
            const conversationExists = prev.some(c => c.id === newMessage.conversation_id);
            if (!conversationExists) {
              // New conversation - need full refetch
              fetchConversations().catch(console.error);
              return prev;
            }
            
            return prev.map(c => 
              c.id === newMessage.conversation_id
                ? { 
                    ...c, 
                    messages: [...(c.messages || []), {
                      ...newMessage,
                      sender_type: newMessage.sender_type as 'agent' | 'visitor',
                    }],
                    updated_at: newMessage.created_at,
                  }
                : c
            );
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('[useConversations] Message updated:', payload);
          const updatedMessage = payload.new as DbMessage;
          
          setConversations(prev =>
            prev.map(c => 
              c.id === updatedMessage.conversation_id
                ? {
                    ...c,
                    messages: (c.messages || []).map(m =>
                      m.id === updatedMessage.id
                        ? { ...updatedMessage, sender_type: updatedMessage.sender_type as 'agent' | 'visitor' }
                        : m
                    ),
                  }
                : c
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('[useConversations] Messages channel status:', status);
      });

    const conversationsChannel = supabase
      .channel(`conversations-realtime-${realtimeChannelSuffixRef.current}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversations' },
        () => {
          // New conversation - need full refetch to get visitor/property data
          fetchConversations().catch(console.error);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        (payload) => {
          console.log('[useConversations] Conversation updated:', payload);
          const updated = payload.new;
          
          // Incremental update for conversation metadata
          setConversations(prev =>
            prev.map(c => 
              c.id === updated.id
                ? { 
                    ...c, 
                    status: updated.status as 'active' | 'closed' | 'pending',
                    ai_enabled: updated.ai_enabled,
                    assigned_agent_id: updated.assigned_agent_id,
                    updated_at: updated.updated_at,
                  }
                : c
            )
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'conversations' },
        (payload) => {
          const deleted = payload.old;
          setConversations(prev => prev.filter(c => c.id !== deleted.id));
        }
      )
      .subscribe((status) => {
        console.log('[useConversations] Conversations channel status:', status);
      });

    const visitorsChannel = supabase
      .channel(`visitors-realtime-${realtimeChannelSuffixRef.current}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'visitors' },
        (payload) => {
          console.log('[useConversations] Visitor updated:', payload);
          const updatedVisitor = payload.new as DbVisitor;
          
          // Incremental update for visitor data
          setConversations(prev =>
            prev.map(c => 
              c.visitor?.id === updatedVisitor.id
                ? { ...c, visitor: updatedVisitor }
                : c
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('[useConversations] Visitors channel status:', status);
      });

    return () => {
      console.log('[useConversations] Cleaning up realtime subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(visitorsChannel);
    };
  }, [user, fetchConversations]);

  return {
    conversations,
    properties,
    loading,
    sendMessage,
    markMessagesAsRead,
    closeConversation,
    closeConversations,
    deleteConversation,
    deleteConversations,
    createProperty,
    deleteProperty,
    toggleAI,
    refetch: fetchConversations,
  };
};
