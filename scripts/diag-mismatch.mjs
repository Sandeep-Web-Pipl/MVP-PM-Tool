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

  // THE KEY FINDING: CLI Project Reference
  const cliProjectPath = path.resolve(process.cwd(), 'supabase/.temp/project-ref');
  const cliProjectRef = fs.readFileSync(cliProjectPath, 'utf8').trim();

  const url = `https://${cliProjectRef}.supabase.co`;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // This might be wrong if it belongs to the other project!

  console.log('--- DIAGNOSING MISMASH ---');
  console.log('Project in .env.local:', env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Project in CLI link:', url);
  console.log('---------------------------');

  console.log('\n--- Checking CLI Project Schema ---');
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    
    if (response.status === 401 || response.status === 403) {
      console.log('❌ Auth Failed. The Anon Key in .env.local likely DOES NOT work for the CLI project.');
    } else {
      const schema = await response.json();
      const tables = schema.definitions ? Object.keys(schema.definitions) : [];
      console.log('Tables in CLI project cache:', tables);
      if (tables.includes('notifications')) {
        console.log('✅ Found notifications in CLI project!');
      }
    }
  } catch (err) {
    console.error('Introspection failed:', err.message);
  }
}

run();
