import { useParams, useSearchParams } from 'react-router-dom';
import { ChatWidget } from '@/components/widget/ChatWidget';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const WidgetEmbed = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [searchParams] = useSearchParams();

  const paramColor = searchParams.get('primaryColor');
  const textColor = searchParams.get('textColor') || 'hsl(0, 0%, 100%)';
  const borderColor = searchParams.get('borderColor') || 'hsl(0, 0%, 0%, 0.1)';
  const widgetSize = (searchParams.get('widgetSize') as 'small' | 'medium' | 'large') || 'medium';
  const borderRadius = parseInt(searchParams.get('borderRadius') || '16', 10);
  const greeting = searchParams.get('greeting') || 'Hi there! How can I help you today?';
  const autoOpen = searchParams.get('autoOpen') !== 'false';

  // Load the widget_color and widget_icon from the DB so live embeds always reflect saved settings
  const [primaryColor, setPrimaryColor] = useState(paramColor || 'hsl(221, 83%, 53%)');
  const [widgetIcon, setWidgetIcon] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!propertyId) return;
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('widget_color, widget_icon')
        .eq('id', propertyId)
        .maybeSingle();
      if (!error && data) {
        if (data.widget_color && data.widget_color !== '#6B7280') {
          setPrimaryColor(data.widget_color);
        }
        if (data.widget_icon) {
          setWidgetIcon(data.widget_icon);
        }
      }
    };
    loadSettings();
  }, [propertyId]);

  // Ensure transparency is maintained (WidgetApp already sets initial styles)
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Reinforce embed mode class and transparency
    html.classList.add('widget-embed-mode');
    html.classList.remove('dark');
    
    html.style.setProperty('background', 'transparent', 'important');
    html.style.setProperty('background-color', 'transparent', 'important');
    body.style.setProperty('background', 'transparent', 'important');
    body.style.setProperty('background-color', 'transparent', 'important');
    body.style.setProperty('overflow', 'hidden', 'important');

    return () => {
      html.classList.remove('widget-embed-mode');
      html.style.background = '';
      html.style.backgroundColor = '';
      body.style.background = '';
      body.style.backgroundColor = '';
      body.style.overflow = '';
    };
  }, []);

  if (!propertyId) {
    return <div className="p-4 text-red-500">Property ID is required</div>;
  }

  return (
    <div 
      className="w-full h-full overflow-hidden pointer-events-none"
      style={{ background: 'transparent', backgroundColor: 'transparent' }}
    >
      <ChatWidget
        propertyId={propertyId}
        primaryColor={primaryColor}
        textColor={textColor}
        borderColor={borderColor}
        widgetSize={widgetSize}
        borderRadius={borderRadius}
        greeting={greeting}
        isPreview={false}
        autoOpen={autoOpen}
        widgetIcon={widgetIcon}
      />
    </div>
  );
};

export default WidgetEmbed;
