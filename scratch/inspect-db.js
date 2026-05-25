import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Querying v_catalogo_publico...');
  const { data, error } = await supabase
    .from('v_catalogo_publico')
    .select('*')
    .limit(10);

  if (error) {
    console.error('Error fetching from view:', error);
  } else if (data && data.length > 0) {
    console.log('--- Columns/Keys in v_catalogo_publico ---');
    console.log(Object.keys(data[0]));
    console.log('\n--- Sample Row ---');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('No data found in view v_catalogo_publico');
  }

  // Also query the schema or table list if possible, or query columns of table 'productos'
  // using Postgrest to get column metadata if possible.
  console.log('\nQuerying one row of table "productos" directly...');
  const { data: pData, error: pError } = await supabase
    .from('productos')
    .select('*')
    .limit(1);

  if (pError) {
    console.log('Error querying table "productos" (probably blocked by RLS):', pError.message);
  } else if (pData && pData.length > 0) {
    console.log('--- Columns/Keys in table "productos" ---');
    console.log(Object.keys(pData[0]));
    console.log('\n--- Sample Row from "productos" ---');
    console.log(JSON.stringify(pData[0], null, 2));
  }
}

run();
