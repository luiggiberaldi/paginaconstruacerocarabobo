import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const possibleColumns = [
  'especificaciones',
  'especificaciones_tecnicas',
  'ficha_tecnica',
  'specs',
  'metadata',
  'detalles',
  'atributos',
  'caracteristicas'
];

async function run() {
  console.log('Testing possible specs columns on v_catalogo_publico...');
  for (const col of possibleColumns) {
    const { data, error } = await supabase
      .from('v_catalogo_publico')
      .select(`id, ${col}`)
      .limit(1);

    if (error) {
      console.log(`❌ Column "${col}" does NOT exist.`);
    } else {
      console.log(`✅ Column "${col}" EXISTS! Sample:`, data);
    }
  }
}

run();
