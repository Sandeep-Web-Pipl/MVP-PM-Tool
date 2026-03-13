'use client';

import { format } from 'date-fns';
import { ChevronRightIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { TaskWithAssignee } from '@/types/features';

interface UpcomingTasksProps {
    tasks: TaskWithAssignee[];
}

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Upcoming Deadlines</CardTitle>
                <Link href="/projects" className="text-xs text-primary hover:underline font-medium">
                    View all
                </Link>
            </CardHeader>
            <CardContent>
                {tasks.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground italic">
                        No upcoming deadlines found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <Link 
                                key={task.id} 
                                href={`/projects/${task.project_id}/tasks/${task.id}`}
                                className="flex items-center justify-between group"
                            >
                                <div className="space-y-1 min-w-0">
                                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors truncate">
                                        {task.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {task.project?.name}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-neutral-800">
                                            {task.due_date ? format(new Date(task.due_date), 'MMM d') : 'No date'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Due
                                        </p>
                                    </div>
                                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
