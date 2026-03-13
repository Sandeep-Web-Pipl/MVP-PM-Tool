'use client';

import { FileIcon, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { deleteAttachmentAction } from '../actions';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

import { Attachment } from '@/types/features';

interface AttachmentListProps {
    attachments: Attachment[];
    projectId: string;
}

export function AttachmentList({ attachments, projectId }: AttachmentListProps) {
    const [isPending, startTransition] = useTransition();
    const supabase = createClient();

    const onDelete = (attachmentId: string, storagePath: string) => {
        startTransition(async () => {
            const result = await deleteAttachmentAction(attachmentId, storagePath, projectId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Attachment deleted');
            }
        });
    };

    const onDownload = async (storagePath: string, fileName: string) => {
        const { data, error } = await supabase.storage
            .from('task-attachments')
            .download(storagePath);

        if (error) {
            toast.error('Failed to download file');
            return;
        }

        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (attachments.length === 0) {
        return (
            <div className="py-6 text-center border rounded-lg bg-muted/20">
                <p className="text-sm text-muted-foreground italic">No attachments yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:border-primary/50 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded bg-primary/10 text-primary">
                            <FileIcon className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{file.file_name}</p>
                            <p className="text-[10px] text-muted-foreground">
                                {(file.file_size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="icon-xs" 
                            onClick={() => onDownload(file.storage_path, file.file_name)}
                        >
                            <Download className="size-3 text-muted-foreground" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon-xs" 
                            onClick={() => onDelete(file.id, file.storage_path)}
                            disabled={isPending}
                        >
                            <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
