import { useState, useEffect } from 'react';
import { ChatWidget } from '@/components/widget/ChatWidget';
import { supabase } from '@/integrations/supabase/client';

const FALLBACK_SCRIPT = [
  "Hi, my name is Sarah",
  "My brother has been struggling with alcohol and we're not sure where to start",
];

export const LPDemoWidget = () => {
  const [mode, setMode] = useState<'demo' | 'interactive'>('demo');
  const [demoScript, setDemoScript] = useState<string[] | null>(null);
  const [widgetKey, setWidgetKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-demo-script');
        if (!cancelled && data?.lines && Array.isArray(data.lines) && data.lines.length >= 2) {
          setDemoScript(data.lines);
        } else {
          if (!cancelled) setDemoScript(FALLBACK_SCRIPT);
        }
      } catch {
        if (!cancelled) setDemoScript(FALLBACK_SCRIPT);
      }
    };
    generate();
    return () => { cancelled = true; };
  }, []);

  const handleStartOwnChat = () => {
    setMode('interactive');
    setWidgetKey(prev => prev + 1);
  };

  if (!demoScript) {
    // Show a loading placeholder matching widget dimensions
    return (
      <div className="w-[370px] h-[520px] max-w-[92vw] max-h-[78vh] rounded-3xl bg-card/80 border border-border/30 flex items-center justify-center">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2.5 w-2.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2.5 w-2.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <ChatWidget
      key={widgetKey}
      propertyId="demo"
      isPreview={true}
      autoOpen={true}
      widgetSize="small"
      greeting="Hi there! 👋 I'm so glad you reached out. Before we get started, can I get your first name?"
      agentName="Care Assist"
      autoPlayScript={mode === 'demo' ? demoScript : undefined}
      demoOverlay={mode === 'demo'}
      onStartOwnChat={handleStartOwnChat}
    />
  );
};
