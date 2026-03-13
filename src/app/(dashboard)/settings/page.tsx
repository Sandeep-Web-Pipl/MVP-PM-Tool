import { createClient } from '@/lib/supabase/server';
import { getCurrentOrganization } from '@/lib/auth/get-organization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, Building, Bell } from 'lucide-react';

import { ProfileSettingsForm } from './components/profile-settings-form';
import { OrganizationSettingsForm } from './components/organization-settings-form';

export const metadata = {
    title: 'Settings | PM Tool',
    description: 'Manage your profile and organization settings.',
};

export default async function SettingsPage() {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return null;

    const { user, organization } = context;

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your account and organization preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-slate-100/50 p-1 rounded-xl">
                    <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="organization" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                        <Building className="h-4 w-4" />
                        Organization
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <ProfileSettingsForm 
                        initialData={{
                            fullName: user.user_metadata?.full_name || '',
                            email: user.email || '',
                        }}
                    />
                </TabsContent>

                <TabsContent value="organization" className="space-y-4">
                    <OrganizationSettingsForm 
                        orgId={organization?.id || ''}
                        initialData={{
                            name: organization?.name || '',
                            slug: organization?.slug || '',
                        }}
                    />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Control which updates you receive.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-sm text-slate-500">Receive summaries of task activity via email.</p>
                                </div>
                                <div className="h-6 w-10 bg-slate-200 rounded-full relative">
                                    <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full transition-all" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">In-App Alerts</Label>
                                    <p className="text-sm text-slate-500">Show notification dot for new activities.</p>
                                </div>
                                <div className="h-6 w-10 bg-indigo-600 rounded-full relative">
                                    <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full transition-all" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
