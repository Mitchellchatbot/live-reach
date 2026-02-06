import { useParams } from 'react-router-dom';
import { ChatWidget } from '@/components/widget/ChatWidget';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const WidgetEmbed = () => {
  const { propertyId } = useParams<{ propertyId: string }>();

  const autoOpen = true;

  // Load ALL widget settings from DB so the live embed always matches the preview
  const [primaryColor, setPrimaryColor] = useState('hsl(221, 83%, 53%)');
  const [widgetIcon, setWidgetIcon] = useState<string | undefined>(undefined);
  const [greeting, setGreeting] = useState('Hi there! How can I help you today?');
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('widget_color, widget_icon, greeting')
        .eq('id', propertyId)
        .maybeSingle();
      if (!error && data) {
        if (data.widget_color && data.widget_color !== '#6B7280') {
          setPrimaryColor(data.widget_color);
        }
        if (data.widget_icon) {
          setWidgetIcon(data.widget_icon);
        }
        if (data.greeting) {
          setGreeting(data.greeting);
        }
      }
      setSettingsLoaded(true);
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
    return <div className="p-4 text-destructive">Property ID is required</div>;
  }

  // Wait for DB settings before rendering widget to avoid flash of defaults
  if (!settingsLoaded) {
    return null;
  }

  return (
    <div 
      className="w-full h-full overflow-hidden pointer-events-none"
      style={{ background: 'transparent', backgroundColor: 'transparent' }}
    >
      <ChatWidget
        propertyId={propertyId}
        primaryColor={primaryColor}
        greeting={greeting}
        isPreview={false}
        autoOpen={autoOpen}
        widgetIcon={widgetIcon}
      />
    </div>
  );
};

export default WidgetEmbed;
