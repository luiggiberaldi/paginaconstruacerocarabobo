import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  // We try to query columns that might not exist. If they don't, Supabase/Postgrest will error and list valid columns.
  console.log('Querying non-existent column to trigger Postgrest validation...');
  const { data, error } = await supabase
    .from('v_catalogo_publico')
    .select('id, non_existent_column_test');

  if (error) {
    console.log('Error message:', error.message);
    console.log('Error details:', error.details);
    console.log('Error hint:', error.hint);
  } else {
    console.log('No error! Column non_existent_column_test somehow exists?', data);
  }
}

run();
