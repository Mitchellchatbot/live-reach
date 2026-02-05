import { useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageSquare,
  Users, 
  BarChart3, 
  Code, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Archive,
  FlaskConical,
  LifeBuoy,
  Bot,
  Bell,
  Cloud,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { useSidebarState } from '@/hooks/useSidebarState';

import { UserAvatarUpload } from '@/components/sidebar/UserAvatarUpload';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  collapsed: boolean;
  dataTour?: string;
}

const SidebarItem = ({ to, icon: Icon, label, badge, collapsed, dataTour }: SidebarItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const linkContent = (
    <NavLink
      to={to}
      data-tour={dataTour}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group",
        "hover:bg-sidebar-accent",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-full" />
      )}
      <Icon
        className={cn(
          "h-5 w-5 flex-shrink-0 transition-all duration-200",
          isActive 
            ? "text-sidebar-primary" 
            : "text-sidebar-foreground/50 group-hover:text-sidebar-primary group-hover:scale-110"
        )}
      />
      {!collapsed && (
        <>
          <span className={cn(
            "flex-1 transition-colors", 
            isActive ? "font-semibold text-sidebar-foreground" : "font-medium"
          )}>
            {label}
          </span>
          {badge && badge > 0 && (
            <span className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center shadow-sm">
              {badge}
            </span>
          )}
        </>
      )}
      {collapsed && badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-pulse">
          {badge}
        </span>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {linkContent}
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {label}
          {badge && badge > 0 && ` (${badge})`}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
};

const SidebarSection = ({ title, children, collapsed }: { title: string; children: React.ReactNode; collapsed: boolean }) => (
  <div className="space-y-1">
    {!collapsed && (
      <div className="flex items-center gap-2 px-3 mb-2">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-sidebar-foreground/40">
          {title}
        </h3>
        <div className="flex-1 h-px bg-sidebar-border/50" />
      </div>
    )}
    {children}
  </div>
);

export const DashboardSidebar = ({
  badgeCounts,
}: {
  badgeCounts?: { all?: number; active?: number };
}) => {
  const { collapsed, setCollapsed } = useSidebarState();
  const navigate = useNavigate();
  const { profile, updateAvatarUrl } = useUserProfile();
  const { signOut, user, isClient, isAgent, isAdmin } = useAuth();
  
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Badge counts are provided by the page (prevents duplicate useConversations mounts/subscriptions)
  const resolvedBadgeCounts = useMemo(() => {
    return {
      all: badgeCounts?.all ?? 0,
      active: badgeCounts?.active ?? 0,
    };
  }, [badgeCounts?.all, badgeCounts?.active]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <TooltipProvider>
      <aside 
        className={cn(
          "h-screen flex flex-col transition-all duration-300 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-sm",
          collapsed ? "w-[72px]" : "w-72"
        )}
      >
        {/* Logo */}
        <div 
          data-tour="sidebar-logo"
          className={cn(
            "h-16 flex items-center border-b border-sidebar-border px-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-sidebar-foreground">Care Assist</span>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          {!collapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Collapse sidebar
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center py-2 border-b border-sidebar-border">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(false)}
                  className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Expand sidebar
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-thin">
          {/* Inbox - Available to clients and admins */}
          {(isClient || isAdmin) && (
            <div data-tour="inbox-section">
              <SidebarSection title="Inbox" collapsed={collapsed}>
                <SidebarItem to="/dashboard" icon={Inbox} label="All Conversations" badge={resolvedBadgeCounts.all > 0 ? resolvedBadgeCounts.all : undefined} collapsed={collapsed} />
                <div data-tour="active-filter">
                  <SidebarItem to="/dashboard/active" icon={MessageSquare} label="Active" badge={resolvedBadgeCounts.active > 0 ? resolvedBadgeCounts.active : undefined} collapsed={collapsed} />
                </div>
                <SidebarItem to="/dashboard/closed" icon={Archive} label="Closed" collapsed={collapsed} />
              </SidebarSection>
            </div>
          )}

          {/* Manage - Available to clients and admins */}
          {(isClient || isAdmin) && (
            <SidebarSection title="Manage" collapsed={collapsed}>
              <div data-tour="team-members">
                <SidebarItem to="/dashboard/team" icon={Users} label="Team Members" collapsed={collapsed} />
              </div>
              <div data-tour="ai-support">
                <SidebarItem to="/dashboard/ai-support" icon={Bot} label="AI Support" collapsed={collapsed} />
              </div>
              <SidebarItem to="/dashboard/analytics" icon={BarChart3} label="Analytics" collapsed={collapsed} />
            </SidebarSection>
          )}

          {/* Setup - Available to clients and admins */}
          {(isClient || isAdmin) && (
            <SidebarSection title="Setup" collapsed={collapsed}>
              <div data-tour="widget-code">
                <SidebarItem to="/dashboard/widget" icon={Code} label="Widget Code" collapsed={collapsed} />
              </div>
            </SidebarSection>
          )}

          {/* Integrations - Available to clients and admins */}
          {(isClient || isAdmin) && (
            <SidebarSection title="Integrations" collapsed={collapsed}>
              <SidebarItem to="/dashboard/salesforce" icon={Cloud} label="Salesforce" collapsed={collapsed} dataTour="salesforce" />
              <SidebarItem to="/dashboard/notifications" icon={Bell} label="Notifications" collapsed={collapsed} dataTour="notifications" />
            </SidebarSection>
          )}

          {/* Support */}
          {(isClient || isAdmin) && (
            <SidebarSection title="Support" collapsed={collapsed}>
              <SidebarItem to="/dashboard/support" icon={LifeBuoy} label="Get Help" collapsed={collapsed} />
              <SidebarItem to="/documentation" icon={BookOpen} label="Documentation" collapsed={collapsed} />
            </SidebarSection>
          )}

          {/* Dev Tools */}
          {(isClient || isAdmin) && (
            <SidebarSection title="Dev" collapsed={collapsed}>
              <SidebarItem to="/onboarding?dev=1" icon={FlaskConical} label="Test Onboarding" collapsed={collapsed} />
            </SidebarSection>
          )}
        </nav>

        {/* User Profile */}
        <div className={cn(
          "border-t border-sidebar-border/80 p-3",
          collapsed ? "flex flex-col items-center gap-2" : ""
        )}>
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-lg",
            collapsed ? "justify-center flex-col" : ""
          )}>
            <div className="relative flex-shrink-0">
              {collapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div>
                      <UserAvatarUpload
                        userId={user?.id || ''}
                        avatarUrl={profile?.avatar_url}
                        initials={initials}
                        onAvatarUpdate={updateAvatarUrl}
                        size="sm"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to change photo</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <UserAvatarUpload
                  userId={user?.id || ''}
                  avatarUrl={profile?.avatar_url}
                  initials={initials}
                  onAvatarUpdate={updateAvatarUrl}
                  size="sm"
                />
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
              </div>
            )}
            {!collapsed && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 h-8 w-8"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
            {collapsed && (
              <div className="flex flex-col items-center gap-1">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 h-8 w-8"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Sign out
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};
