'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateProfileAction } from '@/features/auth/actions';
import { toast } from 'sonner';

interface ProfileSettingsFormProps {
    initialData: {
        fullName: string;
        email: string;
    };
}

export function ProfileSettingsForm({ initialData }: ProfileSettingsFormProps) {
    const [fullName, setFullName] = useState(initialData.fullName);
    const [isPending, startTransition] = useTransition();

    async function handleSave() {
        if (!fullName.trim()) {
            toast.error('Full name is required');
            return;
        }

        startTransition(async () => {
            const result = await updateProfileAction({ fullName });
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Profile updated successfully');
            }
        });
    }

    return (
        <Card className="border-none shadow-md">
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and how others see you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={initialData.email} disabled className="bg-slate-50" />
                    <p className="text-xs text-slate-400">Email cannot be changed here.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isPending || fullName === initialData.fullName}
                    className="bg-[#7C3AED] hover:bg-[#6D28D9]"
                >
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </CardContent>
        </Card>
    );
}
