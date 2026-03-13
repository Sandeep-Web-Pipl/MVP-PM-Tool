'use client';

import { formatDistanceToNow } from 'date-fns';
import { LucideIcon, PlusCircle, MessageSquare, ArrowRightCircle, Settings, CheckCircle2, Trash2, FileEdit, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivityWithActor } from '@/types/features';

interface ActivityTimelineProps {
    activities: ActivityWithActor[];
}

const actionIcons: Record<string, LucideIcon> = {
    created: PlusCircle,
    updated: FileEdit,
    deleted: Trash2,
    commented: MessageSquare,
    moved: ArrowRightCircle,
    completed: CheckCircle2,
    joined: UserPlus,
};

const actionColors: Record<string, string> = {
    created: 'text-green-600 bg-green-50',
    updated: 'text-blue-600 bg-blue-50',
    deleted: 'text-red-600 bg-red-50',
    commented: 'text-purple-600 bg-purple-50',
    moved: 'text-orange-600 bg-orange-50',
    completed: 'text-emerald-600 bg-emerald-50',
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
    if (activities.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground italic">No recent activity</p>
            </div>
        );
    }

    return (
        <div className="relative space-y-4">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-neutral-200" />
            {activities.map((activity) => {
                const Icon = actionIcons[activity.action] || Settings;
                const colorClass = actionColors[activity.action] || 'text-neutral-600 bg-neutral-50';

                return (
                    <div key={activity.id} className="relative flex gap-4 pl-10">
                        <div className={cn(
                            "absolute left-0 p-2 rounded-full ring-4 ring-white z-10",
                            colorClass
                        )}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 pt-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm">
                                    <span className="font-bold text-neutral-900">{activity.actor?.full_name || 'System'}</span>
                                    {' '}
                                    <span className="text-neutral-600">{activity.action}</span>
                                    {' '}
                                    <span className="font-medium text-neutral-800">
                                        {activity.entity_type}: {activity.metadata?.title || activity.entity_id}
                                    </span>
                                </p>
                                <time className="text-[10px] text-muted-foreground whitespace-nowrap">
                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                </time>
                            </div>
                            {activity.metadata?.contentExcerpt && (
                                <p className="mt-1 text-xs text-muted-foreground italic line-clamp-1 border-l-2 pl-2 border-neutral-100">
                                    &quot;{activity.metadata.contentExcerpt}&quot;
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
