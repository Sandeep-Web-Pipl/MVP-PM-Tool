'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { addCommentAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentFormProps {
    taskId: string;
    projectId: string;
}

export function CommentForm({ taskId, projectId }: CommentFormProps) {
    const [isPending, startTransition] = useTransition();
    const [content, setContent] = useState('');

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        startTransition(async () => {
            const result = await addCommentAction(taskId, projectId, { content });
            if (result.error) {
                toast.error(result.error);
            } else {
                setContent('');
                toast.success('Comment added');
            }
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-3">
            <Textarea
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPending}
                className="min-h-[80px] bg-background"
            />
            <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
                    {isPending ? 'Posting...' : 'Post Comment'}
                </Button>
            </div>
        </form>
    );
}
