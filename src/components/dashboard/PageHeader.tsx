import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { InfoIndicator } from '@/components/docs/InfoIndicator';
import { useSearchParams } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { deepDiveStepsMap } from './DashboardTour';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  docsLink?: string;
  /** Section key for deep dive tour (e.g., 'ai-support', 'widget', 'salesforce') */
  tourSection?: string;
}

export const PageHeader = ({ title, children, className, docsLink, tourSection }: PageHeaderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const hasDeepDive = tourSection && deepDiveStepsMap[tourSection]?.length > 0;

  const startDeepDive = () => {
    if (!tourSection) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tour', '1');
    newParams.set('tourMode', 'deep');
    newParams.set('deepSection', tourSection);
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div 
      className={cn(
        "h-16 shrink-0 flex items-center justify-between px-6 sticky top-0 z-10",
        "bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-sidebar-foreground">{title}</h1>
        {docsLink && <span data-tour="info-indicator"><InfoIndicator to={docsLink} size="md" variant="header" /></span>}
        {hasDeepDive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={startDeepDive}
            className="h-7 gap-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-full px-2.5"
            title="Take a detailed tour of this page"
          >
            <Compass className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Tour this page</span>
          </Button>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
};

// Primary action button styled for dark header
export const HeaderButton = ({ 
  children, 
  variant = 'default',
  ...props 
}: React.ComponentProps<typeof Button> & { variant?: 'default' | 'outline' | 'ghost' }) => {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border-sidebar-foreground/20 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground bg-transparent',
    ghost: 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent',
  };

  return (
    <Button 
      {...props}
      className={cn(variantClasses[variant], props.className)}
    >
      {children}
    </Button>
  );
};
