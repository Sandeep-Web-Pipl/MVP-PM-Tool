'use client';

import { useState, useTransition } from 'react';
import {
    Bell,
    Circle,
    MessageSquare,
    FileText,
    AlertCircle,
    CheckCheck,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { markNotificationAsReadAction, markAllAsReadAction } from '../actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ✅ Use NotificationWithDetails — matches what layout.tsx passes in
import { NotificationWithDetails } from '@/types/features';

interface NotificationBellProps {
    initialNotifications: NotificationWithDetails[];
}

export function NotificationBell({ initialNotifications }: NotificationBellProps) {
    // ✅ Safe fallback — if null/undefined comes in, default to empty array
    const [notifications, setNotifications] = useState(initialNotifications ?? []);
    const [isPending, startTransition] = useTransition();

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = async (id: string) => {
        startTransition(async () => {
            const result = await markNotificationAsReadAction(id);
            if (result.success) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, is_read: true } : n)
                );
            }
        });
    };

    const handleMarkAllAsRead = async () => {
        startTransition(async () => {
            const result = await markAllAsReadAction();
            if (result.success) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                toast.success('All notifications marked as read');
            }
        });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'comment': return <MessageSquare className="h-4 w-4 text-blue-500" />;
            case 'task': return <FileText className="h-4 w-4 text-purple-500" />;
            case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />;
            default: return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    // ✅ Safe date formatter — never crashes even if date is null/invalid
    const safeFormatDate = (dateValue: string | null | undefined): string => {
        if (!dateValue) return '';
        try {
            return formatDistanceToNow(new Date(dateValue), { addSuffix: true });
        } catch {
            return '';
        }
    };

    return (
        <Popover>
            <PopoverTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative h-9 w-9")}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <Badge
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground border-2 border-background"
                        variant="destructive"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 shadow-xl" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8"
                            onClick={handleMarkAllAsRead}
                            disabled={isPending}
                        >
                            <CheckCheck className="mr-2 h-3 w-3" />
                            Mark all
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-80">
                    {notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "flex gap-3 p-4 border-b hover:bg-neutral-50 transition-colors last:border-0",
                                        !n.is_read && "bg-neutral-50"
                                    )}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 space-y-1 overflow-hidden">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn("text-xs leading-relaxed", !n.is_read ? "font-bold text-neutral-900" : "text-neutral-600 font-medium")}>
                                                {/* ✅ Safe string rendering */}
                                                {String(n.title ?? '')}
                                            </p>
                                            {!n.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="h-5 w-5 shrink-0"
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                >
                                                    <Circle className="h-2 w-2 fill-primary text-primary" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-normal">
                                            {/* ✅ Safe string rendering */}
                                            {String(n.body ?? '')}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-medium">
                                            {/* ✅ Safe date formatting with error boundary */}
                                            {safeFormatDate(n.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t text-center bg-neutral-50/50">
                    <Link href="/notifications">
                        <Button variant="ghost" size="sm" className="w-full text-xs font-semibold">
                            View All
                        </Button>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}