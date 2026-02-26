import { ChatWidget } from '@/components/widget/ChatWidget';

const AUTO_PLAY_SCRIPT = [
  "Hey, it's Sarah",
  "I've been looking into treatment options for my brother",
  "He's struggling with alcohol, we're not sure where to start",
];

export const LPDemoWidget = () => {
  return (
    <ChatWidget
      propertyId="demo"
      isPreview={true}
      autoOpen={true}
      widgetSize="small"
      greeting="Hi there! 👋 I'm so glad you reached out. Before we get started, can I get your first name?"
      agentName="Care Assist AI"
      autoPlayScript={AUTO_PLAY_SCRIPT}
    />
  );
};
