import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Json } from '@/types/database.types';

export async function logActivity(
    supabase: SupabaseClient<Database>,
    {
        organizationId,
        entityType,
        entityId,
        action,
        actorId,
        metadata = {},
    }: {
        organizationId: string;
        entityType: string;
        entityId: string;
        action: string;
        actorId?: string;
        metadata?: Json;
    }
) {
    const { error } = await supabase.from('activity_logs').insert({
        organization_id: organizationId,
        entity_type: entityType,
        entity_id: entityId,
        action: action,
        actor_id: actorId,
        metadata: metadata,
    });

    if (error) {
        console.error('Failed to log activity:', error);
    }
}
