import { useState, useEffect, useMemo } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS, TooltipRenderProps } from 'react-joyride';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSidebarState } from '@/hooks/useSidebarState';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings, Users, Cloud, Bell, Code, Bot, Clock, AlertTriangle, Sparkles, BarChart3 } from 'lucide-react';

interface DashboardTourProps {
  onComplete?: () => void;
}

// Dashboard tour steps (before AI Support)
const dashboardSteps: Step[] = [
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
    content: "ai-settings-special",
    title: "AI Settings",
    placement: 'right',
    data: { isAISettings: true },
  },
];

// AI Support page tour steps (4 steps)
const aiSupportSteps: Step[] = [
  {
    target: '[data-tour="ai-personas"]',
    content: "Create AI personas with unique personalities. Each persona can have different conversation styles and be assigned to specific properties.",
    title: "AI Personas",
    placement: 'left',
    disableBeacon: true,
    floaterProps: { disableFlip: true },
    data: { icon: 'bot' },
  },
  {
    target: '[data-tour="ai-timing"]',
    content: "Make your AI feel more human by adding response delays and typing indicators. Smart Typing Duration calculates realistic typing time based on message length and WPM, so longer replies take longer to 'type' — just like a real person.",
    title: "Response Timing",
    placement: 'left',
    floaterProps: { disableFlip: true },
    data: { icon: 'clock' },
  },
  {
    target: '[data-tour="ai-escalation"]',
    content: "Set rules for when AI should hand off to a human agent. Trigger escalation after a number of messages or when specific keywords are detected.",
    title: "Escalation Rules",
    placement: 'left',
    floaterProps: { disableFlip: true },
    data: { icon: 'alert' },
  },
  {
    target: '[data-tour="ai-engagement"]',
    content: "Control how you collect visitor information. With Natural Lead Capture ON, the AI conversationally asks for name, phone, and other details during the chat — no forms needed. When it's OFF, visitors see a traditional form they must fill out before chatting.",
    title: "Engagement & Lead Capture",
    placement: 'left',
    floaterProps: { disableFlip: true },
    data: { icon: 'message' },
  },
  {
    target: '[data-tour="analytics-sidebar"]',
    content: "analytics-sidebar-special",
    title: "Analytics",
    placement: 'right',
    data: { isAnalyticsSidebar: true },
  },
];
// Analytics page tour steps
const analyticsSteps: Step[] = [
  {
    target: '[data-tour="analytics-top-pages"]',
    content: "See which pages on your website generate the most conversations. The page address shows exactly where visitors are engaging with your chat widget.",
    title: "Top Performing Pages",
    placement: 'left',
    disableBeacon: true,
    floaterProps: { disableFlip: true },
  },
  {
    target: '[data-tour="analytics-stats"]',
    content: "\"Opens\" counts how many times visitors started a chat. \"Escalations\" tracks when AI handed off to a human agent — this helps you measure AI effectiveness and staffing needs.",
    title: "Opens & Escalations",
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="widget-code-sidebar"]',
    content: "widget-code-sidebar-special",
    title: "Widget Code",
    placement: 'right',
    data: { isWidgetCodeSidebar: true },
  },
];

