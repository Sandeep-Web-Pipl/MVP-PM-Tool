import { createClient } from '@/lib/supabase/server';
import { getProjectById } from '@/features/projects/queries';
import { getCurrentOrganization } from '@/lib/auth/get-organization';
import { KanbanBoard } from '@/features/tasks/components/kanban-board';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ListIcon } from 'lucide-react';

// Re-using the query from projects/queries but need to make sure it includes assignee data
// Actually taskId query in tasks/queries is better for this
import { getTasksByProject as getTasksDetail } from '@/features/tasks/queries';

interface KanbanPageProps {
    params: {
        projectId: string;
    };
}

export default async function KanbanPage({ params }: KanbanPageProps) {
    const { projectId } = await params;
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return null;

    const [project, tasks] = await Promise.all([
        getProjectById(supabase, projectId),
        getTasksDetail(supabase, projectId),
    ]);

    if (!project) return notFound();

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Link href="/projects" className="hover:text-foreground">Projects</Link>
                        <span>/</span>
                        <Link href={`/projects/${projectId}`} className="hover:text-foreground">{project.name}</Link>
                        <span>/</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Board</h1>
                </div>
                <div className="flex gap-2">
                    <Link href={`/projects/${projectId}`}>
                        <Button variant="outline" size="sm">
                            <ListIcon className="mr-2 h-4 w-4" />
                            List View
                        </Button>
                    </Link>
                </div>
            </div>

            <KanbanBoard projectId={projectId} initialTasks={tasks} />
        </div>
    );
}
