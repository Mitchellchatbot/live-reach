import { ChatWidget } from '@/components/widget/ChatWidget';

const AUTO_PLAY_SCRIPT = [
  "Hi, my name is Sarah",
  "My brother has been struggling with alcohol and we're not sure where to start",
];

export const LPDemoWidget = () => {
  return (
    <ChatWidget
      propertyId="demo"
      isPreview={true}
      autoOpen={true}
      widgetSize="small"
      greeting="Hi there! 👋 I'm so glad you reached out. Before we get started, can I get your first name?"
      agentName="Care Assist"
      autoPlayScript={AUTO_PLAY_SCRIPT}
    />
  );
};
