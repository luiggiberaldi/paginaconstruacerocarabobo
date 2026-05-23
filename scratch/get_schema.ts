import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env');
  process.exit(1);
}

async function main() {
  console.log('Fetching OpenAPI spec from Supabase using native fetch...');
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json() as any;
    console.log('SUCCESS!');
    const paths = Object.keys(data.paths || {});
    console.log('Exposed endpoints/tables/views:');
    paths.forEach(p => console.log(' -', p));

    // Let's see if we can find definitions for products or items
    if (data.definitions) {
      console.log('\nExposed schema definitions:');
      Object.keys(data.definitions).forEach(def => {
        console.log(`\nDefinition: ${def}`);
        const properties = Object.keys(data.definitions[def].properties || {});
        console.log('Properties:', properties.join(', '));
      });
    }

  } catch (error: any) {
    console.error('Error fetching OpenAPI spec:', error.message);
  }
}

main();
