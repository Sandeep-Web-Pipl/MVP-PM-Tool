import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('notifications').select('count', { count: 'exact', head: true });
        
        return NextResponse.json({
            success: !error,
            error: error || null,
            count: data || 0,
            url: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0] + '...'
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
