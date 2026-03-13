'use client';

import { useTransition, useState } from 'react';
import { toast } from 'sonner';
import { updateTaskAction } from '../actions';
import { TaskMetadataSidebar } from './task-metadata-sidebar';
import { ActivityTimeline } from '@/features/activity/components/activity-timeline';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Paperclip, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CommentList } from '@/features/comments/components/comment-list';
import { CommentForm } from '@/features/comments/components/comment-form';
import { AttachmentList } from '@/features/attachments/components/attachment-list';
import { AttachmentUpload } from '@/features/attachments/components/attachment-upload';

import { TaskWithAssignee, MemberWithProfile, ActivityWithActor, CommentWithUser, Attachment } from '@/types/features';

interface TaskDetailViewProps {
    task: TaskWithAssignee;
    members: MemberWithProfile[];
    activities: ActivityWithActor[];
    comments: CommentWithUser[];
    attachments: Attachment[];
    currentUserId: string;
}

export function TaskDetailView({ 
    task, 
    members, 
    activities, 
    comments = [], 
    attachments = [], 
    currentUserId 
}: TaskDetailViewProps) {
    const [isPending, startTransition] = useTransition();
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [description, setDescription] = useState(task.description || '');

    const handleUpdateDescription = () => {
        startTransition(async () => {
            const result = await updateTaskAction(task.id, task.project_id, { description });
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Description updated');
                setIsEditingDescription(false);
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
                {/* Description Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Description</h2>
                        {!isEditingDescription && (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditingDescription(true)}>
                                Edit
                            </Button>
                        )}
                    </div>
                    
                    {isEditingDescription ? (
                        <div className="space-y-2">
                            <Textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a more detailed description..."
                                className="min-h-[150px]"
                                disabled={isPending}
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleUpdateDescription} disabled={isPending}>
                                    Save
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setIsEditingDescription(false);
                                    setDescription(task.description || '');
                                }} disabled={isPending}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-muted/30 rounded-lg p-4 min-h-[100px] whitespace-pre-wrap text-sm">
                            {task.description || <span className="text-muted-foreground italic">No description provided.</span>}
                        </div>
                    )}
                </div>

                {/* Collaboration & Activity Tabs */}
                <Tabs defaultValue="comments" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                        <TabsTrigger value="comments" className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent data-[state=active]:bg-transparent">
                            <MessageSquare className="size-4 mr-2" />
                            Comments ({comments.length})
                        </TabsTrigger>
                        <TabsTrigger value="attachments" className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent data-[state=active]:bg-transparent">
                            <Paperclip className="size-4 mr-2" />
                            Attachments ({attachments.length})
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent data-[state=active]:bg-transparent">
                            <Activity className="size-4 mr-2" />
                            Activity
                        </TabsTrigger>
                    </TabsList>

                    <div className="pt-6">
                        <TabsContent value="comments" className="m-0 space-y-6">
                            <CommentForm taskId={task.id} projectId={task.project_id} />
                            <CommentList 
                                comments={comments} 
                                currentUserId={currentUserId} 
                                taskId={task.id} 
                                projectId={task.project_id} 
                            />
                        </TabsContent>
                        <TabsContent value="attachments" className="m-0 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold">Project Files</h3>
                                <AttachmentUpload taskId={task.id} projectId={task.project_id} />
                            </div>
                            <AttachmentList attachments={attachments} projectId={task.project_id} />
                        </TabsContent>
                        <TabsContent value="activity" className="m-0">
                            <ActivityTimeline activities={activities} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
                <div className="bg-card border rounded-xl p-6 sticky top-6">
                    <TaskMetadataSidebar task={task} members={members} />
                </div>
            </div>
        </div>
    );
}
