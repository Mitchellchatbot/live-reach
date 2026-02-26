import { useState, useEffect, useRef } from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWidget } from '@/components/widget/ChatWidget';
import { cn } from '@/lib/utils';
import careAssistLogo from '@/assets/care-assist-logo.png';

interface DemoMessage {
  role: 'assistant' | 'visitor';
  content: string;
  delayMs: number; // time before this message starts typing
}

const SCRIPT: DemoMessage[] = [
  { role: 'assistant', content: "Hi there! 👋 I'm so glad you reached out. Before we get started, can I get your first name?", delayMs: 1200 },
  { role: 'visitor', content: "Hey, it's Sarah", delayMs: 2000 },
  { role: 'assistant', content: "Nice to meet you Sarah! What brings you to us today?", delayMs: 1500 },
  { role: 'visitor', content: "I've been looking into treatment options for my brother", delayMs: 2500 },
  { role: 'assistant', content: "Of course — I'm happy to help you explore what's available. Do you know what type of treatment he might need?", delayMs: 1800 },
  { role: 'visitor', content: "He's struggling with alcohol, we're not sure where to start", delayMs: 2800 },
  { role: 'assistant', content: "That's a really brave first step, reaching out for him. We work with a lot of families in similar situations. Would it help if I walked you through the options?", delayMs: 2000 },
];

const TYPING_WPM = 65;
const CHAR_DELAY = 60000 / (TYPING_WPM * 5); // ms per character

export const LPDemoWidget = () => {
  const [messages, setMessages] = useState<{ role: string; content: string; typing?: boolean }[]>([]);
  const [showJumpIn, setShowJumpIn] = useState(false);
  const [jumped, setJumped] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (jumped) return;
    let cancelled = false;
    cancelledRef.current = false;

    const run = async () => {
      for (const msg of SCRIPT) {
        if (cancelled) return;

        // Wait before starting this message
        await sleep(msg.delayMs);
        if (cancelled) return;

        // Show typing indicator
        setMessages(prev => [...prev, { role: msg.role, content: '', typing: true }]);
        scrollDown();

        // Type out character by character
        const chars = msg.content.split('');
        for (let i = 0; i < chars.length; i++) {
          if (cancelled) return;
          await sleep(CHAR_DELAY + Math.random() * 15);
          if (cancelled) return;
          const partial = msg.content.slice(0, i + 1);
          setMessages(prev => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: msg.role, content: partial, typing: true };
            return copy;
          });
        }

        // Finalize message
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: msg.role, content: msg.content, typing: false };
          return copy;
        });
        scrollDown();
      }

      // After full script, show jump in prominently
      if (!cancelled) setShowJumpIn(true);
    };

    // Show jump in button after a short delay
    const jumpTimer = setTimeout(() => {
      if (!cancelled) setShowJumpIn(true);
    }, 3500);

    run();

    return () => {
      cancelled = true;
      cancelledRef.current = true;
      clearTimeout(jumpTimer);
    };
  }, [jumped]);

  const scrollDown = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  if (jumped) {
    return (
      <ChatWidget
        propertyId="demo"
        isPreview={true}
        autoOpen={true}
        widgetSize="small"
        greeting="Hi there! 👋 I'm so glad you reached out. Before we get started, can I get your first name?"
        agentName="Care Assist AI"
      />
    );
  }

  return (
    <div className="relative w-full max-w-[360px] mx-auto">
      {/* Chat panel */}
      <div
        className="bg-card/95 backdrop-blur-lg rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-border/50"
        style={{ width: '100%', height: '460px', maxHeight: '70vh' }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 bg-primary relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-white/20 to-transparent" />
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden relative z-10">
            <img src={careAssistLogo} alt="Care Assist" className="h-8 w-8 object-contain" />
          </div>
          <div className="relative z-10">
            <h3 className="font-semibold text-primary-foreground text-sm">Care Assist AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-primary-foreground/80">Online now</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background to-muted/20">
          {messages.map((msg, i) => (
            <div key={i} className={cn('flex gap-3', msg.role === 'visitor' ? 'justify-end' : '')}>
              {msg.role === 'assistant' && (
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <img src={careAssistLogo} alt="" className="h-5 w-5 object-contain" />
                </div>
              )}
              <div
                className={cn(
                  'px-4 py-2.5 max-w-[80%] text-sm leading-relaxed',
                  msg.role === 'visitor'
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                    : 'bg-muted/50 text-foreground rounded-2xl rounded-tl-sm'
                )}
              >
                {msg.content}
                {msg.typing && <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Fake input */}
        <div className="p-3 border-t border-border/50 bg-card/50 shrink-0">
          <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2.5 border border-border/40">
            <span className="flex-1 text-sm text-muted-foreground/50">Type a message…</span>
          </div>
        </div>
      </div>

      {/* Jump In overlay */}
      {showJumpIn && (
        <div className="absolute inset-x-0 bottom-16 flex justify-center animate-fade-in z-10">
          <Button
            onClick={() => setJumped(true)}
            size="lg"
            className="rounded-full px-8 h-12 text-base font-bold shadow-xl shadow-primary/30 gap-2 group"
          >
            <MessageCircle className="h-5 w-5" />
            Jump In
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      )}
    </div>
  );
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
