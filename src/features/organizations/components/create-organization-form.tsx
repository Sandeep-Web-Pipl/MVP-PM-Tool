'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { createOrganizationSchema, CreateOrganizationFormData } from '@/features/organizations/schemas';
import { createOrganizationAction } from '@/features/organizations/actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { ControllerRenderProps } from 'react-hook-form';

export function CreateOrganizationForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<CreateOrganizationFormData>({
        resolver: zodResolver(createOrganizationSchema),
        defaultValues: {
            name: '',
            slug: '',
        },
    });

    const onSubmit = (data: CreateOrganizationFormData) => {
        setError(null);
        startTransition(async () => {
            const result = await createOrganizationAction(data);
            if (result?.error) {
                setError(result.error);
                toast.error(result.error);
            } else {
                toast.success('Organization created successfully!');
            }
        });
    };

    // Sync slug with name if slug is untouched
    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        form.setValue('name', value);

        // Simple slugification
        const slug = value
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        form.setValue('slug', slug);
    };

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Create your organization</h1>
                <p className="text-sm text-muted-foreground">
                    Every project belongs to an organization. Start by creating your own.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }: { field: ControllerRenderProps<CreateOrganizationFormData, 'name'> }) => (
                            <FormItem>
                                <FormLabel>Organization Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Acme Corp"
                                        {...field}
                                        onChange={onNameChange}
                                        disabled={isPending}
                                    />
                                </FormControl>
                                <FormDescription>
                                    This is your team or company name.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }: { field: ControllerRenderProps<CreateOrganizationFormData, 'slug'> }) => (
                            <FormItem>
                                <FormLabel>URL Slug</FormLabel>
                                <FormControl>
                                    <div className="flex items-center">
                                        <span className="mr-2 text-sm text-muted-foreground font-mono">/org/</span>
                                        <Input placeholder="acme-corp" {...field} disabled={isPending} />
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    A unique identifier for your organization URL.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {error && (
                        <div className="text-sm font-medium text-destructive">{error}</div>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Creating...' : 'Create Organization'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
