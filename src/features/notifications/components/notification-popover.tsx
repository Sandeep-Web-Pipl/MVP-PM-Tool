'use client';

import { 
    Popover, 
    PopoverContent, 
    PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { NotificationList } from './notification-list';
import { useTransition } from 'react';
import { markAllAsReadAction } from '../actions';
import { toast } from 'sonner';

import { Notification } from '@/types/features';

interface NotificationPopoverProps {
    notifications: Notification[];
    unreadCount: number;
}

export function NotificationPopover({ notifications, unreadCount }: NotificationPopoverProps) {
    const [isPending, startTransition] = useTransition();

    const onMarkAllAsRead = () => {
        startTransition(async () => {
            const result = await markAllAsReadAction();
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('All marked as read');
            }
        });
    };

    return (
        <Popover>
            <PopoverTrigger>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background animate-in fade-in zoom-in">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0 shadow-2xl" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <button 
                            onClick={onMarkAllAsRead}
                            disabled={isPending}
                            className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
                <NotificationList notifications={notifications} />
                <div className="p-2 border-t text-center">
                    <button className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors p-2 w-full">
                        Clear all
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
