import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export async function createNotification(
    supabase: SupabaseClient<Database>,
    {
        organizationId,
        userId,
        type,
        title,
        body,
        entityType,
        entityId,
    }: {
        organizationId: string;
        userId: string;
        type: string;
        title: string;
        body: string;
        entityType: string;
        entityId: string;
    }
) {
    const { error } = await supabase.from('notifications').insert({
        organization_id: organizationId,
        user_id: userId,
        type,
        title,
        body,
        entity_type: entityType,
        entity_id: entityId,
        is_read: false,
    });

    if (error) {
        console.error('Failed to create notification:', error);
    }
}
