import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

export interface UseConversationsOptions {
  selectedPropertyId?: string;
  /** When set, filter properties to only those owned by this user (for agent workspace mode) */
  workspaceOwnerId?: string;
  /** When set, only show conversations unassigned or assigned to this agent ID */
  agentId?: string;
}

// Query key factory
const QUERY_KEYS = {
  properties: (userId: string) => ['properties', userId] as const,
  conversations: (userId: string, propertyId?: string, agentId?: string) => 
    ['conversations', userId, propertyId || 'all', agentId || 'none'] as const,
};

export const useConversations = (options: UseConversationsOptions = {}) => {
  const { selectedPropertyId, workspaceOwnerId, agentId } = options;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const realtimeChannelSuffixRef = useRef<string>(
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  // Fetch properties with React Query
  const { 
    data: allProperties = [], 
    isLoading: propertiesLoading 
  } = useQuery({
    queryKey: QUERY_KEYS.properties(user?.id || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter properties by workspace owner when in agent mode
  const properties = workspaceOwnerId 
    ? allProperties.filter(p => p.user_id === workspaceOwnerId)
    : allProperties;

  // Fetch conversations with React Query
  const fetchConversationsData = useCallback(async (): Promise<DbConversation[]> => {
    if (!user) return [];

    // Best-effort: close stale "active" conversations (visitor tab closed, unload not fired, etc.)
    try {
      // Use getUser() to validate the token is actually valid (getSession can return stale tokens)
      const { data: { user: validUser } } = await supabase.auth.getUser();
      if (validUser) {
        const { error } = await supabase.functions.invoke('close-stale-conversations', {
          body: {
            propertyId: selectedPropertyId ?? null,
            staleSeconds: 45,
          },
        });
        if (error) {
          console.warn('[useConversations] close-stale-conversations failed:', error.message);
        }
      }
    } catch (e) {
      // Silently ignore – this is best-effort cleanup
    }

    let query = supabase
      .from('conversations')
      .select(`*, visitor:visitors(*), property:properties(*)`)
      .order('updated_at', { ascending: false });

    if (selectedPropertyId && selectedPropertyId !== 'all') {
      query = query.eq('property_id', selectedPropertyId);
    }

    // In agent mode, only show unassigned or self-assigned conversations
    if (agentId) {
      query = query.or(`assigned_agent_id.is.null,assigned_agent_id.eq.${agentId}`);
    }

    const { data: convData, error: convError } = await query;

    if (convError) {
      console.error('Error fetching conversations:', convError);
      return [];
    }

    if (!convData || convData.length === 0) return [];

    // Batch fetch messages
    const conversationIds = convData.map(c => c.id);
    const chunkSize = 25;
    const idChunks: string[][] = [];
    for (let i = 0; i < conversationIds.length; i += chunkSize) {
      idChunks.push(conversationIds.slice(i, i + chunkSize));
    }

    const messageChunkResults = await Promise.all(
      idChunks.map((ids) =>
        supabase
          .from('messages')
          .select('*')
          .in('conversation_id', ids)
          .order('sequence_number', { ascending: true })
      )
    );

    const allMessages = messageChunkResults.flatMap((r) => r.data || []);
    const messagesError = messageChunkResults.find((r) => r.error)?.error;
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    }

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

    const conversationsWithMessages = convData.map((conv) => ({
      ...conv,
      status: conv.status as 'active' | 'closed' | 'pending',
      messages: messagesByConversation[conv.id] || [],
    }));

    // Filter out conversations without visitor messages
    return conversationsWithMessages.filter(
      (conv) => conv.messages && conv.messages.some((m) => m.sender_type === 'visitor')
    ) as DbConversation[];
  }, [user, selectedPropertyId, agentId]);

  const { 
    data: conversations = [], 
    isLoading: conversationsLoading,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: QUERY_KEYS.conversations(user?.id || '', selectedPropertyId, agentId),
    queryFn: fetchConversationsData,
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });

  const loading = propertiesLoading || conversationsLoading;

  // Helper to update conversations cache
  const updateConversationsCache = useCallback(
    (updater: (prev: DbConversation[]) => DbConversation[]) => {
      queryClient.setQueryData<DbConversation[]>(
        QUERY_KEYS.conversations(user?.id || '', selectedPropertyId, agentId),
        (old) => updater(old || [])
      );
    },
    [queryClient, user?.id, selectedPropertyId, agentId]
  );

  const sendMessage = async (conversationId: string, content: string, senderId: string, assignAgentId?: string) => {
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

    const updatePayload: Record<string, any> = { 
      status: 'active', 
      updated_at: new Date().toISOString(),
      ai_enabled: false,
    };
    if (assignAgentId) {
      updatePayload.assigned_agent_id = assignAgentId;
    }

    await supabase
      .from('conversations')
      .update(updatePayload)
      .eq('id', conversationId);

    const newMessage: DbMessage = { ...data, sender_type: 'agent' };
    
    updateConversationsCache(prev => 
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

    updateConversationsCache(prev =>
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
    
    updateConversationsCache(prev =>
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
    updateConversationsCache(prev => prev.filter(c => c.id !== conversationId));
    
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
    updateConversationsCache(prev => prev.filter(c => !conversationIds.includes(c.id)));
    
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
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.properties(user.id) });
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
    if (user) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.properties(user.id) });
    }
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

    updateConversationsCache(prev => 
      prev.map(c => c.id === conversationId ? { ...c, ai_enabled: enabled } : c)
    );
    return true;
  };

  // Optimized realtime subscriptions with cache mutations
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
          
          updateConversationsCache(prev => {
            const conversationExists = prev.some(c => c.id === newMessage.conversation_id);
            if (!conversationExists) {
              // Fetch only this new conversation
              fetchSingleConversation(newMessage.conversation_id);
              return prev;
            }
            
            return prev.map(c => {
              if (c.id !== newMessage.conversation_id) return c;
              // Deduplicate: skip if message already exists (e.g. from optimistic update)
              const alreadyExists = (c.messages || []).some(m => m.id === newMessage.id);
              if (alreadyExists) return { ...c, updated_at: newMessage.created_at };
              return { 
                ...c, 
                messages: [...(c.messages || []), {
                  ...newMessage,
                  sender_type: newMessage.sender_type as 'agent' | 'visitor',
                }],
                updated_at: newMessage.created_at,
              };
            });
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('[useConversations] Message updated:', payload);
          const updatedMessage = payload.new as DbMessage;
          
          updateConversationsCache(prev =>
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
      .subscribe();

    const conversationsChannel = supabase
      .channel(`conversations-realtime-${realtimeChannelSuffixRef.current}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversations' },
        async (payload) => {
          const newConv = payload.new;
          
          // Skip if not for current property filter
          if (selectedPropertyId && selectedPropertyId !== 'all' 
              && newConv.property_id !== selectedPropertyId) {
            return;
          }
          
          // Fetch only this single conversation
          fetchSingleConversation(newConv.id);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        (payload) => {
          console.log('[useConversations] Conversation updated:', payload);
          const updated = payload.new;
          
          updateConversationsCache(prev =>
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
          updateConversationsCache(prev => prev.filter(c => c.id !== deleted.id));
        }
      )
      .subscribe();

    const visitorsChannel = supabase
      .channel(`visitors-realtime-${realtimeChannelSuffixRef.current}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'visitors' },
        (payload) => {
          console.log('[useConversations] Visitor updated:', payload);
          const updatedVisitor = payload.new as DbVisitor;
          
          updateConversationsCache(prev =>
            prev.map(c => 
              c.visitor?.id === updatedVisitor.id
                ? { ...c, visitor: updatedVisitor }
                : c
            )
          );
        }
      )
      .subscribe();

    // Fetch a single conversation with its relations
    const fetchSingleConversation = async (conversationId: string) => {
      const { data } = await supabase
        .from('conversations')
        .select(`*, visitor:visitors(*), property:properties(*)`)
        .eq('id', conversationId)
        .single();
      
      if (!data) return;
      
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sequence_number', { ascending: true });
      
      // Skip if no visitor messages yet
      if (!messages?.some(m => m.sender_type === 'visitor')) return;
      
      const newConversation: DbConversation = {
        ...data,
        messages: (messages || []).map(m => ({
          ...m,
          sender_type: m.sender_type as 'agent' | 'visitor',
        })),
        status: data.status as 'active' | 'closed' | 'pending',
      };
      
      updateConversationsCache(prev => {
        if (prev.some(c => c.id === data.id)) return prev;
        return [newConversation, ...prev];
      });
    };

    return () => {
      console.log('[useConversations] Cleaning up realtime subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(visitorsChannel);
    };
  }, [user, selectedPropertyId, updateConversationsCache]);

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
    refetch: refetchConversations,
  };
};
