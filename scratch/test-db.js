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
  const { data, error } = await supabase
    .from('v_catalogo_publico')
    .select('categoria, nombre')
    .limit(500);

  if (error) {
    console.error(error);
    return;
  }

  const categories = {};
  data.forEach(p => {
    categories[p.categoria] = (categories[p.categoria] || 0) + 1;
  });

  console.log('Categories:', categories);
  console.log('Sample products:', data.slice(0, 25));
}

run();
