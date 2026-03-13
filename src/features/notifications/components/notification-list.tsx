'use client';

import { useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { markNotificationAsReadAction } from '../actions';
import { 
    CheckCircle2, 
    AlertCircle, 
    MessageSquare, 
    Bell, 
    Calendar,
    LucideIcon
} from 'lucide-react';
import { Notification } from '@/types/features';

interface NotificationListProps {
    notifications: Notification[];
}

const typeIcons: Record<string, LucideIcon> = {
    info: Bell,
    error: AlertCircle,
    success: CheckCircle2,
    comment: MessageSquare,
    task: Calendar,
};

const typeColors: Record<string, string> = {
    info: 'text-blue-600 bg-blue-50',
    error: 'text-red-600 bg-red-50',
    success: 'text-green-600 bg-green-50',
    comment: 'text-purple-600 bg-purple-50',
    task: 'text-orange-600 bg-orange-50',
};

export function NotificationList({ notifications }: NotificationListProps) {
    const [isPending, startTransition] = useTransition();

    const onMarkAsRead = (id: string) => {
        startTransition(async () => {
            await markNotificationAsReadAction(id);
        });
    };

    if (notifications.length === 0) {
        return (
            <div className="py-12 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground opacity-20" />
                <p className="mt-2 text-sm text-muted-foreground">All caught up! No notifications.</p>
            </div>
        );
    }

    return (
        <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => {
                const Icon = typeIcons[notification.type] || Bell;
                const colorClass = typeColors[notification.type] || 'text-neutral-600 bg-neutral-50';

                return (
                    <div
                        key={notification.id}
                        className={cn(
                            "group relative flex gap-4 p-4 transition-colors hover:bg-muted/50 border-b last:border-0",
                            !notification.is_read && "bg-primary/5"
                        )}
                    >
                        <div className={cn("p-2 rounded-full h-fit", colorClass)}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                                <p className={cn(
                                    "text-sm font-medium leading-none",
                                    !notification.is_read ? "text-foreground" : "text-muted-foreground"
                                )}>
                                    {notification.title}
                                </p>
                                <time 
                                    className="text-[10px] text-muted-foreground whitespace-nowrap pt-0.5"
                                    suppressHydrationWarning
                                >
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </time>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {notification.body}
                            </p>
                            {!notification.is_read && (
                                <button
                                    onClick={() => onMarkAsRead(notification.id)}
                                    disabled={isPending}
                                    className="text-[10px] font-bold text-primary hover:underline mt-1 uppercase tracking-wider"
                                >
                                    Mark as read
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
