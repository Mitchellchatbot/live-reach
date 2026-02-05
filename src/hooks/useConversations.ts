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

  // Avoid channel-name collisions when this hook is mounted in multiple places (e.g. sidebar + widget preview).
  const realtimeChannelSuffixRef = useRef<string>(
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  // Important: `loading` should represent BOTH properties + conversations.
  // Otherwise route guards may think there are "no properties" while the properties request is still in-flight.
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

      // Fetch messages for each conversation
      const conversationsWithMessages = await Promise.all(
        (convData || []).map(async (conv) => {
          try {
            const { data: messages } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('sequence_number', { ascending: true });

            return {
              ...conv,
              status: conv.status as 'active' | 'closed' | 'pending',
              messages: (messages || []).map((m) => ({
                ...m,
                sender_type: m.sender_type as 'agent' | 'visitor',
              })),
            };
          } catch (msgErr) {
            console.error('[fetchConversations] message fetch error:', msgErr);
            return { ...conv, status: conv.status as 'active' | 'closed' | 'pending', messages: [] };
          }
        })
      );

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

    // Update conversation: set status to active, disable AI when human agent sends a message
    // This ensures the widget knows a human has taken over and won't generate AI responses.
    await supabase
      .from('conversations')
      .update({ 
        status: 'active', 
        updated_at: new Date().toISOString(),
        ai_enabled: false,
      })
      .eq('id', conversationId);

    // Update local state immediately
    setConversations(prev => 
      prev.map(c => c.id === conversationId ? { ...c, ai_enabled: false, status: 'active' as const } : c)
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
    await fetchConversations();
    return true;
  };

  const deleteConversation = async (conversationId: string) => {
    // First delete all messages for this conversation
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      toast.error('Failed to delete conversation');
      return false;
    }

    // Then delete the conversation
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
    await fetchConversations();
    return true;
  };

  const deleteConversations = async (conversationIds: string[]) => {
    // First delete all messages for these conversations
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .in('conversation_id', conversationIds);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      toast.error('Failed to delete conversations');
      return false;
    }

    // Then delete the conversations
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
    await fetchConversations();
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
      // AI Agent info from onboarding
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

    // Create AI agent if name was provided during onboarding
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
      // Don't fail the whole operation, just log the error
    } else if (aiAgent) {
      // Link AI agent to property
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

    // Update local state immediately
    setConversations(prev => 
      prev.map(c => c.id === conversationId ? { ...c, ai_enabled: enabled } : c)
    );
    return true;
  };

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setProperties([]);
      setLoading(false);
      setPropertiesLoaded(false);
      setConversationsLoaded(false);
      return;
    }

    // New session / mount: reset to a known loading state.
    setLoading(true);
    setPropertiesLoaded(false);
    setConversationsLoaded(false);

    fetchProperties();
    fetchConversations();
  }, [user, fetchProperties, fetchConversations]);

  useEffect(() => {
    if (propertiesLoaded && conversationsLoaded) {
      setLoading(false);
    }
  }, [propertiesLoaded, conversationsLoaded]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    console.log('[useConversations] Setting up realtime subscriptions');

    const messagesChannel = supabase
      .channel(`messages-realtime-${realtimeChannelSuffixRef.current}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('[useConversations] Messages change detected:', payload);
          fetchConversations().catch((err) => console.error('[RT messages]', err));
        }
      )
      .subscribe((status) => {
        console.log('[useConversations] Messages channel status:', status);
      });

    const conversationsChannel = supabase
      .channel(`conversations-realtime-${realtimeChannelSuffixRef.current}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload) => {
          console.log('[useConversations] Conversations change detected:', payload);
          fetchConversations().catch((err) => console.error('[RT conversations]', err));
        }
      )
      .subscribe((status) => {
        console.log('[useConversations] Conversations channel status:', status);
      });

    // Subscribe to visitor updates (for AI-extracted info)
    const visitorsChannel = supabase
      .channel(`visitors-realtime-${realtimeChannelSuffixRef.current}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visitors' },
        (payload) => {
          console.log('[useConversations] Visitors change detected:', payload);
          fetchConversations().catch((err) => console.error('[RT visitors]', err));
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
