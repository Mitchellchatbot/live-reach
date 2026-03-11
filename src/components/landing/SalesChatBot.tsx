import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Calendar, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import careAssistLogo from '@/assets/scaled-bot-logo.svg';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const SalesChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleFABClick = () => {
    if (showMenu || menuClosing) {
      setMenuClosing(true);
    } else {
      setShowMenu(true);
    }
  };

  const handleOpenChat = () => {
    setMenuClosing(true);
    setTimeout(() => {
      setShowMenu(false);
      setMenuClosing(false);
      setIsOpen(true);
    }, 200);
  };

  const handleBookDemo = () => {
    setMenuClosing(true);
    setTimeout(() => {
      setShowMenu(false);
      setMenuClosing(false);
      window.open('https://calendly.com/care-assist-support/support-call-clone', '_blank');
    }, 200);
  };

  const handleTryFree = () => {
    setMenuClosing(true);
    setTimeout(() => {
      setShowMenu(false);
      setMenuClosing(false);
      navigate('/auth');
    }, 200);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('sales-chat', {
        body: {
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        },
      });

      if (error) throw error;

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.reply || "Sorry, I couldn't process that. Try again!",
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Sales chat error:', err);
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: "Oops, something went wrong. Please try again!" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Chat Panel */}
      {(isOpen || isClosing) && (
        <div
          className={cn(
            'mb-3 bg-card/95 backdrop-blur-lg rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-border/50',
            isClosing ? 'animate-scale-out' : 'animate-scale-in'
          )}
          onAnimationEnd={() => {
            if (isClosing) {
              setIsClosing(false);
              setIsOpen(false);
            }
          }}
          style={{ width: 'min(340px, calc(100vw - 32px))', height: 'min(420px, calc(100vh - 120px))' }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between bg-primary relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-white/20 to-transparent" />
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                <img src={careAssistLogo} alt="Care Assist" className="h-7 w-7 object-contain" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground text-sm">Care Assist</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[11px] text-primary-foreground/80">Online now</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              <button
                onClick={handleClose}
                className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Minimize2 className="h-3.5 w-3.5 text-primary-foreground" />
              </button>
              <button
                onClick={handleClose}
                className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-primary-foreground" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-gradient-to-b from-background to-muted/20">
            <div className="flex gap-2.5">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <img src={careAssistLogo} alt="" className="h-5 w-5 object-contain" />
              </div>
              <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[80%]">
                <p className="text-[13px] text-foreground">
                  👋 Hey! Got questions about Care Assist? Ask me anything about features, pricing, or how it works!
                </p>
              </div>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : '')}>
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <img src={careAssistLogo} alt="" className="h-5 w-5 object-contain" />
                  </div>
                )}
                <div
                  className={cn(
                    'px-3 py-2.5 max-w-[80%] text-[13px]',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                      : 'bg-muted/50 text-foreground rounded-2xl rounded-tl-sm'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <img src={careAssistLogo} alt="" className="h-5 w-5 object-contain" />
                </div>
                <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-3 py-2.5">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2.5 border-t border-border/50 bg-card/50">
            <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2 border border-border/40 focus-within:border-primary/30 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Care Assist..."
                className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-all shrink-0"
              >
                <Send className="h-3.5 w-3.5 text-primary-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick action menu */}
      {(showMenu || menuClosing) && !isOpen && (
        <div
          className="mb-3 flex flex-col gap-1.5"
          onAnimationEnd={() => {
            if (menuClosing) {
              setMenuClosing(false);
              setShowMenu(false);
            }
          }}
        >
          {[
            { onClick: handleOpenChat, icon: MessageCircle, label: 'Ask a Question', delay: '0.08s', variant: 'light' as const },
            { onClick: handleBookDemo, icon: Calendar, label: 'Book a Demo', delay: '0.04s', variant: 'light' as const },
            { onClick: handleTryFree, icon: Zap, label: 'Try For Free', delay: '0s', variant: 'primary' as const },
          ].map((item, i) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={cn(
                'flex items-center gap-3 rounded-full px-4 py-2.5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                menuClosing ? 'animate-[wiggle-out_0.25s_ease-in_forwards]' : 'animate-[wiggle-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)_both]',
                item.variant === 'primary'
                  ? 'bg-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                  : 'bg-card shadow-md shadow-black/8 border border-border/40 hover:border-primary/20'
              )}
              style={{ animationDelay: menuClosing ? '0s' : item.delay }}
            >
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                item.variant === 'primary' ? 'bg-white/20' : 'bg-primary/10'
              )}>
                <item.icon className={cn('h-4 w-4', item.variant === 'primary' ? 'text-primary-foreground' : 'text-primary')} />
              </div>
              <span className={cn(
                'text-sm font-semibold',
                item.variant === 'primary' ? 'text-primary-foreground' : 'text-foreground'
              )}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* FAB Button */}
      {!isOpen && !isClosing && (
        <button
          onClick={handleFABClick}
          className={cn(
            'h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 group',
            showMenu && 'rotate-45'
          )}
        >
          {showMenu ? (
            <X className="h-6 w-6 text-primary-foreground transition-transform" />
          ) : (
            <MessageCircle className="h-6 w-6 text-primary-foreground group-hover:scale-110 transition-transform" />
          )}
        </button>
      )}
    </div>
  );
};
