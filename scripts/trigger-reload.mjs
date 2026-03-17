import fs from 'fs';
import path from 'path';

async function run() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const adminKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !adminKey) {
    console.error('Missing URL or Admin Key in .env.local');
    process.exit(1);
  }

  console.log('--- Triggering Schema Reload ---');
  try {
    const response = await fetch(`${url}/rest/v1/rpc/reload_schema_cache`, {
      method: 'POST',
      headers: {
        'apikey': adminKey,
        'Authorization': `Bearer ${adminKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Reload triggered successfully.');
    } else {
      const err = await response.json();
      console.error('❌ Reload failed:', JSON.stringify(err, null, 2));
    }
  } catch (err) {
    console.error('Reload Error:', err.message);
  }

  console.log('Waiting 5 seconds for cache to update...');
  await new Promise(r => setTimeout(r, 5000));

  console.log('\n--- Verifying Schema Cache ---');
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    const schema = await response.json();
    const tables = schema.definitions ? Object.keys(schema.definitions) : [];
    console.log('Tables in PostgREST cache:', tables);
    
    if (tables.includes('notifications')) {
      console.log('✅ SUCCESS: notifications is back in the cache!');
    } else {
      console.log('❌ FAILURE: notifications is still missing.');
    }
  } catch (err) {
    console.error('Verification failed:', err.message);
  }
}

run();
