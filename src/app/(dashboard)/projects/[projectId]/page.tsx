import { createClient } from '@/lib/supabase/server';
import { getProjectById } from '@/features/projects/queries';
import { getTasksByProject } from '@/features/tasks/queries';
import { getCurrentOrganization } from '@/lib/auth/get-organization';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskList } from '@/features/tasks/components/task-list';
import { TaskForm } from '@/features/tasks/components/task-form';
import { ActivityTimeline } from '@/features/activity/components/activity-timeline';
import { getProjectActivity } from '@/features/activity/queries';

interface ProjectDetailPageProps {
    params: {
        projectId: string;
    };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
    const { projectId } = await params;
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return null;

    const [project, tasks, activities] = await Promise.all([
        getProjectById(supabase, projectId),
        getTasksByProject(supabase, projectId),
        getProjectActivity(supabase, projectId)
    ]);

    if (!project) return notFound();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/projects" className="text-xs text-muted-foreground hover:underline">Projects</Link>
                        <span className="text-xs text-muted-foreground">/</span>
                        <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="ml-2 uppercase text-[10px]">
                            {project.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.description || 'No description provided.'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/projects/${projectId}/kanban`}>
                        <Button variant="outline" size="sm">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Board
                        </Button>
                    </Link>
                    <Dialog>
                        <DialogTrigger
                            render={
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Task
                                </Button>
                            }
                        />
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create Task</DialogTitle>
                                <DialogDescription>
                                    Add a new task to {project.name}.
                                </DialogDescription>
                            </DialogHeader>
                            <TaskForm projectId={projectId} />
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon-sm">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                </TabsList>
                <div className="mt-4">
                    <TabsContent value="tasks">
                        <TaskList tasks={tasks} />
                    </TabsContent>
                    <TabsContent value="activity">
                        <div className="bg-card border rounded-xl p-6">
                            <ActivityTimeline activities={activities} />
                        </div>
                    </TabsContent>
                    <TabsContent value="members">
                        <div className="bg-card border rounded-xl p-6">
                            <p className="text-sm text-muted-foreground italic">Member management coming soon.</p>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
