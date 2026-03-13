'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { toast } from 'sonner';

import { forgotPasswordSchema, ForgotPasswordFormData } from '@/features/auth/schemas';
import { forgotPasswordAction } from '@/features/auth/actions';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

export function ForgotPasswordForm() {
    const [isPending, startTransition] = useTransition();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        setError(null);
        startTransition(async () => {
            const result = await forgotPasswordAction(data.email);
            if (result?.error) {
                setError(result.error);
                toast.error(result.error);
            } else {
                setIsSubmitted(true);
                toast.success('Check your email for a password reset link!');
            }
        });
    };

    if (isSubmitted) {
        return (
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
                    <p className="text-sm text-muted-foreground">
                        We&apos;ve sent a password reset link to <span className="font-medium text-primary">{form.getValues('email')}</span>.
                    </p>
                </div>
                <Link 
                    href="/login" 
                    className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
                >
                    Return to login
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email address and we&apos;ll send you a link to reset your password.
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

                    {error && (
                        <div className="text-sm font-medium text-destructive">{error}</div>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Sending link...' : 'Send reset link'}
                    </Button>
                </form>
            </Form>

            <p className="px-8 text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                    Log in
                </Link>
            </p>
        </div>
    );
}
