import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 rounded-lg bg-slate-200" />
                    <Skeleton className="h-4 w-96 rounded-lg bg-slate-100" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg bg-slate-200" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-6 rounded-2xl border bg-white shadow-sm space-y-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-5 w-20 rounded bg-slate-100" />
                            <Skeleton className="h-5 w-5 rounded-full bg-slate-100" />
                        </div>
                        <Skeleton className="h-6 w-full rounded bg-slate-200" />
                        <Skeleton className="h-4 w-2/3 rounded bg-slate-100" />
                        <div className="pt-4 flex justify-between">
                            <Skeleton className="h-3 w-24 rounded bg-slate-50" />
                            <Skeleton className="h-3 w-16 rounded bg-slate-50" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
