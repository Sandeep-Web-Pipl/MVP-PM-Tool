'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-in fade-in duration-500">
            <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-500 max-w-md mb-8">
                We encountered an unexpected error while loading this page. Our team has been notified.
            </p>
            <div className="flex gap-4">
                <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/dashboard'}
                    className="border-slate-200 hover:bg-slate-50"
                >
                    Back to Dashboard
                </Button>
                <Button 
                    onClick={() => reset()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 gap-2"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Try Again
                </Button>
            </div>
        </div>
    );
}
