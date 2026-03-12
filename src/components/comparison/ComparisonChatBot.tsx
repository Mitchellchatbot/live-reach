import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import jamesAvatar from '@/assets/personas/james-avatar.jpg';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  id: 'greeting',
  role: 'assistant',
  content: "Hi there 👋 I'm so glad you reached out, before we get started can i get your first name?",
};

export const ComparisonChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-open after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="mb-3 rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-scale-in"
          style={{
            width: 'min(360px, calc(100vw - 32px))',
            height: 'min(480px, calc(100vh - 120px))',
            background: '#fff',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)' }}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                <img src={jamesAvatar} alt="James" className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: '#fff' }}>James</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: '#4ade80' }} />
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.8)' }}>Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              <X className="h-4 w-4" style={{ color: '#fff' }} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#f8fafc' }}>
            {messages.map(msg => (
              <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : '')}>
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full overflow-hidden shrink-0">
                    <img src={jamesAvatar} alt="James" className="h-full w-full object-cover" />
                  </div>
                )}
                <div
                  className="px-3.5 py-2.5 max-w-[80%] text-[13px] leading-relaxed"
                  style={
                    msg.role === 'user'
                      ? { background: '#1E3A5F', color: '#fff', borderRadius: '16px 16px 4px 16px' }
                      : { background: '#e2e8f0', color: '#1e293b', borderRadius: '16px 16px 16px 4px' }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3" style={{ borderTop: '1px solid #e2e8f0', background: '#fff' }}>
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-[13px] outline-none"
                style={{ color: '#1e293b' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-8 w-8 rounded-lg flex items-center justify-center transition-all shrink-0 disabled:opacity-40"
                style={{ background: '#1E3A5F' }}
              >
                <Send className="h-3.5 w-3.5" style={{ color: '#fff' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-300"
          style={{ background: '#1E3A5F', boxShadow: '0 4px 20px rgba(30,58,95,0.4)' }}
        >
          <MessageCircle className="h-6 w-6" style={{ color: '#fff' }} />
        </button>
      )}
    </div>
  );
};
