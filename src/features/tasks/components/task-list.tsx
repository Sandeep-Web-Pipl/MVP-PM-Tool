'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { TaskWithAssignee } from '@/types/features';

interface TaskListProps {
    tasks: TaskWithAssignee[];
}

export function TaskList({ tasks }: TaskListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    const filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (tasks.length === 0) {
        return (
            <div className="flex h-[300px] shrink-0 items-center justify-center rounded-md border border-dashed text-center p-8">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center">
                    <h3 className="mt-4 text-lg font-semibold">No tasks yet</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground italic">
                        Get started by creating your first task for this project.
                    </p>
                </div>
            </div>
        );
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-700 hover:bg-red-100';
            case 'high': return 'bg-orange-100 text-orange-700 hover:bg-orange-100';
            case 'medium': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
            case 'low': return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return 'bg-green-100 text-green-700 hover:bg-green-100';
            case 'review': return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
            case 'in_progress': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
            default: return 'bg-neutral-100 text-neutral-700 hover:bg-neutral-100';
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
            </div>
            
            <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-10 border rounded-lg border-dashed">
                        <p className="text-sm text-muted-foreground font-medium">No tasks match your search.</p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <Link
                            key={task.id}
                            href={`/projects/${task.project_id}/tasks/${task.id}`}
                            className="block group"
                        >
                            {/* ... existing card content ... */}
                    <div
                        className="flex flex-col gap-2 rounded-lg border bg-card p-4 transition-all hover:shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-neutral-900 leading-none text-base group-hover:text-primary transition-colors">
                                {task.title}
                            </h4>
                            <div className="flex items-center gap-2">
                                <Badge className={cn('text-[10px] px-1.5 py-0 uppercase font-bold', getPriorityColor(task.priority))}>
                                    {task.priority}
                                </Badge>
                                <Badge className={cn('text-[10px] px-1.5 py-0 uppercase font-bold', getStatusColor(task.status))}>
                                    {task.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        </div>

                        {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                                {task.description}
                            </p>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                {task.due_date && isMounted && (
                                    <div className="flex items-center">
                                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                        {format(new Date(task.due_date), 'MMM d, yyyy')}
                                    </div>
                                )}
                                {task.assignee && (
                                    <div className="flex items-center border rounded-full px-1.5 py-0.5 bg-neutral-50">
                                        <User className="mr-1 h-3 w-3" />
                                        {task.assignee.full_name || 'Assigned'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
                )))}
            </div>
        </div>
    );
}
