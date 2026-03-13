import { CreateProjectForm } from '@/features/projects/components/create-project-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/projects">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Project</h1>
                    <p className="text-muted-foreground">
                        Define a new project for your team.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <CreateProjectForm />
            </div>
        </div>
    );
}