// Widget Code page tour steps
const widgetCodeSteps: Step[] = [
  {
    target: '[data-tour="widget-icon-card"]',
    content: "Choose an icon that matches your brand. This is the button visitors click to open your chat widget.",
    title: "Chat Launcher Icon",
    placement: 'right',
    disableBeacon: true,
    data: { icon: 'icon' },
  },
  {
    target: '[data-tour="widget-color-card"]',
    content: "Pick a color that matches your website's branding. We can even extract colors automatically from your domain.",
    title: "Brand Color",
    placement: 'right',
    data: { icon: 'palette' },
  },
  {
    target: '[data-tour="widget-embed-tab"]',
    content: "Click this tab to get the code snippet you'll add to your website.",
    title: "Embed Code Tab",
    placement: 'bottom',
    data: { isClickRequired: true },
  },
  {
    target: '[data-tour="widget-embed-code"]',
    content: "Copy this snippet and paste it just before the closing </body> tag on your website. That's it — your chat widget will be live!",
    title: "Your Embed Code",
    placement: 'left',
    floaterProps: { disableFlip: true },
  },
  {
    target: '[data-tour="widget-preview"]',
    content: "This is how your widget will look on your website. Toggle between desktop and mobile views to see how it adapts.",
    title: "Live Preview",
    placement: 'top',
  },
];
// Remaining dashboard steps (after Widget Code - Team, Salesforce, Notifications)
const remainingDashboardSteps: Step[] = [
  {
    target: '[data-tour="team-members"]',
    content: "team-members-special",
    title: "Build Your Team",
    placement: 'right',
    data: { isTeamMembers: true },
  },
  {
    target: '[data-tour="salesforce"]',
    content: "salesforce-special",
    title: "Salesforce Integration",
    placement: 'right',
    data: { isSalesforce: true },
  },
  {
    target: '[data-tour="notifications"]',
    content: "notifications-special",
    title: "Notifications",
    placement: 'right',
    data: { isNotifications: true },
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
  onSetupAnalytics,
  onSetupWidgetCode,
}: TooltipRenderProps & { 
  onSetupAI: () => void; 
  onSetupTeam: () => void;
  onSetupSalesforce: () => void;
  onSetupNotifications: () => void;
  onSetupWidget: () => void;
  onSetupAnalytics: () => void;
  onSetupWidgetCode: () => void;
}) => {
  const isAISettings = step.data?.isAISettings;
  const isTeamMembers = step.data?.isTeamMembers;
  const isSalesforce = step.data?.isSalesforce;
  const isNotifications = step.data?.isNotifications;
  const isWidgetCode = step.data?.isWidgetCode;
  const isAnalyticsSidebar = step.data?.isAnalyticsSidebar;
  const isWidgetCodeSidebar = step.data?.isWidgetCodeSidebar;

  return (
    <div
      {...tooltipProps}
      className="bg-background rounded-2xl shadow-2xl max-w-sm overflow-hidden border border-border/50"
    >
      {/* Progress bar at top */}
      <div className="h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${((index + 1) / size) * 100}%` }}
        />
      </div>
      
      <div className="p-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            Step {index + 1} of {size}
          </span>
        </div>
        
        {step.title && (
          <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
        )}
        
        {isAISettings ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="p-2 rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">AI Personality</p>
                <p className="text-xs text-muted-foreground">Customize your AI's tone, style, and conversation approach to match your brand voice.</p>
              </div>
            </div>
          </div>
        ) : isTeamMembers ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Collaborate Together</p>
                <p className="text-xs text-muted-foreground">Invite team members with their own login credentials. Assign conversations and share the workload.</p>
              </div>
            </div>
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
            <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
              <div className="p-2 rounded-full bg-cyan-500/10">
                <Cloud className="h-4 w-4 text-cyan-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">CRM Sync</p>
                <p className="text-xs text-muted-foreground">Auto-export visitor leads to Salesforce. Track conversions and keep your sales team in the loop.</p>
              </div>
            </div>
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
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <div className="p-2 rounded-full bg-amber-500/10">
                <Bell className="h-4 w-4 text-amber-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Stay Informed</p>
                <p className="text-xs text-muted-foreground">Get instant alerts via email or Slack when new conversations start or when AI escalates to a human.</p>
              </div>
            </div>
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
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
              <div className="p-2 rounded-full bg-green-500/10">
                <Code className="h-4 w-4 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Go Live</p>
                <p className="text-xs text-muted-foreground">Copy a single line of code to your website. Your chat widget will be live and ready to engage visitors.</p>
              </div>
            </div>
            <Button 
              onClick={onSetupWidget}
              className="w-full"
              size="sm"
            >
              <Code className="mr-2 h-4 w-4" />
              Get Widget Code Now
            </Button>
          </div>
        ) : isAnalyticsSidebar ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="p-2 rounded-full bg-primary/10">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Track Performance</p>
                <p className="text-xs text-muted-foreground">See which pages drive the most conversations and how often AI escalates to human agents.</p>
              </div>
            </div>
          </div>
        ) : isWidgetCodeSidebar ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
              <div className="p-2 rounded-full bg-green-500/10">
                <Code className="h-4 w-4 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Go Live</p>
                <p className="text-xs text-muted-foreground">Customize your chat widget's appearance and get the embed code to add it to your website.</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">{step.content}</p>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
          <button
            {...skipProps}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Skip Tour
          </button>
          <div className="flex items-center gap-3">
            {index > 0 && (
              <button
                {...backProps}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
              >
                Back
              </button>
            )}
            <Button
              {...primaryProps}
              size="sm"
              className="gap-1.5 px-4"
              onClick={isAISettings ? onSetupAI : isAnalyticsSidebar ? onSetupAnalytics : isWidgetCodeSidebar ? onSetupWidgetCode : primaryProps.onClick}
            >
              {isAISettings ? 'Tour AI Settings' : isAnalyticsSidebar ? 'View Analytics' : isWidgetCodeSidebar ? 'Tour Widget Code' : isLastStep ? 'Get Started!' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
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
  const location = useLocation();
  const { user } = useAuth();
  const { setCollapsed } = useSidebarState();

  // Determine which steps to show based on current route
  const isOnAISupport = location.pathname === '/dashboard/ai-support';
  const tourPhase = searchParams.get('tourPhase') || 'dashboard';
  
  // Build the current tour steps based on phase
  const currentSteps = useMemo(() => {
    if (tourPhase === 'ai-support') {
      return aiSupportSteps;
    }
    if (tourPhase === 'analytics') {
      return analyticsSteps;
    }
    return dashboardSteps;
  }, [tourPhase]);

  const totalSteps = dashboardSteps.length + aiSupportSteps.length + analyticsSteps.length + widgetCodeSteps.length + remainingDashboardSteps.length - 1;

  // Calculate display step number
  const getDisplayStepNumber = () => {
    if (tourPhase === 'ai-support') {
      return dashboardSteps.length + stepIndex; // Continue from where we left off
    }
    return stepIndex + 1;
  };

  // Check for tour param and start tour
  useEffect(() => {
    const shouldStartTour = searchParams.get('tour') === '1';
    if (shouldStartTour) {
      // Expand sidebar when tour starts so elements are visible
      setCollapsed(false);
      
      // Longer delay to ensure DOM elements are rendered and sidebar is expanded
      const timer = setTimeout(() => {
        setRun(true);
        setStepIndex(0);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [searchParams, location.pathname, setCollapsed]);

  const handleSetupAI = () => {
    // Navigate to AI Support and continue tour there
    setRun(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tourPhase', 'ai-support');
    navigate(`/dashboard/ai-support?tour=1&tourPhase=ai-support`);
  };

  const endTourAndNavigate = async (path: string) => {
    setRun(false);
    searchParams.delete('tour');
    searchParams.delete('tourPhase');
    setSearchParams(searchParams, { replace: true });

    if (user) {
      await supabase
        .from('profiles')
        .update({ dashboard_tour_complete: true })
        .eq('user_id', user.id);
    }

    navigate(path);
  };

  const handleSetupTeam = () => endTourAndNavigate('/dashboard/team');
  const handleSetupSalesforce = () => endTourAndNavigate('/dashboard/salesforce');
  const handleSetupNotifications = () => endTourAndNavigate('/dashboard/notifications');
  const handleSetupWidget = () => endTourAndNavigate('/dashboard/widget');

  const handleSetupAnalytics = () => {
    setRun(false);
    navigate(`/dashboard/analytics?tour=1&tourPhase=analytics`);
  };

  const handleSetupWidgetCode = () => {
    setRun(false);
    navigate(`/dashboard/widget?tour=1&tourPhase=widget-code`);
  };

  const scrollTargetIntoView = (stepTarget: string): Promise<void> => {
    return new Promise((resolve) => {
      const selector = stepTarget;
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Wait for smooth scroll to finish
        setTimeout(resolve, 600);
      } else {
        resolve();
      }
    });
  };

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, action, type, index } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      
      // After AI Support steps → navigate to Analytics
      if (tourPhase === 'ai-support' && nextIndex >= aiSupportSteps.length && action !== ACTIONS.PREV) {
        setRun(false);
        navigate(`/dashboard/analytics?tour=1&tourPhase=analytics`);
        return;
      }

      // After Analytics steps → navigate to Widget Code page
      if (tourPhase === 'analytics' && nextIndex >= analyticsSteps.length && action !== ACTIONS.PREV) {
        setRun(false);
        navigate(`/dashboard/widget?tour=1&tourPhase=widget-code`);
        return;
      }

      // After Widget Code steps → navigate to dashboard for remaining sidebar items
      if (tourPhase === 'widget-code' && nextIndex >= widgetCodeSteps.length && action !== ACTIONS.PREV) {
        setRun(false);
        navigate(`/dashboard?tour=1&tourPhase=remaining&stepIndex=0`);
        return;
      }
      
      // Special handling: click the Embed Code tab when advancing to the embed code step
      const nextStep = stepsToUse[nextIndex];
      if (tourPhase === 'widget-code' && nextStep?.target === '[data-tour="widget-embed-code"]') {
        // Click the Embed Code tab first
        const embedTab = document.querySelector('[data-tour="widget-embed-tab"]') as HTMLButtonElement;
        if (embedTab) {
          embedTab.click();
          // Wait for tab switch animation
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Scroll next target into view before advancing
      if (nextStep?.target && typeof nextStep.target === 'string') {
        setRun(false);
        await scrollTargetIntoView(nextStep.target);
        setStepIndex(nextIndex);
        // Small delay to let DOM settle after scroll
        setTimeout(() => setRun(true), 100);
      } else {
        setStepIndex(nextIndex);
      }
    }

    if (finishedStatuses.includes(status)) {
      // If we're finishing the analytics phase, navigate to widget-code instead of ending
      if (tourPhase === 'analytics' && status === STATUS.FINISHED) {
        setRun(false);
        navigate(`/dashboard/widget?tour=1&tourPhase=widget-code`);
        return;
      }
      
      // If we're finishing the widget-code phase, navigate to remaining steps
      if (tourPhase === 'widget-code' && status === STATUS.FINISHED) {
        setRun(false);
        navigate(`/dashboard?tour=1&tourPhase=remaining&stepIndex=0`);
        return;
      }
      
      setRun(false);
      
      // Remove tour params from URL
      searchParams.delete('tour');
      searchParams.delete('tourPhase');
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

  // Handle remaining/widget-code phase navigation
  useEffect(() => {
    if (tourPhase === 'remaining' || tourPhase === 'widget-code') {
      const startIndex = parseInt(searchParams.get('stepIndex') || '0', 10);
      setStepIndex(startIndex);
    }
  }, [tourPhase, searchParams]);

  // Get the right steps for current phase
  const stepsToUse = useMemo(() => {
    if (tourPhase === 'widget-code') {
      return widgetCodeSteps;
    }
    if (tourPhase === 'remaining') {
      return remainingDashboardSteps;
    }
    if (tourPhase === 'analytics') {
      return analyticsSteps;
    }
    return currentSteps;
  }, [tourPhase, currentSteps]);

  return (
    <Joyride
      steps={stepsToUse}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      hideCloseButton
      scrollToFirstStep
      scrollOffset={200}
      disableOverlayClose
      disableScrollParentFix={false}
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
          onSetupAnalytics={handleSetupAnalytics}
          onSetupWidgetCode={handleSetupWidgetCode}
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
