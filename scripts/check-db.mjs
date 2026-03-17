import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking tables in public schema for:', supabaseUrl);
  
  const { data, error } = await supabase
    .rpc('get_tables', {}, { head: false })
    .select('*')
    .catch(async () => {
      // If RPC doesn't exist, try raw query through a common table
      return supabase.from('profiles').select('id').limit(1);
    });

  // Fallback: Query information_schema if possible (might require a custom function)
  // Let's try a direct query to the notifications table first to see the exact error again
  console.log('--- Attempting to query notifications table ---');
  const { data: nData, error: nError } = await supabase
    .from('notifications')
    .select('id')
    .limit(1);

  if (nError) {
    console.error('Notifications Error:', JSON.stringify(nError, null, 2));
  } else {
    console.log('Notifications Table Found! Data count:', nData?.length);
  }

  console.log('--- Checking all tables via postgrest introspection ---');
  // PostgREST introspection
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const schema = await response.json();
    const tableNames = schema.definitions ? Object.keys(schema.definitions) : [];
    console.log('Tables found in schema cache:', tableNames);
    
    if (tableNames.includes('notifications')) {
      console.log('SUCCESS: notifications IS in the cache definitions.');
    } else {
      console.log('FAILURE: notifications IS NOT in the cache definitions.');
    }
  } catch (err) {
    console.error('Introspection failed:', err);
  }
}

checkSchema();
