import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, User, Mail, ImagePlus, MessageSquare, MessagesSquare, Headphones, HelpCircle, Heart, Sparkles, Bot, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useWidgetChat } from '@/hooks/useWidgetChat';
import { supabase } from '@/integrations/supabase/client';

interface ChatWidgetProps {
  propertyId?: string;
  primaryColor?: string;
  textColor?: string;
  borderColor?: string;
  widgetSize?: 'small' | 'medium' | 'large';
  borderRadius?: number;
  greeting?: string;
  agentName?: string;
  agentAvatar?: string;
  isPreview?: boolean;
  autoOpen?: boolean;
  widgetIcon?: string;
  effectType?: string;
  effectInterval?: number;
  effectIntensity?: string;
}

export const ChatWidget = ({
  propertyId = 'demo',
  primaryColor = '#F97316',
  textColor = 'hsl(0, 0%, 100%)',
  borderColor = 'hsl(0, 0%, 0%, 0.1)',
  widgetSize = 'medium',
  borderRadius = 24,
  greeting = "Hi there! 👋 How can I help you today?",
  agentName = "Support",
  agentAvatar,
  isPreview = false,
  autoOpen = false,
  widgetIcon,
  effectType = 'none',
  effectInterval = 5,
  effectIntensity = 'medium',
}: ChatWidgetProps) => {
  // Detect mobile using screen width (window.innerWidth is unreliable inside a small iframe)
  const isMobileWidget = typeof window !== 'undefined' && (window.screen?.width || window.innerWidth) < 768;

  const [isOpen, setIsOpen] = useState(autoOpen && !isMobileWidget);
  const [isClosing, setIsClosing] = useState(false);
  const [showAttentionBounce, setShowAttentionBounce] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    messages, 
    sendMessage, 
    isTyping, 
    settings, 
    requiresLeadCapture, 
    submitLeadInfo,
    visitorInfo,
    currentAiAgent,
    aiAgents,
    greetingText,
  } = useWidgetChat({ propertyId, greeting, isPreview });

  // Widget icon mapping
  const widgetIconMap: Record<string, LucideIcon> = {
    'message-circle': MessageCircle,
    'message-square': MessageSquare,
    'messages-square': MessagesSquare,
    'headphones': Headphones,
    'help-circle': HelpCircle,
    'heart': Heart,
    'sparkles': Sparkles,
    'bot': Bot,
  };

  // Get the icon component from prop override, settings, or default
  const WidgetIconComponent = widgetIconMap[widgetIcon || settings?.widget_icon || 'message-circle'] || MessageCircle;

  // Use AI agent info if available, otherwise use props
  const displayName = currentAiAgent?.name || agentName;
  const displayAvatar = currentAiAgent?.avatar_url || agentAvatar;

  // Periodic effect animation
  const [effectActive, setEffectActive] = useState(false);
  const [ringActive, setRingActive] = useState(false);

  useEffect(() => {
    if (effectType === 'none' || isOpen) return;
    const id = setInterval(() => {
      if (effectType === 'ring') {
        setRingActive(true);
        setTimeout(() => setRingActive(false), 1500);
      } else {
        setEffectActive(true);
        setTimeout(() => setEffectActive(false), 800);
      }
    }, effectInterval * 1000);
    return () => clearInterval(id);
  }, [effectType, effectInterval, isOpen]);

  const getEffectStyle = (): React.CSSProperties => {
    if (!effectActive || effectType === 'none' || effectType === 'ring') return {};
    const scale = effectIntensity === 'subtle' ? 1.05 : effectIntensity === 'strong' ? 1.15 : 1.1;
    const translate = effectIntensity === 'subtle' ? 4 : effectIntensity === 'strong' ? 12 : 8;

    switch (effectType) {
      case 'pulse':
        return { animation: `widget-pulse 0.8s ease-in-out` };
      case 'bounce':
        return { animation: `widget-bounce 0.6s ease-out` };
      case 'wiggle':
        return { animation: `widget-wiggle 0.5s ease-in-out` };
      case 'heartbeat':
        return { animation: `widget-heartbeat 0.8s ease-in-out` };
      default:
        return {};
    }
  };



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);

    try {
      for (const file of Array.from(files)) {
        // Check file type
        if (!file.type.startsWith('image/')) {
          continue;
        }

        // Create a unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 9);
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `widget-uploads/${timestamp}-${randomStr}.${ext}`;

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('agent-avatars')
          .upload(fileName, file, { upsert: true });

        if (error) {
          console.error('Failed to upload image:', error);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('agent-avatars')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          // Send message with image
          sendMessage(`[Image uploaded: ${file.name}]\n${urlData.publicUrl}`);
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }

    setUploadingImage(false);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = settings.require_name_before_chat ? leadName.trim() : undefined;
    const email = settings.require_email_before_chat ? leadEmail.trim() : undefined;
    
    // Basic validation
    if (settings.require_name_before_chat && !name) return;
    if (settings.require_email_before_chat && !email) return;
    if (email && !email.includes('@')) return;

    submitLeadInfo(name, email);
  };

  // Dynamic border radius styles
  const panelRadius = `${borderRadius}px`;
  const buttonRadius = `${Math.min(borderRadius, 32)}px`;
  const messageRadiusLarge = `${Math.min(borderRadius, 24)}px`;
  const messageRadiusSmall = `${Math.max(borderRadius / 3, 4)}px`;

  // Widget size dimensions — smaller on mobile
  const desktopSizeConfig = {
    small: { width: 320, height: 440, button: 48 },
    medium: { width: 380, height: 520, button: 56 },
    large: { width: 440, height: 600, button: 64 },
  };
  const mobileSizeConfig = {
    small: { width: 280, height: 380, button: 44 },
    medium: { width: 320, height: 440, button: 48 },
    large: { width: 360, height: 500, button: 52 },
  };
  const currentSize = isMobileWidget ? mobileSizeConfig[widgetSize] : desktopSizeConfig[widgetSize];

  // In preview mode, use viewport-based sizing so it doesn't get squished by parent containers
  // On mobile (non-preview), fill the entire iframe which is already sized to the screen
  const previewPanelStyle: React.CSSProperties = isPreview
    ? { width: 'min(380px, 90vw)', height: 'min(520px, 75vh)', borderRadius: panelRadius, border: `1px solid ${borderColor}` }
    : { width: `${currentSize.width}px`, height: `${currentSize.height}px`, borderRadius: panelRadius, border: `1px solid ${borderColor}` };

  // Tell the parent page how big the iframe should be.
  // This removes the “big box” around the widget when it’s closed.
  useEffect(() => {
    if (isPreview) return;

    let inIframe = false;
    try {
      inIframe = window.self !== window.top;
    } catch {
      inIframe = true;
    }

    if (!inIframe) return;

    if (!isOpen) {
      // Extra padding when effects are active so animations (bounce, pulse, ring) aren't clipped by the iframe
      const hasEffect = effectType && effectType !== 'none';
      const padding = hasEffect ? 48 : 32;
      const width = currentSize.button + padding;
      const height = currentSize.button + padding;
      window.parent.postMessage(
        { type: 'scaledbot_widget_resize', width, height, fullscreen: false },
        '*'
      );
    } else if (isMobileWidget) {
      const padding = 32;
      const width = currentSize.width + padding;
      const height = currentSize.height + padding;
      window.parent.postMessage(
        { type: 'scaledbot_widget_resize', width, height, fullscreen: false },
        '*'
      );
    } else {
      const padding = 32;
      const width = currentSize.width + padding;
      const height = currentSize.height + padding;
      window.parent.postMessage(
        { type: 'scaledbot_widget_resize', width, height, fullscreen: false },
        '*'
      );
    }
  }, [isOpen, widgetSize, isPreview, isMobileWidget, currentSize.width, currentSize.height, currentSize.button, effectType]);

  // Convert HSL string to ensure compatibility
  const widgetStyle = {
    '--widget-primary': primaryColor,
    '--widget-text': textColor,
    '--widget-border': borderColor,
    '--widget-radius': panelRadius,
    '--widget-button-radius': buttonRadius,
    '--widget-message-radius-lg': messageRadiusLarge,
    '--widget-message-radius-sm': messageRadiusSmall,
  } as React.CSSProperties;

  // Show lead capture form
  const showLeadForm = requiresLeadCapture && !visitorInfo.name && !visitorInfo.email;

  return (
    <div 
      className={cn(
        "z-50 font-sans pointer-events-none",
        isPreview ? "relative" : "fixed bottom-4 right-4"
      )}
      style={{ ...widgetStyle, background: 'transparent' }}
    >

      {/* Chat Panel */}
      {(isOpen || isClosing) && (
        <div 
          className={cn(
            "mb-4 bg-card/95 backdrop-blur-lg overflow-hidden flex flex-col pointer-events-auto",
            isClosing ? "animate-scale-out" : "animate-scale-in"
          )}
          onAnimationEnd={() => {
            if (isClosing) {
              setIsClosing(false);
              setIsOpen(false);
            }
          }}
          style={previewPanelStyle}
        >
          {/* Header */}
          <div 
            className="px-5 py-4 flex items-center justify-between relative overflow-hidden"
            style={{ background: 'var(--widget-primary)' }}
          >
            {/* Gradient overlay */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)' }}
            />
            <div className="flex items-center gap-3 relative z-10">
              <div 
                className="h-11 w-11 backdrop-blur-sm flex items-center justify-center overflow-hidden"
                style={{ borderRadius: buttonRadius, background: `color-mix(in srgb, ${textColor} 20%, transparent)` }}
              >
                {displayAvatar ? (
                  <img src={displayAvatar} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <MessageCircle className="h-5 w-5" style={{ color: textColor }} />
                )}
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: textColor }}>{displayName}</h3>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: textColor }} />
                  <span className="text-xs" style={{ color: textColor, opacity: 0.8 }}>
                    {aiAgents.length > 1 ? `AI Agent (${aiAgents.length} available)` : 'Here to help'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              <button 
                onClick={() => setIsClosing(true)}
                className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.background = `color-mix(in srgb, ${textColor} 20%, transparent)`}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Minimize2 className="h-4 w-4" style={{ color: textColor }} />
              </button>
              <button 
                onClick={() => setIsClosing(true)}
                className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.background = `color-mix(in srgb, ${textColor} 20%, transparent)`}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X className="h-4 w-4" style={{ color: textColor }} />
              </button>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="px-5 py-3 bg-gradient-to-r from-accent/30 to-muted/30 border-b border-border/30">
            <p className="text-xs text-muted-foreground text-center">
              You're in a safe space. Take your time. 💚
            </p>
          </div>

          {/* Lead Capture Form */}
          {showLeadForm ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/20">
              <div 
                className="h-16 w-16 flex items-center justify-center mb-4"
                style={{ background: 'var(--widget-primary)', borderRadius: buttonRadius }}
              >
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Before we chat</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Please share a few details so we can better assist you.
              </p>
              <form onSubmit={handleLeadSubmit} className="w-full space-y-4">
                {settings.require_name_before_chat && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="w-full pl-11 pr-4 py-3 border border-border/50 bg-background/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/60"
                      style={{ borderRadius: `${Math.min(borderRadius, 16)}px` }}
                    />
                  </div>
                )}
                {settings.require_email_before_chat && (
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="Your email"
                      required
                      className="w-full pl-11 pr-4 py-3 border border-border/50 bg-background/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/60"
                      style={{ borderRadius: `${Math.min(borderRadius, 16)}px` }}
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-3 text-white font-medium text-sm transition-all duration-300 hover:opacity-90"
                  style={{ background: 'var(--widget-primary)', borderRadius: `${Math.min(borderRadius, 16)}px` }}
                >
                  Start Chat
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20 scrollbar-thin">
                {/* Static Greeting - displayed first, not stored as a message */}
                {greetingText && (
                  <div className="flex gap-3 animate-fade-in">
                    <div 
                      className="h-9 w-9 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden"
                      style={{ background: displayAvatar ? 'transparent' : 'var(--widget-primary)', borderRadius: buttonRadius }}
                    >
                      {displayAvatar ? (
                        <img src={displayAvatar} alt={displayName} className="h-full w-full object-cover" />
                      ) : (
                        <MessageCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="max-w-[75%] flex flex-col">
                      {displayName && (
                        <span className="text-xs text-muted-foreground mb-1 ml-1">{displayName}</span>
                      )}
                      <div
                        className="px-4 py-3 shadow-sm bg-card border border-border/30"
                        style={{ borderRadius: `${messageRadiusLarge} ${messageRadiusLarge} ${messageRadiusLarge} ${messageRadiusSmall}` }}
                      >
                        <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                          {greetingText}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((msg, index) => {
                  // For agent messages, use per-message agent info or fall back to current
                  const msgAgentName = msg.agent_name || displayName;
                  const msgAgentAvatar = msg.agent_avatar || displayAvatar;
                  
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3 animate-fade-in",
                        msg.sender_type === 'visitor' ? "flex-row-reverse" : "flex-row"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {msg.sender_type === 'agent' && (
                        <div 
                          className="h-9 w-9 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden"
                          style={{ background: msgAgentAvatar ? 'transparent' : 'var(--widget-primary)', borderRadius: buttonRadius }}
                        >
                          {msgAgentAvatar ? (
                            <img src={msgAgentAvatar} alt={msgAgentName} className="h-full w-full object-cover" />
                          ) : (
                            <MessageCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                      )}
                      <div className={cn("max-w-[75%]", msg.sender_type === 'agent' && "flex flex-col")}>
                        {msg.sender_type === 'agent' && msgAgentName && (
                          <span className="text-xs text-muted-foreground mb-1 ml-1">{msgAgentName}</span>
                        )}
                        <div
                          className={cn(
                            "px-4 py-3 shadow-sm",
                            msg.sender_type === 'visitor'
                              ? ""
                              : "bg-card border border-border/30"
                          )}
                          style={msg.sender_type === 'visitor' 
                            ? { 
                                background: 'var(--widget-primary)', 
                                color: 'white',
                                borderRadius: `${messageRadiusLarge} ${messageRadiusLarge} ${messageRadiusSmall} ${messageRadiusLarge}`
                              } 
                            : {
                                borderRadius: `${messageRadiusLarge} ${messageRadiusLarge} ${messageRadiusLarge} ${messageRadiusSmall}`
                              }
                          }
                        >
                          {/* Check if message contains an image URL */}
                          {msg.content.includes('[Image uploaded:') && msg.content.includes('https://') ? (
                            <div className="space-y-2">
                              <p className="text-sm text-opacity-80">📷 Image uploaded</p>
                              <img 
                                src={msg.content.split('\n').pop() || ''} 
                                alt="Uploaded" 
                                className="max-w-full rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(msg.content.split('\n').pop(), '_blank')}
                              />
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          )}
                          <p className={cn(
                            "text-xs mt-1.5",
                            msg.sender_type === 'visitor' ? "text-white/70" : "text-muted-foreground"
                          )}>
                            {format(new Date(msg.created_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex gap-3 items-end animate-fade-in">
                    <div 
                      className="h-9 w-9 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden"
                      style={{ background: displayAvatar ? 'transparent' : 'var(--widget-primary)', borderRadius: buttonRadius }}
                    >
                      {displayAvatar ? (
                        <img src={displayAvatar} alt={displayName} className="h-full w-full object-cover" />
                      ) : (
                        <MessageCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      {displayName && (
                        <span className="text-xs text-muted-foreground mb-1 ml-1">{displayName}</span>
                      )}
                      <div 
                        className="bg-card px-4 py-3 shadow-sm border border-border/30"
                        style={{ borderRadius: `${messageRadiusLarge} ${messageRadiusLarge} ${messageRadiusLarge} ${messageRadiusSmall}` }}
                      >
                        <div className="flex gap-1.5">
                          <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-typing-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-typing-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-typing-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex-shrink-0 p-3 border-t border-border/30 bg-card/80 backdrop-blur-sm">
                <div className="flex gap-2 items-center">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {/* Image upload button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="h-10 w-10 flex-shrink-0 flex items-center justify-center border border-border/50 bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background transition-all duration-300 disabled:opacity-50"
                    style={{ borderRadius: buttonRadius }}
                    title="Upload image"
                  >
                    {uploadingImage ? (
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Share what's on your mind..."
                    className="flex-1 min-w-0 px-4 py-2.5 border border-border/50 bg-background/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/60"
                    style={{ borderRadius: `${Math.min(borderRadius, 24)}px` }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="h-10 w-10 flex-shrink-0 flex items-center justify-center text-white disabled:opacity-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                    style={{ background: 'var(--widget-primary)', borderRadius: buttonRadius }}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Effect keyframes */}
      <style>{`
        @keyframes widget-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
          50% { transform: scale(${effectIntensity === 'subtle' ? 1.05 : effectIntensity === 'strong' ? 1.15 : 1.1}); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
        }
        @keyframes widget-bounce {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-${effectIntensity === 'subtle' ? 6 : effectIntensity === 'strong' ? 16 : 10}px); }
          50% { transform: translateY(0); }
          70% { transform: translateY(-${effectIntensity === 'subtle' ? 3 : effectIntensity === 'strong' ? 8 : 5}px); }
        }
        @keyframes widget-wiggle {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(${effectIntensity === 'subtle' ? 5 : effectIntensity === 'strong' ? 15 : 10}deg); }
          40% { transform: rotate(-${effectIntensity === 'subtle' ? 5 : effectIntensity === 'strong' ? 15 : 10}deg); }
          60% { transform: rotate(${effectIntensity === 'subtle' ? 3 : effectIntensity === 'strong' ? 10 : 6}deg); }
          80% { transform: rotate(-${effectIntensity === 'subtle' ? 3 : effectIntensity === 'strong' ? 10 : 6}deg); }
        }
        @keyframes widget-heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(${effectIntensity === 'subtle' ? 1.08 : effectIntensity === 'strong' ? 1.2 : 1.14}); }
          30% { transform: scale(1); }
          45% { transform: scale(${effectIntensity === 'subtle' ? 1.05 : effectIntensity === 'strong' ? 1.15 : 1.1}); }
          60% { transform: scale(1); }
        }
        @keyframes widget-ring-ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(${effectIntensity === 'subtle' ? 1.6 : effectIntensity === 'strong' ? 2.2 : 1.8}); opacity: 0; }
        }
      `}</style>

      {/* Floating Button */}
      {!isOpen && !isClosing && (
        <div className="relative pointer-events-auto">
          {/* Ring ripple effect */}
          {ringActive && effectType === 'ring' && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `color-mix(in srgb, ${primaryColor} 40%, transparent)`,
                animation: 'widget-ring-ripple 1.2s ease-out forwards',
              }}
            />
          )}
          <button
            onClick={() => {
              setShowAttentionBounce(false);
              setIsOpen(true);
            }}
            className={cn(
              "flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg",
              showAttentionBounce && "animate-attention-bounce"
            )}
            onAnimationEnd={() => setShowAttentionBounce(false)}
            style={{ 
              background: 'var(--widget-primary)', 
              borderRadius: buttonRadius,
              width: `${currentSize.button}px`,
              height: `${currentSize.button}px`,
              color: textColor,
              border: `2px solid color-mix(in srgb, ${primaryColor} 70%, white 30%)`,
              boxSizing: 'border-box',
              ...getEffectStyle(),
            }}
          >
            <WidgetIconComponent className={cn(
              widgetSize === 'small' ? 'h-5 w-5' : widgetSize === 'medium' ? 'h-7 w-7' : 'h-8 w-8'
            )} />
          </button>
        </div>
      )}
    </div>
  );
};
