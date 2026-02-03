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
  const autoOpen = searchParams.get('autoOpen') !== 'false'; // Default to true for embeds

  // Force light mode and transparency for widget embed
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Add embed mode class immediately
    html.classList.add('widget-embed-mode');
    body.classList.add('widget-embed-mode');

    // Remove dark class immediately
    html.classList.remove('dark');

    // Force transparency via inline styles
    html.style.setProperty('background', 'transparent', 'important');
    html.style.setProperty('background-color', 'transparent', 'important');
    body.style.setProperty('background', 'transparent', 'important');
    body.style.setProperty('background-color', 'transparent', 'important');
    body.style.setProperty('overflow', 'hidden', 'important');

    // Create a MutationObserver to prevent dark class from being added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (html.classList.contains('dark')) {
            html.classList.remove('dark');
          }
        }
      });
    });

    observer.observe(html, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      html.classList.remove('widget-embed-mode');
      body.classList.remove('widget-embed-mode');
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
