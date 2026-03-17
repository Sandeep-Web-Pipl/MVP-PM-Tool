import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const adminSupabase = await createAdminClient();
        
        const [anonResult, adminResult] = await Promise.all([
            supabase.from('notifications').select('count', { count: 'exact', head: true }),
            adminSupabase.from('notifications').select('count', { count: 'exact', head: true })
        ]);
        
        return NextResponse.json({
            anon: {
                success: !anonResult.error,
                error: anonResult.error || null,
                count: anonResult.data || 0
            },
            admin: {
                success: !adminResult.error,
                error: adminResult.error || null,
                count: adminResult.data || 0
            },
            env: {
                url: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0] + '...',
                has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        });
    } catch (err: any) {
        console.error('DB Test Error:', err);
        return NextResponse.json({ success: false, error: err.message, stack: err.stack }, { status: 500 });
    }
}
