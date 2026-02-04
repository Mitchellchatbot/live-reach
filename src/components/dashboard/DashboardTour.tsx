import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS, TooltipRenderProps } from 'react-joyride';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings, Users, Cloud, Bell, Code } from 'lucide-react';

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
    content: "ai-settings-special", // Special marker for custom content
    title: "AI Settings",
    placement: 'right',
    data: { isAISettings: true },
  },
  {
    target: '[data-tour="team-members"]',
    content: "team-members-special", // Special marker for custom content
    title: "Build Your Team",
    placement: 'right',
    data: { isTeamMembers: true },
  },
  {
    target: '[data-tour="salesforce"]',
    content: "salesforce-special", // Special marker for custom content
    title: "Salesforce Integration",
    placement: 'right',
    data: { isSalesforce: true },
  },
  {
    target: '[data-tour="notifications"]',
    content: "notifications-special", // Special marker for custom content
    title: "Notifications",
    placement: 'right',
    data: { isNotifications: true },
  },
  {
    target: '[data-tour="widget-code"]',
    content: "widget-code-special", // Special marker for custom content
    title: "Get Your Widget",
    placement: 'right',
    data: { isWidgetCode: true },
  },
];

// Custom tooltip component
const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
  size,
  onSetupAI,
  onSetupTeam,
  onSetupSalesforce,
  onSetupNotifications,
  onSetupWidget,
}: TooltipRenderProps & { 
  onSetupAI: () => void; 
  onSetupTeam: () => void;
  onSetupSalesforce: () => void;
  onSetupNotifications: () => void;
  onSetupWidget: () => void;
}) => {
  const isAISettings = step.data?.isAISettings;
  const isTeamMembers = step.data?.isTeamMembers;
  const isSalesforce = step.data?.isSalesforce;
  const isNotifications = step.data?.isNotifications;
  const isWidgetCode = step.data?.isWidgetCode;

  return (
    <div
      {...tooltipProps}
      className="bg-background rounded-xl p-5 shadow-2xl max-w-sm"
    >
      {step.title && (
        <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
      )}
      
      {isAISettings ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Customize your AI assistant's personality, response style, and behavior. Make it sound just like your brand.
          </p>
          <Button 
            onClick={onSetupAI}
            className="w-full"
            size="sm"
          >
            <Settings className="mr-2 h-4 w-4" />
            Set Up AI Now
          </Button>
        </div>
      ) : isTeamMembers ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Invite team members to help manage conversations. They'll get their own login to respond to visitors.
          </p>
          <Button 
            onClick={onSetupTeam}
            className="w-full"
            size="sm"
          >
            <Users className="mr-2 h-4 w-4" />
            Add Team Members Now
          </Button>
        </div>
      ) : isSalesforce ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect Salesforce to automatically sync visitor leads with your CRM and track conversions.
          </p>
          <Button 
            onClick={onSetupSalesforce}
            className="w-full"
            size="sm"
          >
            <Cloud className="mr-2 h-4 w-4" />
            Connect Salesforce Now
          </Button>
        </div>
      ) : isNotifications ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Set up email and Slack notifications so you never miss an important conversation or lead.
          </p>
          <Button 
            onClick={onSetupNotifications}
            className="w-full"
            size="sm"
          >
            <Bell className="mr-2 h-4 w-4" />
            Set Up Notifications Now
          </Button>
        </div>
      ) : isWidgetCode ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Copy the embed code to add the chat widget to your website. It only takes a minute!
          </p>
          <Button 
            onClick={onSetupWidget}
            className="w-full"
            size="sm"
          >
            <Code className="mr-2 h-4 w-4" />
            Get Widget Code Now
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed">{step.content}</p>
      )}

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
        <button
          {...skipProps}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip Tour
        </button>
        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Back
            </button>
          )}
          <Button
            {...primaryProps}
            size="sm"
          >
            {isLastStep ? 'Get Started!' : `Next (Step ${index + 1} of ${size})`}
            {!isLastStep && <ArrowRight className="ml-1.5 h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

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

  const handleSetupAI = async () => {
    // End the tour and navigate to AI Support
    setRun(false);
    searchParams.delete('tour');
    setSearchParams(searchParams, { replace: true });

    if (user) {
      await supabase
        .from('profiles')
        .update({ dashboard_tour_complete: true })
        .eq('user_id', user.id);
    }

    navigate('/dashboard/ai-support');
  };

  const handleSetupTeam = async () => {
    // End the tour and navigate to Team Members
    setRun(false);
    searchParams.delete('tour');
    setSearchParams(searchParams, { replace: true });

    if (user) {
      await supabase
        .from('profiles')
        .update({ dashboard_tour_complete: true })
        .eq('user_id', user.id);
    }

    navigate('/dashboard/team');
  };

  const handleSetupSalesforce = async () => {
    setRun(false);
    searchParams.delete('tour');
    setSearchParams(searchParams, { replace: true });

    if (user) {
      await supabase
        .from('profiles')
        .update({ dashboard_tour_complete: true })
        .eq('user_id', user.id);
    }

    navigate('/dashboard/salesforce');
  };

  const handleSetupNotifications = async () => {
    setRun(false);
    searchParams.delete('tour');
    setSearchParams(searchParams, { replace: true });

    if (user) {
      await supabase
        .from('profiles')
        .update({ dashboard_tour_complete: true })
        .eq('user_id', user.id);
    }

    navigate('/dashboard/notifications');
  };

  const handleSetupWidget = async () => {
    setRun(false);
    searchParams.delete('tour');
    setSearchParams(searchParams, { replace: true });

    if (user) {
      await supabase
        .from('profiles')
        .update({ dashboard_tour_complete: true })
        .eq('user_id', user.id);
    }

    navigate('/dashboard/widget');
  };

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
      tooltipComponent={(props) => (
        <CustomTooltip 
          {...props} 
          onSetupAI={handleSetupAI} 
          onSetupTeam={handleSetupTeam}
          onSetupSalesforce={handleSetupSalesforce}
          onSetupNotifications={handleSetupNotifications}
          onSetupWidget={handleSetupWidget}
        />
      )}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--background))',
          textColor: 'hsl(var(--foreground))',
          arrowColor: 'hsl(var(--background))',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 10000,
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
