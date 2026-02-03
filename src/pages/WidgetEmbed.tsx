import { useParams, useSearchParams } from 'react-router-dom';
import { ChatWidget } from '@/components/widget/ChatWidget';
import { useEffect } from 'react';

const WidgetEmbed = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [searchParams] = useSearchParams();

  const primaryColor = searchParams.get('primaryColor') || 'hsl(221, 83%, 53%)';
  const textColor = searchParams.get('textColor') || 'hsl(0, 0%, 100%)';
  const borderColor = searchParams.get('borderColor') || 'hsl(0, 0%, 0%, 0.1)';
  const widgetSize = (searchParams.get('widgetSize') as 'small' | 'medium' | 'large') || 'medium';
  const borderRadius = parseInt(searchParams.get('borderRadius') || '16', 10);
  const greeting = searchParams.get('greeting') || 'Hi there! How can I help you today?';
  const autoOpen = searchParams.get('autoOpen') !== 'false';

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
      />
    </div>
  );
};

export default WidgetEmbed;
