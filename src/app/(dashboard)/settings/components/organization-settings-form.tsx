'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateOrganizationAction } from '@/features/organizations/actions';
import { toast } from 'sonner';

interface OrganizationSettingsFormProps {
    orgId: string;
    initialData: {
        name: string;
        slug: string;
    };
}

export function OrganizationSettingsForm({ orgId, initialData }: OrganizationSettingsFormProps) {
    const [name, setName] = useState(initialData.name);
    const [slug, setSlug] = useState(initialData.slug);
    const [isPending, startTransition] = useTransition();

    async function handleUpdate() {
        if (!name.trim() || !slug.trim()) {
            toast.error('Name and slug are required');
            return;
        }

        startTransition(async () => {
            const result = await updateOrganizationAction(orgId, { name, slug });
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Organization updated successfully');
            }
        });
    }

    const hasChanges = name !== initialData.name || slug !== initialData.slug;

    return (
        <Card className="border-none shadow-md">
            <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>Configure your organization&apos;s identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input 
                        id="org-name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="org-slug">Slug</Label>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">pm-tool.com/</span>
                        <Input 
                            id="org-slug" 
                            value={slug} 
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        />
                    </div>
                </div>
                <Button 
                    onClick={handleUpdate} 
                    disabled={isPending || !hasChanges}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    {isPending ? 'Updating...' : 'Update Organization'}
                </Button>
            </CardContent>
        </Card>
    );
}
