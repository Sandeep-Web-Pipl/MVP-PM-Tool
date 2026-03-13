'use client';

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    actionLabel?: string;
    onAction?: () => void;
    actionHref?: string;
}

export function EmptyState({
    title,
    description,
    icon: Icon,
    actionLabel,
    onAction,
    actionHref,
}: EmptyStateProps) {
    const ActionButton = () => (
        <Button 
            onClick={onAction}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100"
        >
            {actionLabel}
        </Button>
    )

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-200 min-h-[300px] animate-in fade-in zoom-in duration-300">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 max-w-sm mb-6">{description}</p>
            {actionLabel && (
                <>
                    {actionHref ? (
                        <Link href={actionHref}>
                            <ActionButton />
                        </Link>
                    ) : onAction ? (
                        <ActionButton />
                    ) : null}
                </>
            )}
        </div>
    );
}
