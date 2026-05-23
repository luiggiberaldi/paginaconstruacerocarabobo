import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SPANISH_STOPWORDS = new Set([
  'de', 'con', 'para', 'el', 'la', 'los', 'las', 'un', 'una', 'y', 'en', 'del', 'al', 'por', 'sobre'
]);

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/["”']/g, "") // remove inch/quote symbols
    .replace(/pulgadas|pulgada|pulg/g, "") // remove common inch text variants
    .trim();
}

function preprocessQuery(query) {
  let term = query.toLowerCase();
  
  // Replace compound expressions first (written out)
  const replacements = [
    // 1 1/2
    { regex: /\b(?:una?|1)\s+y\s+(?:media|medio)\b/g, replacement: '1 1/2' },
    { regex: /\b(?:pulgada|pulgadas)\s+y\s+(?:media|medio)\b/g, replacement: '1 1/2' },
    { regex: /\b1[-.]1\/2\b/g, replacement: '1 1/2' },
    
    // 2 1/2
    { regex: /\b(?:dos|2)\s+y\s+(?:media|medio)\b/g, replacement: '2 1/2' },
    { regex: /\b2[-.]1\/2\b/g, replacement: '2 1/2' },
    
    // 3 1/2
    { regex: /\b(?:tres|3)\s+y\s+(?:media|medio)\b/g, replacement: '3 1/2' },
    { regex: /\b3[-.]1\/2\b/g, replacement: '3 1/2' },
    
    // Simple fractions (written out)
    { regex: /\b(?:tres\s+octavos?)\b/g, replacement: '3/8' },
    { regex: /\b(?:tres\s+cuartos?)\b/g, replacement: '3/4' },
    { regex: /\b(?:cinco\s+octavos?)\b/g, replacement: '5/8' },
    { regex: /\b(?:siete\s+octavos?)\b/g, replacement: '7/8' },
    { regex: /\b(?:un\s+cuarto|una\s+cuarta)\b/g, replacement: '1/4' },
    { regex: /\b(?:un\s+octavo)\b/g, replacement: '1/8' },
    
    // 16ths (written out)
    { regex: /\b(?:tres\s+dieciseis(?:avos)?)\b/g, replacement: '3/16' },
    { regex: /\b(?:cinco\s+dieciseis(?:avos)?)\b/g, replacement: '5/16' },
    { regex: /\b(?:siete\s+dieciseis(?:avos)?)\b/g, replacement: '7/16' },
    { regex: /\b(?:nueve\s+dieciseis(?:avos)?)\b/g, replacement: '9/16' },
    
    // Media / Medio / Un medio
    { regex: /\b(?:media|medio|un\s+medio)\b/g, replacement: '1/2' }
  ];

  for (const r of replacements) {
    term = term.replace(r.regex, r.replacement);
  }
  
  return term;
}

function tokenize(normalizedQuery) {
  // Matches compound fractions "1 1/2", simple fractions "1/2", or words/numbers
  const regex = /\d+\s+\d+\/\d+|\d+\/\d+|[a-z0-9]+/g;
  const matches = normalizedQuery.match(regex) || [];
  return matches.filter(token => !SPANISH_STOPWORDS.has(token));
}

const VENEZUELAN_SYNONYMS = {
  viga: ['ipn', 'ipe', 'upn', 'hea', 'heb', 'viga', 'he'],
  tubo: ['tubo', 'tuberia', 'tuberias', 'conduven', 'structural', 'conduit'],
  tuberia: ['tubo', 'tuberia', 'tuberias', 'conduven', 'structural', 'conduit'],
  malla: ['truckson', 'trucson', 'trukson', 'malla'],
  truckson: ['malla', 'trucson', 'trukson', 'truckson'],
  trucson: ['malla', 'truckson', 'trukson', 'trucson'],
  trukson: ['malla', 'truckson', 'trucson', 'trukson'],
  lamina: ['lamina', 'chapa', 'plancha', 'techo', 'acerolit', 'zinc', 'losacero'],
  chapa: ['lamina', 'chapa', 'plancha', 'losacero'],
  plancha: ['lamina', 'chapa', 'plancha'],
  zinc: ['lamina', 'techo', 'zinc', 'acerolit'],
  acerolit: ['lamina', 'techo', 'zinc', 'acerolit'],
  cabilla: ['cabilla', 'varilla', 'acero', 'refuerzo', 'estriada'],
  hierro: ['cabilla', 'viga', 'pletina', 'angulo', 'tubo', 'perfil', 'acero'],
  pletina: ['pletina', 'pletinas', 'barra'],
  angulo: ['angulo', 'angulos', 'perfil l'],
};

async function test() {
  const { data: products, error } = await supabase
    .from('v_catalogo_publico')
    .select('id, nombre, categoria, codigo')
    .limit(500);

  if (error) {
    console.error('Error fetching database:', error);
    return;
  }

  const testQueries = [
    'cabilla de media',
    'media',
    'tres octavos',
    'tubo de pulgada y media',
    'tubo de 1 1/2',
    'niple 1/2',
    'viga de tres cuartos', // should probably match viga and 3/4 if any exists
    'losacero',
    'cabilla de 3/8'
  ];

  testQueries.forEach(query => {
    const preprocessed = preprocessQuery(query);
    const normalized = normalizeText(preprocessed);
    const tokens = tokenize(normalized);

    const matches = products.filter(product => {
      const normalizedNombre = normalizeText(product.nombre || '');
      const normalizedCodigo = normalizeText(product.codigo || '');
      const normalizedCategory = normalizeText(product.categoria || '');
      
      const productText = `${normalizedNombre} ${normalizedCodigo} ${normalizedCategory}`;

      return tokens.every(token => {
        if (productText.includes(token)) return true;
        const synonyms = VENEZUELAN_SYNONYMS[token];
        if (synonyms) {
          return synonyms.some(syn => productText.includes(syn));
        }
        return false;
      });
    });

    console.log(`\n========================================`);
    console.log(`QUERY: "${query}"`);
    console.log(`TOKENS:`, tokens);
    console.log(`MATCH COUNT: ${matches.length}`);
    console.log(`SAMPLES (First 5):`);
    matches.slice(0, 5).forEach(m => {
      console.log(` - [${m.categoria}] ${m.nombre}`);
    });
  });
}

test();
