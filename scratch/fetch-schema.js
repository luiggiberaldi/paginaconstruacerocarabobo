import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Credentials missing');
  process.exit(1);
}

async function run() {
  const restUrl = `${supabaseUrl}/rest/v1/`;
  console.log('Fetching OpenAPI schema from Postgrest API at:', restUrl);

  const res = await fetch(restUrl, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  });

  if (!res.ok) {
    console.error('Failed to fetch schema:', res.status, res.statusText);
    const text = await res.text();
    console.error(text);
    return;
  }

  const schema = await res.json();
  
  console.log('--- Paths in API ---');
  console.log(Object.keys(schema.paths));

  console.log('\n--- Definition for v_catalogo_publico ---');
  const viewDef = schema.definitions?.v_catalogo_publico;
  if (viewDef) {
    console.log(JSON.stringify(viewDef, null, 2));
  } else {
    console.log('v_catalogo_publico definition not found in schema.');
  }

  console.log('\n--- Definition for productos ---');
  const prodDef = schema.definitions?.productos;
  if (prodDef) {
    console.log(JSON.stringify(prodDef, null, 2));
  } else {
    console.log('productos definition not found in schema.');
  }
}

run().catch(console.error);
