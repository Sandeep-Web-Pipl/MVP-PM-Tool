'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { TaskWithAssignee } from '@/types/features';

interface KanbanCardProps {
    task: TaskWithAssignee;
}

export function KanbanCard({ task }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-700 hover:bg-red-100';
            case 'high': return 'bg-orange-100 text-orange-700 hover:bg-orange-100';
            case 'medium': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
            case 'low': return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Construct task detail URL (removing /kanban from current path if present)
    const taskUrl = typeof window !== 'undefined'
        ? `${window.location.pathname.replace('/kanban', '')}/tasks/${task.id}`
        : `/projects/${task.project_id}/tasks/${task.id}`;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                'group cursor-grab active:cursor-grabbing',
                isDragging && 'opacity-50 ring-2 ring-primary ring-offset-2'
            )}
        >
            <Link href={taskUrl}>
                <Card className="shadow-sm hover:border-primary/50 transition-colors">
                    <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold leading-relaxed">
                                {task.title}
                            </h4>
                            <Badge className={cn('text-[10px] px-1.5 py-0 font-bold uppercase shrink-0', getPriorityColor(task.priority))}>
                                {task.priority}
                            </Badge>
                        </div>

                        {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {task.description}
                            </p>
                        )}

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                {task.due_date && (
                                    <div className="flex items-center">
                                        <Calendar className="mr-1 h-3 w-3" />
                                        {format(new Date(task.due_date), 'MMM d')}
                                    </div>
                                )}
                                {task.assignee && (
                                    <div className="flex items-center">
                                        <User className="mr-1 h-3 w-3" />
                                        {task.assignee.full_name?.split(' ')[0] || 'User'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
}
