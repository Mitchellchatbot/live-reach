import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import careAssistLogo from '@/assets/care-assist-logo.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const SalesChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  const handleClose = () => {
    setIsClosing(true);
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
            'mb-4 bg-card/95 backdrop-blur-lg rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-border/50',
            isClosing ? 'animate-scale-out' : 'animate-scale-in'
          )}
          onAnimationEnd={() => {
            if (isClosing) {
              setIsClosing(false);
              setIsOpen(false);
            }
          }}
          style={{ width: '360px', height: '480px' }}
        >
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between bg-primary relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-white/20 to-transparent" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                <img src={careAssistLogo} alt="Care Assist" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">Care Assist</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-primary-foreground/80">Sales & Support</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              <button
                onClick={handleClose}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Minimize2 className="h-4 w-4 text-primary-foreground" />
              </button>
              <button
                onClick={handleClose}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4 text-primary-foreground" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background to-muted/20">
            {/* Welcome message */}
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <img src={careAssistLogo} alt="" className="h-6 w-6 object-contain" />
              </div>
              <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm text-foreground">
                  👋 Hey! Got questions about Care Assist? I'm here to help — ask me anything about features, pricing, or how it works!
                </p>
              </div>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : '')}>
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <img src={careAssistLogo} alt="" className="h-6 w-6 object-contain" />
                  </div>
                )}
                <div
                  className={cn(
                    'px-4 py-3 max-w-[80%] text-sm',
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
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <img src={careAssistLogo} alt="" className="h-6 w-6 object-contain" />
                </div>
                <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3">
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
          <div className="p-3 border-t border-border/50 bg-card/50">
            <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2 border border-border/40 focus-within:border-primary/30 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Care Assist..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-all shrink-0"
              >
                <Send className="h-4 w-4 text-primary-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      {!isOpen && !isClosing && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 group"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
};
