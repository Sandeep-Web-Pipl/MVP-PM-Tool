import fs from 'fs';
import path from 'path';

async function run() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found');
    process.exit(1);
  }

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
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Missing URL or Key in .env.local');
    process.exit(1);
  }

  console.log('Testing Supabase URL:', url);

  async function testTable(tableName, useAdmin = false) {
    const apiKey = useAdmin ? adminKey : key;
    if (!apiKey) {
      console.log(`Skipping admin test for ${tableName} (no admin key)`);
      return;
    }

    console.log(`Checking ${tableName} (Admin: ${useAdmin})...`);
    try {
      const response = await fetch(`${url}/rest/v1/${tableName}?select=count&limit=1`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Prefer': 'count=exact'
        }
      });
      
      const status = response.status;
      const data = await response.json();
      
      if (status >= 200 && status < 300) {
        console.log(`✅ ${tableName} reachable. Status: ${status}`);
      } else {
        console.log(`❌ ${tableName} error. Status: ${status}, Message:`, JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error(`Error testing ${tableName}:`, err.message);
    }
  }

  console.log('\n--- Checking Tables ---');
  await testTable('profiles');
  await testTable('notifications');
  await testTable('notifications', true); // Test with admin key

  console.log('\n--- Introspecting Schema Cache ---');
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    const schema = await response.json();
    const tables = schema.definitions ? Object.keys(schema.definitions) : [];
    console.log('Tables in PostgREST cache:', tables);
    
    if (tables.includes('notifications')) {
      console.log('✅ notifications IS in the cache.');
    } else {
      console.log('❌ notifications IS NOT in the cache.');
    }
  } catch (err) {
    console.error('Introspection failed:', err.message);
  }
}

run();
