'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './kanban-card';
import { cn } from '@/lib/utils';

import { TaskWithAssignee } from '@/types/features';

interface KanbanColumnProps {
    id: 'todo' | 'in_progress' | 'review' | 'done';
    title: string;
    tasks: TaskWithAssignee[];
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id,
        data: {
            type: 'Column',
        },
    });

    return (
        <div className="flex flex-col gap-4 w-full min-w-[300px] h-full">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-neutral-800 uppercase tracking-wider">
                        {title}
                    </h3>
                    <span className="bg-neutral-200 text-neutral-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {tasks.length}
                    </span>
                </div>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 flex flex-col gap-3 p-2 rounded-xl bg-neutral-100/50 border border-transparent transition-colors min-h-[500px]"
                )}
            >
                <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <KanbanCard key={task.id} task={task} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-neutral-200 rounded-lg">
                        <p className="text-xs text-neutral-400 font-medium italic">
                            No tasks
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
