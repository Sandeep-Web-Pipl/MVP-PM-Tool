'use client';

import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { deleteCommentAction } from '../actions';
import { toast } from 'sonner';

import { CommentWithUser } from '@/types/features';

interface CommentListProps {
    comments: CommentWithUser[];
    currentUserId: string;
    taskId: string;
    projectId: string;
}

export function CommentList({ comments, currentUserId, taskId, projectId }: CommentListProps) {
    const [isPending, startTransition] = useTransition();

    const onDelete = (commentId: string) => {
        startTransition(async () => {
            const result = await deleteCommentAction(commentId, taskId, projectId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Comment deleted');
            }
        });
    };

    if (comments.length === 0) {
        return (
            <div className="py-6 text-center border rounded-lg bg-muted/20">
                <p className="text-sm text-muted-foreground italic">No comments yet. Be the first to say something!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {comment.user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{comment.user?.full_name || 'Anonymous'}</span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                </span>
                            </div>
                            {comment.user_id === currentUserId && (
                                <Button 
                                    variant="ghost" 
                                    size="icon-xs" 
                                    onClick={() => onDelete(comment.id)}
                                    disabled={isPending}
                                >
                                    <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
                                </Button>
                            )}
                        </div>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg rounded-tl-none whitespace-pre-wrap">
                            {comment.content}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
