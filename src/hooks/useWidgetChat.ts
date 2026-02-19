import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { maybeInjectTypo, maybeDropCapitalization, maybeDropApostrophes } from '@/utils/typoInjector';

declare global {
  interface Window {
    __scaledbot_session_id?: string;
  }
}

interface Message {
  id: string;
  content: string;
  sender_type: 'agent' | 'visitor';
  created_at: string;
  sequence_number?: number;
  agent_name?: string;
  agent_avatar?: string | null;
}

export interface AIAgent {
  id: string;
  name: string;
  avatar_url: string | null;
  personality_prompt: string | null;
}

interface PropertySettings {
  ai_response_delay_min_ms: number;
  ai_response_delay_max_ms: number;
  typing_indicator_min_ms: number;
  typing_indicator_max_ms: number;
  smart_typing_enabled: boolean;
  typing_wpm: number;
  max_ai_messages_before_escalation: number;
  escalation_keywords: string[];
  auto_escalation_enabled: boolean;
  require_email_before_chat: boolean;
  require_name_before_chat: boolean;
  require_phone_before_chat: boolean;
  require_insurance_card_before_chat: boolean;
  natural_lead_capture_enabled: boolean;
  proactive_message_enabled: boolean;
  proactive_message: string | null;
  proactive_message_delay_seconds: number;
  greeting: string | null;
  ai_base_prompt: string | null;
  widget_icon: string | null;
  calendly_url: string | null;
  human_typos_enabled: boolean;
  drop_capitalization_enabled: boolean;
  drop_apostrophes_enabled: boolean;
  quick_reply_after_first_enabled: boolean;
}

interface WidgetChatConfig {
  propertyId: string;
  greeting?: string;
  isPreview?: boolean;
}

const DEFAULT_SETTINGS: PropertySettings = {
  ai_response_delay_min_ms: 20000,
  ai_response_delay_max_ms: 28000,
  typing_indicator_min_ms: 1500,
  typing_indicator_max_ms: 3000,
  smart_typing_enabled: true,
  typing_wpm: 60,
  max_ai_messages_before_escalation: 5,
  escalation_keywords: ['crisis', 'emergency', 'suicide', 'help me', 'urgent'],
  auto_escalation_enabled: true,
  require_email_before_chat: false,
  require_name_before_chat: true,
  require_phone_before_chat: true,
  require_insurance_card_before_chat: true,
  natural_lead_capture_enabled: true,
  proactive_message_enabled: false,
  proactive_message: null,
  proactive_message_delay_seconds: 30,
  greeting: null,
  ai_base_prompt: null,
  widget_icon: 'message-circle',
  calendly_url: null,
  human_typos_enabled: true,
  drop_capitalization_enabled: true,
  drop_apostrophes_enabled: true,
  quick_reply_after_first_enabled: false,
};

const getOrCreateSessionId = (): string => {
  const key = 'chat_session_id';
  try {
    let sessionId = localStorage.getItem(key);
    if (!sessionId) {
      sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(key, sessionId);
    }
    return sessionId;
  } catch {
    // Some browsers block localStorage in 3rd-party iframes; fall back to in-memory.
    if (!window.__scaledbot_session_id) {
      window.__scaledbot_session_id = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    return window.__scaledbot_session_id;
  }
};

const getBrowserInfo = (): string => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  const os = ua.includes('Windows') ? 'Windows' 
    : ua.includes('Mac') ? 'macOS' 
    : ua.includes('Linux') ? 'Linux' 
    : ua.includes('Android') ? 'Android' 
    : ua.includes('iOS') ? 'iOS' 
    : 'Unknown';
  
  return `${browser}, ${os}`;
};

const getParentPageUrl = (): string | null => {
  // Prefer the parentUrl query param injected by the embed script (most reliable).
  try {
    const params = new URLSearchParams(window.location.search);
    const parentUrl = params.get('parentUrl');
    if (parentUrl) return parentUrl;
  } catch {
    // ignore
  }

  // Fallback: document.referrer (unreliable — can be stripped by referrer policies).
  const ref = document.referrer;
  if (!ref) return null;

  // Avoid self-reporting the embed URL.
  if (ref.includes('/widget-embed/')) return null;
  return ref;
};

const getEffectivePageUrl = (): string => {
  return getParentPageUrl() ?? window.location.href;
};

const getEffectivePagePath = (): string => {
  const parentUrl = getParentPageUrl();
  if (!parentUrl) return window.location.pathname;

  try {
    const u = new URL(parentUrl);
    // Keep query params for attribution/debugging.
    return `${u.pathname}${u.search}`;
  } catch {
    return parentUrl;
  }
};

const getPageInfo = () => {
  const url = getEffectivePageUrl();
  const pageTitle = url === window.location.href ? document.title : null;
  return { url, pageTitle };
};

// Extract GCLID and other tracking parameters from URL
const getTrackingParams = () => {
  const parentUrl = getParentPageUrl();
  const params = parentUrl
    ? (() => {
        try {
          return new URL(parentUrl).searchParams;
        } catch {
          return new URLSearchParams();
        }
      })()
    : new URLSearchParams(window.location.search);

  return {
    gclid: params.get('gclid') || null, // Google Click ID
  };
};

