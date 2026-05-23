import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Connecting to Supabase...');
  
  // Try querying a single row from v_catalogo_publico
  const { data, error } = await supabase
    .from('v_catalogo_publico')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching from v_catalogo_publico:', error.message);
  } else {
    console.log('SUCCESS: Fetched from v_catalogo_publico!');
    console.log('Sample row structure:', JSON.stringify(data[0], null, 2));
  }

  // Also see if we can query the 'productos' table directly to see if stock_actual is accessible or blocked
  const { data: prodData, error: prodError } = await supabase
    .from('productos')
    .select('id, codigo, nombre, stock_actual, precio_usd')
    .limit(1);

  if (prodError) {
    console.log('Note: Direct query to "productos" failed (as expected due to RLS):', prodError.message);
  } else {
    console.log('SUCCESS: Direct query to "productos" succeeded!:', JSON.stringify(prodData[0], null, 2));
  }
}

main();
