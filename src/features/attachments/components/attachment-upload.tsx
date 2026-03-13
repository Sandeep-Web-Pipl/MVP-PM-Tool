'use client';

import { useTransition, useRef } from 'react';
import { toast } from 'sonner';
import { uploadAttachmentAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Paperclip, Loader2 } from 'lucide-react';

interface AttachmentUploadProps {
    taskId: string;
    projectId: string;
}

export function AttachmentUpload({ taskId, projectId }: AttachmentUploadProps) {
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size limit: 5MB for MVP
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        startTransition(async () => {
            const result = await uploadAttachmentAction(taskId, projectId, formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('File uploaded');
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        });
    };

    return (
        <div>
            <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={onFileChange}
                disabled={isPending}
            />
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
            >
                {isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                    <Paperclip className="mr-2 size-4" />
                )}
                {isPending ? 'Uploading...' : 'Upload Attachment'}
            </Button>
        </div>
    );
}
