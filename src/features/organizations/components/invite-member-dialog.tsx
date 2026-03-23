'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inviteMemberSchema, InviteMemberFormData } from '../schemas';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { inviteMemberAction } from '../actions';
import { toast } from 'sonner';

interface InviteMemberDialogProps {
    organizationId: string;
}

export function InviteMemberDialog({ organizationId }: InviteMemberDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<InviteMemberFormData>({
        resolver: zodResolver(inviteMemberSchema),
        defaultValues: {
            email: '',
            role: 'member',
        },
    });

    async function onSubmit(data: InviteMemberFormData) {
        startTransition(async () => {
            const result = await inviteMemberAction(organizationId, data);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success('Member invited successfully');
            setIsOpen(false);
            form.reset();
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <UserPlus className="h-4 w-4" />
                Invite Member
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                        Send an invitation to join your organization.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="member">Member</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col gap-2 pt-2 border-t mt-4">
                            <p className="text-xs text-muted-foreground">
                                No email server attached yet? Copy the signup link to share manually:
                            </p>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="w-full gap-2 transition-all"
                                onClick={async (e) => {
                                    const signupUrl = `${window.location.origin}/signup`;
                                    const btn = e.currentTarget;
                                    const originalText = btn.innerHTML;

                                    try {
                                        if (navigator.clipboard && window.isSecureContext) {
                                            await navigator.clipboard.writeText(signupUrl);
                                        } else {
                                            // Fallback for non-secure or older browsers
                                            const textArea = document.createElement("textarea");
                                            textArea.value = signupUrl;
                                            document.body.appendChild(textArea);
                                            textArea.select();
                                            document.execCommand("copy");
                                            document.body.removeChild(textArea);
                                        }

                                        toast.success('Signup link copied!');
                                        btn.innerHTML = 'Copied!';
                                        setTimeout(() => {
                                            btn.innerHTML = originalText;
                                        }, 2000);
                                    } catch (err) {
                                        toast.error('Failed to copy link. Please copy it manually.');
                                    }
                                }}
                            >
                                <UserPlus className="h-4 w-4" />
                                Copy Signup Link
                            </Button>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {isPending ? 'Sending...' : 'Send Invitation'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
