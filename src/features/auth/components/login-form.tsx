'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { toast } from 'sonner';

import { loginSchema, LoginFormData } from '@/features/auth/schemas';
import { loginAction } from '@/features/auth/actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

export function LoginForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginFormData) => {
        setError(null);
        startTransition(async () => {
            const result = await loginAction(data);
            if (result?.error) {
                setError(result.error);
                toast.error(result.error);
            } else {
                toast.success('Successfully logged in!');
            }
        });
    };

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email and password to access your account
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="name@example.com" {...field} disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Password</FormLabel>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {error && (
                        <div className="text-sm font-medium text-destructive">{error}</div>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Logging in...' : 'Log In'}
                    </Button>
                </form>
            </Form>

            <p className="px-8 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
                    Sign up
                </Link>
            </p>
        </div>
    );
}
