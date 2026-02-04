import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardTourProps {
  onComplete?: () => void;
}

const tourSteps: Step[] = [
  {
    target: '[data-tour="sidebar-logo"]',
    content: "Welcome to your command center! Let me show you around so you can start helping visitors right away.",
    title: "Welcome! 👋",
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="inbox-section"]',
    content: "All your visitor conversations appear here. New messages will show a badge so you never miss one.",
    title: "Your Inbox",
    placement: 'right',
  },
  {
    target: '[data-tour="active-filter"]',
    content: "Quick filter to see ongoing conversations that need your attention.",
    title: "Active Chats",
    placement: 'right',
  },
  {
    target: '[data-tour="conversation-list"]',
    content: "Click any conversation to open it. Unread ones are highlighted so they're easy to spot.",
    title: "Conversation List",
    placement: 'right-start',
  },
  {
    target: '[data-tour="ai-support"]',
    content: "Customize your AI assistant's personality and behavior. Make it sound just like your brand.",
    title: "AI Settings",
    placement: 'right',
  },
  {
    target: '[data-tour="widget-code"]',
    content: "Copy the embed code to add the chat widget to your website. It only takes a minute!",
    title: "Get Your Widget",
    placement: 'right',
  },
  {
    target: '[data-tour="team-members"]',
    content: "Invite team members to help manage conversations. They'll get their own login to respond to visitors.",
    title: "Build Your Team",
    placement: 'right',
  },
];

export const DashboardTour = ({ onComplete }: DashboardTourProps) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check for tour param and start tour
  useEffect(() => {
    const shouldStartTour = searchParams.get('tour') === '1';
    if (shouldStartTour) {
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        setRun(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, action, type, index } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Update step index
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }

    if (finishedStatuses.includes(status)) {
      setRun(false);
      
      // Remove tour param from URL
      searchParams.delete('tour');
      setSearchParams(searchParams, { replace: true });

      // Mark tour as complete in database
      if (user) {
        await supabase
          .from('profiles')
          .update({ dashboard_tour_complete: true })
          .eq('user_id', user.id);
      }

      onComplete?.();
    }
  };

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      hideCloseButton
      scrollToFirstStep
      disableOverlayClose
      spotlightClicks
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--background))',
          textColor: 'hsl(var(--foreground))',
          arrowColor: 'hsl(var(--background))',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '8px',
        },
        tooltipContent: {
          fontSize: '14px',
          lineHeight: '1.6',
          padding: '8px 0 0 0',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 500,
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: '8px',
          fontSize: '14px',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: '14px',
        },
        spotlight: {
          borderRadius: '12px',
        },
        beacon: {
          display: 'none',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Get Started!',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};
