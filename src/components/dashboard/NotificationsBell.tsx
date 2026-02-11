import { useState } from 'react';
import { Bell, MessageSquare, AlertTriangle, Phone, Building2, ChevronRight, Mail, MailX, Send, SendHorizonal, Upload, UploadCloud, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInAppNotifications, InAppNotification, NotificationType } from '@/hooks/useInAppNotifications';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const iconMap: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  new_chat: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  escalation: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  phone_captured: { icon: Phone, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  property_added: { icon: Building2, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  new_message: { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
  email_sent: { icon: Mail, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  email_failed: { icon: MailX, color: 'text-red-500', bg: 'bg-red-500/10' },
  slack_sent: { icon: Send, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  slack_failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  export_success: { icon: UploadCloud, color: 'text-green-500', bg: 'bg-green-500/10' },
  export_failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

interface NotificationsBellProps {
  /** Use 'header' for the dark sidebar-colored header bar */
  variant?: 'header' | 'default';
}

export const NotificationsBell = ({ variant = 'default' }: NotificationsBellProps) => {
  const { notifications, unseenCount, markAllSeen } = useInAppNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      markAllSeen();
    }
  };

  const handleClick = (notif: InAppNotification) => {
    if (notif.conversationId) {
      navigate(`/dashboard?c=${notif.conversationId}`);
    }
    setOpen(false);
  };

  const isHeader = variant === 'header';

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-8 w-8 rounded-lg transition-all duration-200",
            isHeader
              ? "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Bell className="h-4 w-4" />
          {unseenCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm animate-scale-in">
              {unseenCount > 9 ? '9+' : unseenCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] sm:w-[380px] p-0 rounded-xl shadow-lg border border-border/60 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unseenCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unseenCount} new
            </span>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Events will appear here as they happen</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map((notif) => {
                const { icon: Icon, color, bg } = iconMap[notif.type] || iconMap.new_chat;
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-150",
                      "hover:bg-accent/50 focus-visible:bg-accent/50 outline-none",
                      notif.conversationId && "cursor-pointer"
                    )}
                  >
                    <div className={cn("mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
                      <Icon className={cn("h-4 w-4", color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{notif.title}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {formatDistanceToNow(notif.timestamp, { addSuffix: false })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.description}</p>
                    </div>
                    {notif.conversationId && (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 mt-1 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-border/50 px-4 py-2.5 bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                navigate('/dashboard/notifications');
                setOpen(false);
              }}
            >
              View all notification settings
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
