'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { updateTaskAction } from '../actions';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CalendarIcon, UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { TaskWithAssignee, MemberWithProfile } from '@/types/features';

interface TaskMetadataSidebarProps {
    task: TaskWithAssignee;
    members: MemberWithProfile[];
}

export function TaskMetadataSidebar({ task, members }: TaskMetadataSidebarProps) {
    const [isPending, startTransition] = useTransition();

    const handleUpdate = (field: string, value: string | null) => {
        startTransition(async () => {
            const result = await updateTaskAction(task.id, task.project_id, { [field]: value });
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Task updated');
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Status</Label>
                <Select
                    defaultValue={task.status}
                    onValueChange={(value) => handleUpdate('status', value)}
                    disabled={isPending}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Priority</Label>
                <Select
                    defaultValue={task.priority}
                    onValueChange={(value) => handleUpdate('priority', value)}
                    disabled={isPending}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Assignee</Label>
                <Select
                    defaultValue={task.assignee_id || 'unassigned'}
                    onValueChange={(value) => handleUpdate('assigneeId', value === 'unassigned' ? null : value)}
                    disabled={isPending}
                >
                    <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Unassigned" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {members.map((member) => (
                            <SelectItem key={member.profiles?.id || member.id} value={member.profiles?.id || 'unassigned'}>
                                {member.profiles?.full_name || 'Unknown User'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Due Date</Label>
                <div className="relative">
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="date"
                        defaultValue={task.due_date ? task.due_date.split('T')[0] : ''}
                        onChange={(e) => handleUpdate('dueDate', e.target.value || null)}
                        className="pl-9"
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className="pt-6 border-t space-y-4 text-xs text-muted-foreground">
                <div className="flex justify-between font-medium">
                    <span>Created By</span>
                    <span className="text-foreground">{task.reporter?.full_name || 'System'}</span>
                </div>
                <div className="flex justify-between font-medium">
                    <span>Created At</span>
                    <span className="text-foreground">{format(new Date(task.created_at), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between font-medium">
                    <span>Last Updated</span>
                    <span className="text-foreground">{format(new Date(task.updated_at), 'MMM d, yyyy')}</span>
                </div>
            </div>
        </div>
    );
}