const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`;
const TRACK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-page-analytics`;
const EXTRACT_INFO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-visitor-info`;
const LOCATION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-visitor-location`;
const UPDATE_VISITOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-visitor`;
const AI_AGENTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-property-ai-agents`;
const SETTINGS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-property-settings`;
const BOOTSTRAP_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget-bootstrap`;
const CREATE_CONVERSATION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget-create-conversation`;
const SAVE_MESSAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget-save-message`;
const GET_MESSAGES_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget-get-messages`;
const PRESENCE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget-conversation-presence`;
const SET_AI_QUEUE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget-set-ai-queue`;

// Secure visitor update through edge function
const updateVisitorSecure = async (
  visitorId: string,
  sessionId: string,
  updates: Record<string, unknown>
) => {
  try {
    const response = await fetch(UPDATE_VISITOR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ visitorId, sessionId, updates }),
    });
    
    if (!response.ok) {
      console.error('Failed to update visitor:', await response.text());
    }
  } catch (error) {
    console.error('Error updating visitor:', error);
  }
};

// Mark the conversation as active/closed based on widget visibility.
// This is "best effort" (unload events are not guaranteed), so we also rely on
// dashboard-side stale closing to keep statuses accurate.
const updateConversationPresenceSecure = async (args: {
  propertyId: string;
  visitorId: string;
  sessionId: string;
  status: 'active' | 'closed';
}) => {
  try {
    const resp = await fetch(PRESENCE_URL, {
      method: 'POST',
      keepalive: args.status === 'closed',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(args),
    });

    if (!resp.ok) {
      console.error('Failed to update conversation presence:', await resp.text());
    }
  } catch (error) {
    // Swallow errors (especially on unload), but log in case it's systematic.
    console.error('Error updating conversation presence:', error);
  }
};

const fetchVisitorLocation = async (visitorId: string) => {
  try {
    await fetch(LOCATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ visitorId }),
    });
  } catch (error) {
    console.error('Failed to fetch visitor location:', error);
  }
};

const extractVisitorInfo = async (
  visitorId: string,
  conversationHistory: { role: string; content: string }[]
) => {
  if (!visitorId || conversationHistory.length < 1) return;
  
  try {
    await fetch(EXTRACT_INFO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        visitorId,
        conversationHistory,
      }),
    });
  } catch (error) {
    console.error('Failed to extract visitor info:', error);
  }
};
  const trackAnalyticsEvent = async (
  propertyId: string,
  eventType: 'chat_open' | 'human_escalation'
) => {
  const { url, pageTitle } = getPageInfo();
  try {
    await fetch(TRACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        property_id: propertyId,
        url,
          page_title: pageTitle,
        event_type: eventType,
      }),
    });
  } catch (error) {
    console.error('Failed to track analytics event:', error);
  }
};

async function streamAIResponse({
  messages,
  onDelta,
  onDone,
  onError,
  personalityPrompt,
  agentName,
  basePrompt,
  naturalLeadCaptureFields,
  calendlyUrl,
  humanTyposEnabled,
}: {
  messages: { role: 'user' | 'assistant'; content: string }[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  personalityPrompt?: string | null;
  agentName?: string;
  basePrompt?: string | null;
  naturalLeadCaptureFields?: string[];
  calendlyUrl?: string | null;
  humanTyposEnabled?: boolean;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, personalityPrompt, agentName, basePrompt, naturalLeadCaptureFields, calendlyUrl, humanTyposEnabled }),
    });

    if (!resp.ok) {
      const error = await resp.json();
      onError(error.error || 'Failed to get AI response');
      return;
    }

    if (!resp.body) {
      onError('No response body');
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (error) {
    console.error('Stream error:', error);
    onError('Connection error. Please try again.');
  }
}

export const useWidgetChat = ({ propertyId, greeting, isPreview = false }: WidgetChatConfig) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [chatOpenTracked, setChatOpenTracked] = useState(false);
  const [humanEscalationTracked, setHumanEscalationTracked] = useState(false);
  const [settings, setSettings] = useState<PropertySettings>(DEFAULT_SETTINGS);
  const [isEscalated, setIsEscalated] = useState(false); // Escalation triggered (conversation visible to agents)
  const [humanHasTakenOver, setHumanHasTakenOver] = useState(false); // Human agent has actually responded
  const [requiresLeadCapture, setRequiresLeadCapture] = useState(false);
  const [visitorInfo, setVisitorInfo] = useState<{ name?: string; email?: string }>({});
  const [showProactiveMessage, setShowProactiveMessage] = useState(false);
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  const [currentAiAgent, setCurrentAiAgent] = useState<AIAgent | null>(null);
  const [greetingText, setGreetingText] = useState<string>(''); // Static greeting from property settings
  
  const aiMessageCountRef = useRef(0);
  const proactiveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const aiAgentIndexRef = useRef(0);
  const visitorIdRef = useRef<string | null>(null); // Ref to track current visitor ID for extraction
  const conversationIdRef = useRef<string | null>(null);
  const lastSeqRef = useRef<number>(0); // Track last sequence number for message polling
  const humanHasTakenOverRef = useRef(false); // True only when a human agent has actually responded
  const aiEnabledRef = useRef<boolean>(true); // Tracks dashboard AI toggle (do not conflate with human takeover)
  const prevAiEnabledRef = useRef<boolean | null>(null);
  const autoReplyInFlightRef = useRef(false);
  const lastAutoReplyVisitorSeqRef = useRef<number>(0);
  // True while sendMessage's hybrid flow (generate→queue→wait→send) is in progress.
  // Prevents autoReplyIfPending from firing a duplicate AI message for the same visitor turn.
  const hybridFlowActiveRef = useRef(false);

  const calculateTypingTimeMs = useCallback((text: string): number => {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const wordsPerSecond = (settings.typing_wpm || DEFAULT_SETTINGS.typing_wpm) / 60;
    return Math.ceil((wordCount / wordsPerSecond) * 1000);
  }, [settings.typing_wpm]);

  const toAiHistoryFromDb = useCallback((dbMessages: { sender_type: string; content: string }[]) => {
    // Keep greeting/proactive out of the AI history; proactive is UI-only anyway.
    return dbMessages
      .filter(m => String(m.content || '').trim() !== '')
      .map(m => ({
        role: m.sender_type === 'visitor' ? 'user' as const : 'assistant' as const,
        content: String(m.content),
      }));
  }, []);

  const refreshAiEnabledFromServer = useCallback(async (): Promise<boolean> => {
    // Only meaningful for real embeds.
    if (isPreview || !propertyId || propertyId === 'demo') return true;
    const convId = conversationIdRef.current;
    const vId = visitorIdRef.current;
    if (!convId || !vId) return aiEnabledRef.current;

    const sessionId = getOrCreateSessionId();
    try {
      const resp = await fetch(GET_MESSAGES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          conversationId: convId,
          visitorId: vId,
          sessionId,
          // Keep it small; we only need aiEnabled.
          afterSequence: lastSeqRef.current,
        }),
      });

      if (!resp.ok) return aiEnabledRef.current;
      const data = await resp.json();
      const next = (data?.aiEnabled ?? true) as boolean;
      aiEnabledRef.current = next;
      prevAiEnabledRef.current = next;
      return next;
    } catch {
      return aiEnabledRef.current;
    }
  }, [isPreview, propertyId]);

  // Fetch AI agents for this property via edge function (works without auth)
  const fetchAiAgents = useCallback(async (): Promise<AIAgent[]> => {
    if (!propertyId || propertyId === 'demo') {
      setAiAgents([]);
      setCurrentAiAgent(null);
      return [];
    }

    try {
      const response = await fetch(AI_AGENTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ propertyId }),
      });

      if (!response.ok) {
        console.error('Failed to fetch AI agents:', response.status);
        setAiAgents([]);
        setCurrentAiAgent(null);
        return [];
      }

      const data = await response.json();
      const agents: AIAgent[] = data.agents || [];

      if (agents.length > 0) {
        setAiAgents(agents);
        setCurrentAiAgent(agents[0]);
      } else {
        setAiAgents([]);
        setCurrentAiAgent(null);
      }
      return agents;
    } catch (error) {
      console.error('Error fetching AI agents:', error);
      setAiAgents([]);
      setCurrentAiAgent(null);
      return [];
    }
  }, [propertyId]);

  // Cycle to next AI agent
  const cycleToNextAgent = useCallback(() => {
    if (aiAgents.length <= 1) return;
    
    aiAgentIndexRef.current = (aiAgentIndexRef.current + 1) % aiAgents.length;
    setCurrentAiAgent(aiAgents[aiAgentIndexRef.current]);
  }, [aiAgents]);

  // Fetch property settings (works for live embeds without requiring auth)
  const fetchSettings = useCallback(async (): Promise<PropertySettings> => {
    if (!propertyId || propertyId === 'demo') return DEFAULT_SETTINGS;

    try {
      const response = await fetch(SETTINGS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ propertyId }),
      });

      if (!response.ok) {
        console.error('Failed to fetch property settings:', response.status, await response.text());
        setSettings(DEFAULT_SETTINGS);
        setRequiresLeadCapture(false);
        return DEFAULT_SETTINGS;
      }

      const data = await response.json();
      const s = data?.settings ?? null;
      if (!s) {
        setSettings(DEFAULT_SETTINGS);
        setRequiresLeadCapture(false);
        return DEFAULT_SETTINGS;
      }

      const merged: PropertySettings = {
        ...DEFAULT_SETTINGS,
        ai_response_delay_min_ms: s.ai_response_delay_min_ms ?? DEFAULT_SETTINGS.ai_response_delay_min_ms,
        ai_response_delay_max_ms: s.ai_response_delay_max_ms ?? DEFAULT_SETTINGS.ai_response_delay_max_ms,
        typing_indicator_min_ms: s.typing_indicator_min_ms ?? DEFAULT_SETTINGS.typing_indicator_min_ms,
        typing_indicator_max_ms: s.typing_indicator_max_ms ?? DEFAULT_SETTINGS.typing_indicator_max_ms,
        smart_typing_enabled: s.smart_typing_enabled ?? DEFAULT_SETTINGS.smart_typing_enabled,
        typing_wpm: s.typing_wpm ?? DEFAULT_SETTINGS.typing_wpm,
        max_ai_messages_before_escalation: s.max_ai_messages_before_escalation ?? DEFAULT_SETTINGS.max_ai_messages_before_escalation,
        escalation_keywords: s.escalation_keywords ?? DEFAULT_SETTINGS.escalation_keywords,
        auto_escalation_enabled: s.auto_escalation_enabled ?? DEFAULT_SETTINGS.auto_escalation_enabled,
        require_email_before_chat: s.require_email_before_chat ?? DEFAULT_SETTINGS.require_email_before_chat,
        require_name_before_chat: s.require_name_before_chat ?? DEFAULT_SETTINGS.require_name_before_chat,
        require_phone_before_chat: s.require_phone_before_chat ?? DEFAULT_SETTINGS.require_phone_before_chat,
        require_insurance_card_before_chat: s.require_insurance_card_before_chat ?? DEFAULT_SETTINGS.require_insurance_card_before_chat,
        natural_lead_capture_enabled: s.natural_lead_capture_enabled ?? DEFAULT_SETTINGS.natural_lead_capture_enabled,
        proactive_message_enabled: s.proactive_message_enabled ?? DEFAULT_SETTINGS.proactive_message_enabled,
        proactive_message: s.proactive_message ?? null,
        proactive_message_delay_seconds: s.proactive_message_delay_seconds ?? DEFAULT_SETTINGS.proactive_message_delay_seconds,
        greeting: s.greeting ?? null,
        ai_base_prompt: s.ai_base_prompt ?? null,
        widget_icon: s.widget_icon ?? DEFAULT_SETTINGS.widget_icon,
        calendly_url: s.calendly_url ?? null,
        human_typos_enabled: s.human_typos_enabled ?? DEFAULT_SETTINGS.human_typos_enabled,
        drop_capitalization_enabled: s.drop_capitalization_enabled ?? DEFAULT_SETTINGS.drop_capitalization_enabled,
        drop_apostrophes_enabled: s.drop_apostrophes_enabled ?? DEFAULT_SETTINGS.drop_apostrophes_enabled,
        quick_reply_after_first_enabled: s.quick_reply_after_first_enabled ?? DEFAULT_SETTINGS.quick_reply_after_first_enabled,
      };

      setSettings(merged);

      // Check if lead capture is required - only if NOT using natural lead capture
      const naturalEnabled = merged.natural_lead_capture_enabled ?? true;
      if (!naturalEnabled && (merged.require_email_before_chat || merged.require_name_before_chat)) {
        setRequiresLeadCapture(true);
      } else {
        setRequiresLeadCapture(false);
      }

      return merged;
    } catch (error) {
      console.error('Error fetching property settings:', error);
      setSettings(DEFAULT_SETTINGS);
      setRequiresLeadCapture(false);
      return DEFAULT_SETTINGS;
    }
  }, [propertyId]);

  const ensureWidgetIds = useCallback(async (fetchedAgents?: AIAgent[]) => {
    if (!propertyId || propertyId === 'demo' || isPreview) return;
    if (visitorIdRef.current) return; // Already have visitor

    const sessionId = getOrCreateSessionId();
    const trackingParams = getTrackingParams();

    try {
      const response = await fetch(BOOTSTRAP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          propertyId,
          sessionId,
          currentPage: getEffectivePagePath(),
          browserInfo: getBrowserInfo(),
          gclid: trackingParams.gclid,
        }),
      });

      if (!response.ok) {
        console.error('Widget bootstrap failed:', response.status, await response.text());
        return;
      }

      const data = await response.json();
      if (data?.visitorId) {
        setVisitorId(data.visitorId);
        visitorIdRef.current = data.visitorId;
      }
      // Store greeting from property settings for static display
      if (data?.greeting) {
        setGreetingText(data.greeting);
      }
      if (data?.conversationId) {
        setConversationId(data.conversationId);
        conversationIdRef.current = data.conversationId;
      }
      if (data?.visitorInfo) {
        setVisitorInfo({
          name: data.visitorInfo?.name || undefined,
          email: data.visitorInfo?.email || undefined,
        });
        if (data.visitorInfo?.name || data.visitorInfo?.email) {
          setRequiresLeadCapture(false);
        }
      }

      // Load existing messages for returning visitors (only if conversation exists)
      if (data?.visitorId && data?.conversationId) {
        try {
          const msgResponse = await fetch(GET_MESSAGES_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              conversationId: data.conversationId,
              visitorId: data.visitorId,
              sessionId,
            }),
          });

          if (msgResponse.ok) {
            const msgData = await msgResponse.json();
            const existingMessages = msgData.messages || [];
            // Track current AI enabled state from server.
            aiEnabledRef.current = (msgData?.aiEnabled ?? true) as boolean;
            prevAiEnabledRef.current = aiEnabledRef.current;
            
            if (existingMessages.length > 0) {
              // Map DB messages to UI format
              const greetingAgent = fetchedAgents && fetchedAgents.length > 0 ? fetchedAgents[0] : null;
              const mappedMessages: Message[] = existingMessages.map((m: { id: string; content: string; sender_type: string; sender_id: string; created_at: string; sequence_number: number }) => ({
                id: m.id,
                content: m.content,
                sender_type: m.sender_type === 'agent' ? 'agent' : 'visitor',
                created_at: m.created_at,
                sequence_number: m.sequence_number,
                // Add agent info for agent messages
                agent_name: m.sender_type === 'agent' ? greetingAgent?.name : undefined,
                agent_avatar: m.sender_type === 'agent' ? greetingAgent?.avatar_url : undefined,
              }));

              setMessages(mappedMessages);
              
              // Update lastSeqRef to prevent re-fetching these messages
              const maxSeq = Math.max(...existingMessages.map((m: { sequence_number: number }) => m.sequence_number || 0));
              lastSeqRef.current = maxSeq;

              // Check if a human has taken over (any agent message not from ai-bot)
              const humanAgentMsg = existingMessages.find((m: { sender_type: string; sender_id: string }) => 
                m.sender_type === 'agent' && m.sender_id !== 'ai-bot'
              );
              if (humanAgentMsg) {
                setHumanHasTakenOver(true);
                humanHasTakenOverRef.current = true;
              }
            }
          }
        } catch (msgError) {
          console.error('Failed to load existing messages:', msgError);
        }
      }

      // Fire-and-forget geolocation fetch
      if (data?.visitorId) {
        fetchVisitorLocation(data.visitorId).catch(() => {});
      }
    } catch (e) {
      console.error('Widget bootstrap error:', e);
    }
  }, [propertyId, isPreview]);

  // Create conversation on-demand (lazy creation when visitor sends first message)
  const ensureConversationExists = useCallback(async (): Promise<string | null> => {
    if (!propertyId || propertyId === 'demo' || isPreview) return null;
    if (conversationIdRef.current) return conversationIdRef.current;
    if (!visitorIdRef.current) return null;

    const sessionId = getOrCreateSessionId();

    try {
      const response = await fetch(CREATE_CONVERSATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          propertyId,
          visitorId: visitorIdRef.current,
          sessionId,
        }),
      });

      if (!response.ok) {
        console.error('Widget create conversation failed:', response.status, await response.text());
        return null;
      }

      const data = await response.json();
      if (data?.conversationId) {
        setConversationId(data.conversationId);
        conversationIdRef.current = data.conversationId;
        return data.conversationId;
      }
      return null;
    } catch (e) {
      console.error('Widget create conversation error:', e);
      return null;
    }
  }, [propertyId, isPreview]);

  // Check for escalation keywords in message
  const checkForEscalationKeywords = useCallback((content: string): boolean => {
    if (!settings.auto_escalation_enabled) return false;
    const lowerContent = content.toLowerCase();
    return settings.escalation_keywords.some(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    );
  }, [settings.auto_escalation_enabled, settings.escalation_keywords]);

  // Trigger escalation - silently escalate without announcing to visitor
  const triggerEscalation = useCallback(async () => {
    if (isEscalated) return;
    
    setIsEscalated(true);
    
    // Track escalation event
    if (propertyId && propertyId !== 'demo' && !humanEscalationTracked) {
      setHumanEscalationTracked(true);
      trackAnalyticsEvent(propertyId, 'human_escalation');
    }

    // For preview mode, create a real test conversation in the database
    if (isPreview && propertyId && propertyId !== 'demo') {
      try {
        // Create a test visitor
        const testSessionId = `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const { data: testVisitor, error: visitorError } = await supabase
          .from('visitors')
          .insert({
            property_id: propertyId,
            session_id: testSessionId,
            browser_info: 'Test Widget Preview',
            current_page: '/widget-preview',
          })
          .select()
          .single();

        if (!visitorError && testVisitor) {
          // Fetch geolocation for test visitor (non-blocking)
          fetchVisitorLocation(testVisitor.id);
        }

        if (visitorError || !testVisitor) {
          console.error('Error creating test visitor:', visitorError);
        } else {
          // Create a test conversation marked with is_test = true
          const { data: testConversation, error: convError } = await supabase
            .from('conversations')
            .insert({
              property_id: propertyId,
              visitor_id: testVisitor.id,
              status: 'active',
              is_test: true,
            })
            .select()
            .single();

          if (convError || !testConversation) {
            console.error('Error creating test conversation:', convError);
          } else {
            // Include all messages including the greeting with sequence numbers
            const allMessages = messages.filter(m => m.content.trim() !== '');
            const messagesToSave = allMessages.map((m, index) => ({
              conversation_id: testConversation.id,
              sender_id: m.sender_type === 'visitor' ? testVisitor.id : 'ai-bot',
              sender_type: m.sender_type,
              content: m.content,
              sequence_number: index + 1,
            }));

            if (messagesToSave.length > 0) {
              await supabase.from('messages').insert(messagesToSave);
            }

            setConversationId(testConversation.id);
            setVisitorId(testVisitor.id);
            visitorIdRef.current = testVisitor.id; // Update ref immediately for extraction

            // Trigger extraction for test conversations too
            const conversationHistory = allMessages.map(m => ({
              role: m.sender_type === 'visitor' ? 'user' : 'assistant',
              content: m.content,
            }));
            if (conversationHistory.length >= 1) {
              extractVisitorInfo(testVisitor.id, conversationHistory);
            }
          }
        }
      } catch (error) {
        console.error('Error creating test conversation:', error);
      }
    } else if (conversationId) {
      // Update existing conversation status to active (for human agent)
      await supabase
        .from('conversations')
        .update({ status: 'active' })
        .eq('id', conversationId);

      // Save the greeting if it exists and hasn't been saved yet
      const greetingMsg = messages.find(m => m.id === 'greeting');
      if (greetingMsg && visitorId) {
        // Check if greeting is already in DB
        const { data: existingMsgs } = await supabase
          .from('messages')
          .select('id')
          .eq('conversation_id', conversationId)
          .limit(1);
        
        // If no messages yet, add the greeting first with sequence_number 1
        if (!existingMsgs || existingMsgs.length === 0) {
          await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: 'ai-bot',
            sender_type: 'agent',
            content: greetingMsg.content,
            sequence_number: 1,
          });
        }
      }

      // Fire escalation notifications (non-blocking)
      const lastVisitorMsg = [...messages].reverse().find(m => m.sender_type === 'visitor');
      const escalationPayload = JSON.stringify({
        propertyId,
        eventType: 'escalation',
        conversationId,
        message: lastVisitorMsg?.content,
      });
      const notifyHeaders = { 'Content-Type': 'application/json' };

      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-notification`, {
        method: 'POST',
        headers: notifyHeaders,
        body: escalationPayload,
      }).catch(err => console.error('Escalation email notification error:', err));

      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-slack-notification`, {
        method: 'POST',
        headers: notifyHeaders,
        body: escalationPayload,
      }).catch(err => console.error('Escalation Slack notification error:', err));
    }

    // NO announcement message - AI will keep chatting until human takes over
    // The conversation is now in 'active' status so human agents can see and respond
  }, [isEscalated, propertyId, humanEscalationTracked, conversationId, isPreview, messages, visitorId]);

  const autoReplyIfPending = useCallback(async () => {
    if (autoReplyInFlightRef.current) return;
    if (hybridFlowActiveRef.current) return; // sendMessage hybrid flow is handling this turn
    if (isTyping) return;
    if (isPreview || !propertyId || propertyId === 'demo') return;

    const convId = conversationIdRef.current;
    const vId = visitorIdRef.current;
    if (!convId || !vId) return;

    const sessionId = getOrCreateSessionId();
    autoReplyInFlightRef.current = true;

    try {
      const response = await fetch(GET_MESSAGES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          conversationId: convId,
          visitorId: vId,
          sessionId,
        }),
      });

      if (!response.ok) return;
      const data = await response.json();
      const serverAiEnabled = (data?.aiEnabled ?? true) as boolean;
      aiEnabledRef.current = serverAiEnabled;
      prevAiEnabledRef.current = serverAiEnabled;
      if (!serverAiEnabled) return;
      if (humanHasTakenOverRef.current) return; // human override still wins

      const dbMessages = (data?.messages ?? []) as Array<{
        sender_type: 'agent' | 'visitor';
        content: string;
        sequence_number?: number;
      }>;

      if (dbMessages.length === 0) return;
      const last = dbMessages[dbMessages.length - 1];
      if (last.sender_type !== 'visitor') return;
      const lastVisitorSeq = typeof last.sequence_number === 'number' ? last.sequence_number : 0;
      if (lastVisitorSeq <= lastAutoReplyVisitorSeqRef.current) return;

      // Mark handled so we don't auto-reply repeatedly on subsequent polls.
      lastAutoReplyVisitorSeqRef.current = lastVisitorSeq;

      // Generate-first approach (mirrors the hybrid flow):
      // 1. Pick the human-priority window (responseDelay) based on first/quick-reply settings
      // 2. Generate the AI response immediately (so generation time eats into the window)
      // 3. Wait the remaining window time after generation completes
      // 4. Add smart-typing duration ON TOP of the window
      // 5. Reveal to visitor
      const isFirstAutoReply = aiMessageCountRef.current === 0;
      const useQuickReplyAuto = settings.quick_reply_after_first_enabled && !isFirstAutoReply;
      const responseDelay = useQuickReplyAuto
        ? randomInRange(15000, 25000)
        : randomInRange(settings.ai_response_delay_min_ms, settings.ai_response_delay_max_ms);

      const respondingAgent = currentAiAgent;
      const naturalLeadCaptureFields: string[] = [];
      if (settings.natural_lead_capture_enabled) {
        if (settings.require_name_before_chat) naturalLeadCaptureFields.push('name');
        if (settings.require_email_before_chat) naturalLeadCaptureFields.push('email');
        if (settings.require_phone_before_chat) naturalLeadCaptureFields.push('phone');
        if (settings.require_insurance_card_before_chat) naturalLeadCaptureFields.push('insurance_card');
      }

      const aiHistory = toAiHistoryFromDb(dbMessages);

      // Step 1: Generate AI response immediately (generation time counts against the window)
      const generationStart = Date.now();
      let aiContent = '';
      let generationError = false;

      await new Promise<void>((resolve) => {
        streamAIResponse({
          messages: aiHistory,
          personalityPrompt: respondingAgent?.personality_prompt,
          agentName: respondingAgent?.name,
          basePrompt: settings.ai_base_prompt,
          naturalLeadCaptureFields: naturalLeadCaptureFields.length > 0 ? naturalLeadCaptureFields : undefined,
          calendlyUrl: settings.calendly_url,
          humanTyposEnabled: settings.human_typos_enabled ?? true,
          onDelta: (delta) => { aiContent += delta; },
          onDone: () => {
            if (settings.human_typos_enabled) aiContent = maybeInjectTypo(aiContent, propertyId);
            if (settings.drop_capitalization_enabled) aiContent = maybeDropCapitalization(aiContent);
            if (settings.drop_apostrophes_enabled) aiContent = maybeDropApostrophes(aiContent);
            resolve();
          },
          onError: (err) => {
            console.error('AI Error (autoReply):', err);
            generationError = true;
            resolve();
          },
        });
      });

      if (generationError || !aiContent) return;

      // Step 2: Wait remaining window time (human-priority window minus generation elapsed)
      const generationElapsed = Date.now() - generationStart;
      const remainingDelay = Math.max(0, responseDelay - generationElapsed);
      if (remainingDelay > 0) await sleep(remainingDelay);

      // Step 3: Smart typing on top of the window
      const aiMessageId = `ai-auto-${Date.now()}`;
      setIsTyping(true);

      if (settings.smart_typing_enabled) {
        const calculatedTypingTime = calculateTypingTimeMs(aiContent);
        const minTypingTime = randomInRange(settings.typing_indicator_min_ms, settings.typing_indicator_max_ms);
        const targetTypingTime = Math.max(calculatedTypingTime, minTypingTime);
        await sleep(targetTypingTime);
      } else {
        const typingDuration = randomInRange(settings.typing_indicator_min_ms, settings.typing_indicator_max_ms);
        await sleep(typingDuration);
      }

      // Step 4: Save to DB and reveal to visitor
      const saveAiToDb = async (finalContent: string) => {
        const saveResp = await fetch(SAVE_MESSAGE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            conversationId: convId,
            visitorId: vId,
            sessionId,
            senderType: 'agent',
            content: finalContent,
          }),
        });
        if (!saveResp.ok) console.error('Failed to save auto AI message:', await saveResp.text());
      };

      if (aiContent) await saveAiToDb(aiContent);

      setMessages(prev => [...prev, {
        id: aiMessageId,
        content: aiContent,
        sender_type: 'agent' as const,
        created_at: new Date().toISOString(),
        agent_name: respondingAgent?.name,
        agent_avatar: respondingAgent?.avatar_url,
      }]);
      setIsTyping(false);

      aiMessageCountRef.current += 1;
      cycleToNextAgent();

      if (settings.auto_escalation_enabled && aiMessageCountRef.current >= settings.max_ai_messages_before_escalation) {
        await triggerEscalation();
      }
    } catch (e) {
      console.error('autoReplyIfPending error:', e);
    } finally {
      autoReplyInFlightRef.current = false;
    }
  }, [
    isTyping,
    isPreview,
    propertyId,
    settings,
    currentAiAgent,
    calculateTypingTimeMs,
    cycleToNextAgent,
    toAiHistoryFromDb,
    triggerEscalation,
  ]);

  // Start proactive message timer
  const startProactiveTimer = useCallback(() => {
    if (!settings.proactive_message_enabled || !settings.proactive_message) return;
    
    if (proactiveTimerRef.current) {
      clearTimeout(proactiveTimerRef.current);
    }

    proactiveTimerRef.current = setTimeout(() => {
      if (messages.length === 0) {
        setShowProactiveMessage(true);
        setMessages(prev => [...prev, {
          id: 'proactive',
          content: settings.proactive_message!,
          sender_type: 'agent',
          created_at: new Date().toISOString(),
        }]);
      }
    }, settings.proactive_message_delay_seconds * 1000);
  }, [settings.proactive_message_enabled, settings.proactive_message, settings.proactive_message_delay_seconds, messages]);

  const initializeChat = useCallback(async () => {
    // Fetch settings and AI agents in parallel - they're independent
    const [fetchedSettings, fetchedAgents] = await Promise.all([
      fetchSettings(),
      fetchAiAgents(),
    ]);

    // Store greeting for static display (not as a message)
    const greetingContent = greeting || fetchedSettings.greeting || '';
    if (greetingContent) {
      setGreetingText(greetingContent);
    }
    
    // For preview/demo mode, we're done - don't create DB records
    if (!propertyId || propertyId === 'demo' || isPreview) {
      setLoading(false);
      return;
    }

    // Mark loading as done early
    setLoading(false);

    // Background bootstrap (visitor only - conversation created lazily on first message)
    void ensureWidgetIds(fetchedAgents);
  }, [propertyId, greeting, fetchSettings, fetchAiAgents, isPreview, ensureWidgetIds]);

  // Submit lead info
  const submitLeadInfo = async (name?: string, email?: string) => {
    setVisitorInfo({ name, email });
    setRequiresLeadCapture(false);

    // Use ref to get the most current visitor ID (state may be stale in preview mode)
    const currentVisitorId = visitorIdRef.current || visitorId;
    if (currentVisitorId && (name || email)) {
      const sessionId = getOrCreateSessionId();
      await updateVisitorSecure(currentVisitorId, sessionId, { 
        name: name || null, 
        email: email || null 
      });
    }
  };

  const sendMessage = async (content: string) => {
    // Clear proactive timer when user sends a message
    if (proactiveTimerRef.current) {
      clearTimeout(proactiveTimerRef.current);
      proactiveTimerRef.current = null;
    }

    const visitorMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender_type: 'visitor',
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, visitorMessage]);

    // For real embeds, make sure visitor exists and conversation is created
    if (!isPreview && propertyId && propertyId !== 'demo') {
      await ensureWidgetIds();
      await ensureConversationExists();

      // ✅ Save visitor message to DB immediately (awaited) so dashboard sees it right away
      const convId = conversationIdRef.current;
      const vId = visitorIdRef.current;
      if (convId && vId) {
        const sessionId = getOrCreateSessionId();
        try {
          await fetch(SAVE_MESSAGE_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ conversationId: convId, visitorId: vId, sessionId, senderType: 'visitor', content }),
          });
        } catch (e) {
          console.error('Failed to save visitor message:', e);
        }
      }
    }

    // Track chat_open event on first message
    if (!chatOpenTracked && propertyId && propertyId !== 'demo') {
      setChatOpenTracked(true);
      trackAnalyticsEvent(propertyId, 'chat_open');
    }

    // Check for escalation keywords - trigger escalation but continue AI response
    if (checkForEscalationKeywords(content)) {
      await triggerEscalation();
      // Don't return - let AI continue responding until human takes over
    }

    // If AI was previously off, refresh aiEnabled right now (avoids race where user toggles on + immediately sends).
    let aiEnabledNow = aiEnabledRef.current;
    if (!aiEnabledNow) {
      aiEnabledNow = await refreshAiEnabledFromServer();
    }

    // Stop AI if either:
    // - dashboard has AI disabled, OR
    // - a human agent has actually responded
    // Visitor message was already saved to DB immediately above, just return.
    if (!aiEnabledNow || humanHasTakenOverRef.current) {
      if (isPreview && conversationId && visitorId) {
        // Preview/portal context: save message via supabase directly
        const { data: maxSeqData } = await supabase
          .from('messages')
          .select('sequence_number')
          .eq('conversation_id', conversationId)
          .order('sequence_number', { ascending: false })
          .limit(1)
          .maybeSingle();
        const nextSeq = (maxSeqData?.sequence_number || 0) + 1;
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: visitorId,
          sender_type: 'visitor',
          content,
          sequence_number: nextSeq,
        });
      }
      return;
    }

    // Build conversation history for AI (proactive messages are transient UI only)
    const conversationHistory = messages
      .filter(m => m.id !== 'proactive')
      .map(m => ({
        role: m.sender_type === 'visitor' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }));
    
    conversationHistory.push({ role: 'user', content });

    // --- HYBRID MODEL: Generate First, Queue with Preview, Then Wait ---
    // New flow for real (non-preview) conversations:
    // 1. Generate the AI response immediately (during the delay window, not after)
    // 2. Set ai_queued_at + ai_queued_preview so dashboard shows an editable bubble
    // 3. Poll for human agent during the human-priority window
    // 4. If human replied → clear queue, skip AI
    // 5. If window elapsed → reveal in widget (with smart typing duration added on top)
    // responseDelay = human-priority window (AI settings for first msg, 15-25s for quick reply)
    // Smart typing duration is added AFTER the window, not within it.
    const isFirstAiReply = aiMessageCountRef.current === 0;
    const useQuickReply = settings.quick_reply_after_first_enabled && !isFirstAiReply;
    const responseDelay = useQuickReply
      ? randomInRange(15000, 25000)
      : randomInRange(settings.ai_response_delay_min_ms, settings.ai_response_delay_max_ms);

    // Store current agent for this message (before cycling)
    const respondingAgent = currentAiAgent;

    // Build natural lead capture fields list
    const naturalLeadCaptureFields: string[] = [];
    if (settings.natural_lead_capture_enabled) {
      if (settings.require_name_before_chat) naturalLeadCaptureFields.push('name');
      if (settings.require_email_before_chat) naturalLeadCaptureFields.push('email');
      if (settings.require_phone_before_chat) naturalLeadCaptureFields.push('phone');
      if (settings.require_insurance_card_before_chat) naturalLeadCaptureFields.push('insurance_card');
    }

    if (!isPreview && propertyId && propertyId !== 'demo' && !humanHasTakenOverRef.current) {
      const convId = conversationIdRef.current;
      const vId = visitorIdRef.current;
      const sessionId = getOrCreateSessionId();

      // Block autoReplyIfPending from firing a duplicate for this same visitor turn
      hybridFlowActiveRef.current = true;

      // Step 1: Generate AI response immediately (fire stream now)
      const generationStart = Date.now();
      let aiContent = '';
      let generationError = false;

      await new Promise<void>((resolve) => {
        streamAIResponse({
          messages: conversationHistory,
          personalityPrompt: respondingAgent?.personality_prompt,
          agentName: respondingAgent?.name,
          basePrompt: settings.ai_base_prompt,
          naturalLeadCaptureFields: naturalLeadCaptureFields.length > 0 ? naturalLeadCaptureFields : undefined,
          calendlyUrl: settings.calendly_url,
          humanTyposEnabled: settings.human_typos_enabled ?? true,
          onDelta: (delta) => { aiContent += delta; },
          onDone: () => {
            // Apply text transforms
            if (settings.human_typos_enabled) aiContent = maybeInjectTypo(aiContent, propertyId);
            if (settings.drop_capitalization_enabled) aiContent = maybeDropCapitalization(aiContent);
            if (settings.drop_apostrophes_enabled) aiContent = maybeDropApostrophes(aiContent);
            resolve();
          },
          onError: (err) => {
            console.error('AI generation error:', err);
            generationError = true;
            resolve();
          },
        });
      });

      if (generationError || !aiContent) {
        // Fallback: release hybrid lock and bail
        hybridFlowActiveRef.current = false;
        return;
      }

      // Step 2: Set queue state with the generated preview so dashboard shows editable bubble
      if (convId && vId) {
        fetch(SET_AI_QUEUE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ conversationId: convId, visitorId: vId, sessionId, action: 'queue', preview: aiContent, windowMs: responseDelay }),
        }).catch(() => {});
      }

      // Step 3: Poll for human agent during the remaining delay window
      const generationElapsed = Date.now() - generationStart;
      const remainingDelay = Math.max(0, responseDelay - generationElapsed);
      const POLL_INTERVAL = 3000;
      const deadline = Date.now() + remainingDelay;
      let humanReplied = false;

      while (Date.now() < deadline) {
        const remaining = deadline - Date.now();
        await sleep(Math.min(POLL_INTERVAL, remaining));
        if (humanHasTakenOverRef.current) {
          humanReplied = true;
          break;
        }
        const loopConvId = conversationIdRef.current;
        const loopVId = visitorIdRef.current;
        if (loopConvId && loopVId) {
          try {
            const loopSessionId = getOrCreateSessionId();
            const pollResp = await fetch(GET_MESSAGES_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
              body: JSON.stringify({ conversationId: loopConvId, visitorId: loopVId, sessionId: loopSessionId, afterSequence: lastSeqRef.current }),
            });
            if (pollResp.ok) {
              const pollData = await pollResp.json();
              // If agent edited the preview, keep local copy in sync
              if (pollData?.aiQueuedPreview && pollData.aiQueuedPreview !== aiContent) {
                aiContent = pollData.aiQueuedPreview;
              }
              const newMsgs = (pollData?.messages ?? []) as Array<{ sender_type: string; sender_id: string; content: string; sequence_number: number; id: string; created_at: string }>;
              const agentMsg = newMsgs.find(m => m.sender_type === 'agent' && m.sender_id !== 'ai-bot');
              if (agentMsg) {
                humanHasTakenOverRef.current = true;
                setHumanHasTakenOver(true);
                setMessages(prev => {
                  const alreadyExists = prev.some(m => m.id === agentMsg.id);
                  if (alreadyExists) return prev;
                  return [...prev, { id: agentMsg.id, content: agentMsg.content, sender_type: 'agent' as const, created_at: agentMsg.created_at }];
                });
                lastSeqRef.current = Math.max(lastSeqRef.current, agentMsg.sequence_number);
                humanReplied = true;
                break;
              }
            }
          } catch { /* ignore poll errors */ }
        }
      }

      // Always release the hybrid flow lock (whether human replied or not)
      hybridFlowActiveRef.current = false;

      if (humanReplied) {
        // Clear queue state — human took over
        const clearConvId = conversationIdRef.current;
        const clearVId = visitorIdRef.current;
        if (clearConvId && clearVId) {
          fetch(SET_AI_QUEUE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
            body: JSON.stringify({ conversationId: clearConvId, visitorId: clearVId, sessionId, action: 'clear' }),
          }).catch(() => {});
        }
        return;
      }

      // Step 4: Window elapsed — show typing indicator BEFORE clearing the queue so the
      // editable bubble stays visible on the dashboard while the widget types.
      const aiMessageId = `ai-${Date.now()}`;
      if (settings.smart_typing_enabled) {
        setIsTyping(true);
        const typingStartTime = Date.now();
        const calculatedTypingTime = calculateTypingTimeMs(aiContent);
        const minTypingTime = randomInRange(settings.typing_indicator_min_ms, settings.typing_indicator_max_ms);
        const targetTypingTime = Math.max(calculatedTypingTime, minTypingTime);
        const elapsedTyping = Date.now() - typingStartTime;
        const remainingTyping = targetTypingTime - elapsedTyping;
        if (remainingTyping > 0) await sleep(remainingTyping);
      } else {
        // No smart typing: just use the slider-based typing indicator duration
        setIsTyping(true);
        const typingDuration = randomInRange(settings.typing_indicator_min_ms, settings.typing_indicator_max_ms);
        await sleep(typingDuration);
      }

      // Step 5: Typing done — now save the message to DB, clear the queue, and reveal to visitor
      const finalConvId = conversationIdRef.current;
      const finalVId = visitorIdRef.current;
      if (finalConvId && finalVId) {
        fetch(SAVE_MESSAGE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ conversationId: finalConvId, visitorId: finalVId, sessionId, senderType: 'agent', content: aiContent }),
        }).catch(e => console.error('Failed to save AI message:', e));

        // Clear queue AFTER typing finishes so dashboard bubble stays editable throughout
        fetch(SET_AI_QUEUE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ conversationId: finalConvId, visitorId: finalVId, sessionId, action: 'clear' }),
        }).catch(() => {});
      }

      setMessages(prev => [...prev, {
        id: aiMessageId,
        content: aiContent,
        sender_type: 'agent' as const,
        created_at: new Date().toISOString(),
        agent_name: respondingAgent?.name,
        agent_avatar: respondingAgent?.avatar_url,
      }]);
      setIsTyping(false);
      aiMessageCountRef.current += 1;
      cycleToNextAgent();

      if (settings.auto_escalation_enabled && aiMessageCountRef.current >= settings.max_ai_messages_before_escalation) {
        await triggerEscalation();
      }

    } else {
      // Preview mode or human already taken over: run original flow (generate + delay + reveal)
      await sleep(responseDelay);

      const aiMessageId = `ai-${Date.now()}`;
      let aiContent = '';

      if (settings.smart_typing_enabled) {
        await streamAIResponse({
          messages: conversationHistory,
          personalityPrompt: respondingAgent?.personality_prompt,
          agentName: respondingAgent?.name,
          basePrompt: settings.ai_base_prompt,
          naturalLeadCaptureFields: naturalLeadCaptureFields.length > 0 ? naturalLeadCaptureFields : undefined,
          calendlyUrl: settings.calendly_url,
          humanTyposEnabled: settings.human_typos_enabled ?? true,
          onDelta: (delta) => { aiContent += delta; },
          onDone: async () => {
            if (settings.human_typos_enabled) aiContent = maybeInjectTypo(aiContent, propertyId);
            if (settings.drop_capitalization_enabled) aiContent = maybeDropCapitalization(aiContent);
            if (settings.drop_apostrophes_enabled) aiContent = maybeDropApostrophes(aiContent);

            setIsTyping(true);
            const typingStartTime = Date.now();
            const calculatedTypingTime = calculateTypingTimeMs(aiContent);
            const minTypingTime = randomInRange(settings.typing_indicator_min_ms, settings.typing_indicator_max_ms);
            const targetTypingTime = Math.max(calculatedTypingTime, minTypingTime);
            const elapsedTime = Date.now() - typingStartTime;
            const remainingTime = targetTypingTime - elapsedTime;
            if (remainingTime > 0) await sleep(remainingTime);

            setMessages(prev => [...prev, {
              id: aiMessageId,
              content: aiContent,
              sender_type: 'agent' as const,
              created_at: new Date().toISOString(),
              agent_name: respondingAgent?.name,
              agent_avatar: respondingAgent?.avatar_url,
            }]);
            setIsTyping(false);
            aiMessageCountRef.current += 1;
            cycleToNextAgent();
            if (settings.auto_escalation_enabled && aiMessageCountRef.current >= settings.max_ai_messages_before_escalation) {
              await triggerEscalation();
            }
          },
          onError: (error) => {
            setIsTyping(false);
            console.error('AI Error:', error);
            setMessages(prev => [...prev, {
              id: `error-${Date.now()}`,
              content: "I'm having trouble connecting right now. Please try again in a moment, or speak directly with our team.",
              sender_type: 'agent',
              created_at: new Date().toISOString(),
            }]);
          },
        });
      } else {
        setIsTyping(true);
        const typingDuration = randomInRange(settings.typing_indicator_min_ms, settings.typing_indicator_max_ms);
        await sleep(typingDuration);

        await streamAIResponse({
          messages: conversationHistory,
          personalityPrompt: respondingAgent?.personality_prompt,
          agentName: respondingAgent?.name,
          basePrompt: settings.ai_base_prompt,
          naturalLeadCaptureFields: naturalLeadCaptureFields.length > 0 ? naturalLeadCaptureFields : undefined,
          calendlyUrl: settings.calendly_url,
          humanTyposEnabled: settings.human_typos_enabled ?? true,
          onDelta: (delta) => {
            aiContent += delta;
            setMessages(prev => {
              const existing = prev.find(m => m.id === aiMessageId);
              if (existing) return prev.map(m => m.id === aiMessageId ? { ...m, content: aiContent } : m);
              return [...prev, { id: aiMessageId, content: aiContent, sender_type: 'agent' as const, created_at: new Date().toISOString(), agent_name: respondingAgent?.name, agent_avatar: respondingAgent?.avatar_url }];
            });
          },
          onDone: async () => {
            if (settings.human_typos_enabled) aiContent = maybeInjectTypo(aiContent, propertyId);
            if (settings.drop_capitalization_enabled) aiContent = maybeDropCapitalization(aiContent);
            if (settings.drop_apostrophes_enabled) aiContent = maybeDropApostrophes(aiContent);
            setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: aiContent } : m));
            setIsTyping(false);
            aiMessageCountRef.current += 1;
            cycleToNextAgent();
            if (settings.auto_escalation_enabled && aiMessageCountRef.current >= settings.max_ai_messages_before_escalation) {
              await triggerEscalation();
            }
          },
          onError: (error) => {
            setIsTyping(false);
            console.error('AI Error:', error);
            setMessages(prev => [...prev, { id: `error-${Date.now()}`, content: "I'm having trouble connecting right now. Please try again in a moment, or speak directly with our team.", sender_type: 'agent', created_at: new Date().toISOString() }]);
          },
        });
      }
    }

    // Extract visitor info in background after each AI response (works in all modes)
    // This allows us to capture details as they're shared naturally in conversation
    // Use ref to get the most current visitor ID (state may be stale in preview mode)
    const currentVisitorId = visitorIdRef.current || visitorId;
    if (currentVisitorId && conversationHistory.length >= 1) {
      extractVisitorInfo(currentVisitorId, conversationHistory);
    }

    // NOTE: For real embeds the visitor message was already saved to DB at the top of sendMessage
    // (awaited, before the hybrid flow). For preview mode with a test conversation, save via
    // supabase directly.
    if (isPreview && conversationId && visitorId && propertyId && propertyId !== 'demo') {
      const { data: maxSeqData } = await supabase
        .from('messages')
        .select('sequence_number')
        .eq('conversation_id', conversationId)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextSeq = (maxSeqData?.sequence_number || 0) + 1;

      const { error: msgErr } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: visitorId,
        sender_type: 'visitor',
        content,
        sequence_number: nextSeq,
      });
      if (msgErr) console.error('Error saving visitor message (preview):', msgErr);

      if (conversationHistory.length >= 1) {
        extractVisitorInfo(visitorId, conversationHistory);
      }
    }
  };

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // Presence: keep conversations "active" while the widget is visible, and attempt
  // to mark them "closed" when the tab hides/unloads.
  useEffect(() => {
    if (isPreview || !propertyId || propertyId === 'demo') return;
    if (!visitorId || !conversationId) return;

    const sessionId = getOrCreateSessionId();
    let disposed = false;

    const markActive = () => {
      if (disposed) return;
      if (document.visibilityState !== 'visible') return;
      void updateConversationPresenceSecure({
        propertyId,
        visitorId,
        sessionId,
        status: 'active',
      });
    };

    const markClosed = () => {
      if (disposed) return;
      void updateConversationPresenceSecure({
        propertyId,
        visitorId,
        sessionId,
        status: 'closed',
      });
    };

    // Immediately mark active once we have a conversation.
    markActive();

    // Heartbeat so the dashboard can close stale conversations even if unload doesn't fire.
    const heartbeatId = window.setInterval(markActive, 15000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        markClosed();
      } else {
        markActive();
      }
    };

    const onPageHide = () => markClosed();
    const onBeforeUnload = () => markClosed();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      disposed = true;
      window.clearInterval(heartbeatId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onBeforeUnload);

      // Best-effort close if the widget is unmounting while a conversation exists.
      if (document.visibilityState !== 'visible') {
        markClosed();
      }
    };
  }, [conversationId, isPreview, propertyId, visitorId]);

  // Start proactive message timer when widget opens
  useEffect(() => {
    startProactiveTimer();
    return () => {
      if (proactiveTimerRef.current) {
        clearTimeout(proactiveTimerRef.current);
      }
    };
  }, [startProactiveTimer]);


  // Poll for new messages (human agent responses) - realtime requires auth which widget doesn't have
  useEffect(() => {
    // Only poll for live embeds (not preview mode)
    if (isPreview || !propertyId || propertyId === 'demo') return;
    
    const convId = conversationIdRef.current;
    const vId = visitorIdRef.current;
    if (!convId || !vId) return;

    const sessionId = getOrCreateSessionId();
    let isMounted = true;

    const pollMessages = async () => {
      if (!isMounted) return;
      
      try {
        const response = await fetch(GET_MESSAGES_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            conversationId: convId,
            visitorId: vId,
            sessionId,
            afterSequence: lastSeqRef.current,
          }),
        });

        if (!response.ok) return;

        const data = await response.json();
        const fetchedMessages = data.messages || [];
        const serverAiEnabled = (data?.aiEnabled ?? true) as boolean;

        // Track dashboard AI enable/disable separately from human takeover.
        const prev = prevAiEnabledRef.current;
        aiEnabledRef.current = serverAiEnabled;
        prevAiEnabledRef.current = serverAiEnabled;

        // If AI was turned back on, reset humanHasTakenOver so AI can respond again.
        // The humanHasTakenOver flag is only meaningful while AI is disabled;
        // re-enabling AI signals the operator wants AI to resume.
        if (prev === false && serverAiEnabled === true) {
          if (humanHasTakenOverRef.current) {
            setHumanHasTakenOver(false);
            humanHasTakenOverRef.current = false;
          }
          void autoReplyIfPending();
        }

        if (fetchedMessages.length === 0) return;

        // Update lastSeqRef
        const maxSeq = Math.max(...fetchedMessages.map((m: { sequence_number: number }) => m.sequence_number));
        if (maxSeq > lastSeqRef.current) {
          lastSeqRef.current = maxSeq;
        }

        // Process new messages
        for (const rawMsg of fetchedMessages) {
          // Only add agent messages that aren't from AI (human agent override)
          if (rawMsg.sender_type === 'agent' && rawMsg.sender_id !== 'ai-bot') {
            // Mark human has taken over - AI should stop responding
            if (!humanHasTakenOverRef.current) {
              setHumanHasTakenOver(true);
              humanHasTakenOverRef.current = true;
            }
            if (!isEscalated) {
              setIsEscalated(true);
            }

            // Track human escalation event (only once per conversation)
            if (!humanEscalationTracked && propertyId && propertyId !== 'demo') {
              setHumanEscalationTracked(true);
              trackAnalyticsEvent(propertyId, 'human_escalation');
            }

            const newMsg: Message = {
              id: rawMsg.id,
              content: rawMsg.content,
              sender_type: 'agent',
              created_at: rawMsg.created_at,
            };
            setMessages(prev => {
              const exists = prev.some(m => m.id === newMsg.id);
              if (exists) return prev;
              return [...prev, newMsg];
            });
          }
        }
      } catch (e) {
        console.error('Error polling messages:', e);
      }
    };

    // Poll every 2 seconds
    const intervalId = setInterval(pollMessages, 2000);
    // Also poll immediately
    pollMessages();

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [conversationId, humanEscalationTracked, propertyId, isEscalated, isPreview, autoReplyIfPending]);

  return {
    messages,
    sendMessage,
    loading,
    isTyping,
    visitorId,
    conversationId,
    settings,
    isEscalated,
    humanHasTakenOver,
    requiresLeadCapture,
    submitLeadInfo,
    visitorInfo,
    currentAiAgent,
    aiAgents,
    greetingText, // Static greeting for UI display
  };
};
