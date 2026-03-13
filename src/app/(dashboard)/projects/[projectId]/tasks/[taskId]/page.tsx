import { createClient } from '@/lib/supabase/server';
import { getTaskById } from '@/features/tasks/queries';
import { getProjectMembers } from '@/features/projects/queries';
import { getTaskActivity } from '@/features/activity/queries';
import { getCurrentOrganization } from '@/lib/auth/get-organization';
import { TaskDetailView } from '@/features/tasks/components/task-detail-view';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

interface TaskPageProps {
    params: {
        projectId: string;
        taskId: string;
    };
}

export async function generateMetadata({ params }: TaskPageProps): Promise<Metadata> {
    const { taskId } = await params;
    const supabase = await createClient();
    const task = await getTaskById(supabase, taskId);

    return {
        title: task ? `${task.title} - PM Tool` : 'Task Not Found',
    };
}

import { getTaskComments } from '@/features/comments/queries';
import { getTaskAttachments } from '@/features/attachments/queries';

export default async function TaskPage({ params }: TaskPageProps) {
    const { projectId, taskId } = await params;
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return null;

    const [task, members, activities, comments, attachments] = await Promise.all([
        getTaskById(supabase, taskId),
        getProjectMembers(supabase, projectId),
        getTaskActivity(supabase, taskId),
        getTaskComments(supabase, taskId),
        getTaskAttachments(supabase, taskId),
    ]);

    if (!task) return notFound();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/projects" className="hover:text-foreground">Projects</Link>
                <span>/</span>
                <Link href={`/projects/${projectId}`} className="hover:text-foreground">{task.project?.name || 'Project'}</Link>
                <span>/</span>
                <span className="text-foreground font-medium">TAS-{task.id.slice(0, 4).toUpperCase()}</span>
            </div>

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
            </div>

            <TaskDetailView 
                task={task} 
                members={members} 
                activities={activities}
                comments={comments}
                attachments={attachments}
                currentUserId={context.user.id}
            />
        </div>
    );
}
