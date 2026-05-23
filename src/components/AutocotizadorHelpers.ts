export interface DbProduct {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  descripcion: string | null;
  unidad: string;
  precio_usd: number;
  stock_actual: number;
  imagen_url: string | null;
  activo: boolean;
}

// Premium realistic fallback products in case Supabase is down or not connected
export const fallbackProducts: DbProduct[] = [
  {
    id: 'f1',
    codigo: 'CAB-1022',
    nombre: 'CABILLA CORRUGADA DE REFUERZO 1/2" (12m)',
    categoria: 'CABILLAS',
    descripcion: 'Cabilla corrugada grado 60 de máxima elasticidad para vigas y fundaciones.',
    unidad: 'und',
    precio_usd: 12.50,
    stock_actual: 120,
    imagen_url: null,
    activo: true
  },
  {
    id: 'f2',
    codigo: 'CAB-1038',
    nombre: 'CABILLA CORRUGADA DE REFUERZO 3/8" (12m)',
    categoria: 'CABILLAS',
    descripcion: 'Cabilla corrugada grado 60 para estribos y losas nervadas.',
    unidad: 'und',
    precio_usd: 8.75,
    stock_actual: 85,
    imagen_url: null,
    activo: true
  },
  {
    id: 'f3',
    codigo: 'VIG-IPN120',
    nombre: 'VIGA IPN 120 (6m)',
    categoria: 'VIGAS / PERFILES',
    descripcion: 'Viga de acero estructural laminada en caliente. Medidas estándar de 6 metros.',
    unidad: 'und',
    precio_usd: 88.00,
    stock_actual: 15,
    imagen_url: null,
    activo: true
  },
  {
    id: 'f4',
    codigo: 'TUB-STR2X1',
    nombre: 'TUBO ESTRUCTURAL CONDUVEN 2" X 1" (6m)',
    categoria: 'TUBERIAS',
    descripcion: 'Tubo de acero estructural Conduven de 2x1 pulgadas para herrería y soportes.',
    unidad: 'und',
    precio_usd: 14.20,
    stock_actual: 45,
    imagen_url: null,
    activo: true
  },
  {
    id: 'f5',
    codigo: 'CEM-PORT1',
    nombre: 'CEMENTO PORTLAND TIPO I (SACO 42.5 KG)',
    categoria: 'CEMENTO',
    descripcion: 'Cemento gris Portland de alta resistencia inicial para concretos estructurales.',
    unidad: 'saco',
    precio_usd: 7.20,
    stock_actual: 350,
    imagen_url: null,
    activo: true
  },
  {
    id: 'f6',
    codigo: 'MAL-TRU44',
    nombre: 'MALLA TRUCSON ELECTROSOLDADA 4x4 (hoja 2x3m)',
    categoria: 'MALLAS',
    descripcion: 'Malla electrosoldada para refuerzo de losas de concreto de bajo espesor.',
    unidad: 'hoja',
    precio_usd: 18.50,
    stock_actual: 60,
    imagen_url: null,
    activo: true
  }
];

// Helper to provide realistic technical specs for local spec sheets
export function getProductSpecs(product: DbProduct) {
  const name = product.nombre.toLowerCase();
  if (name.includes('cabilla')) {
    return {
      'Norma Técnica': 'ASTM A615 / COVENIN 316',
      'Grado de Acero': 'Grado 60 (Alta Ductilidad)',
      'Largo Estándar': '12 metros',
      'Resistencia Fluencia': '≥ 4.200 kg/cm²',
      'Uso Recomendado': 'Refuerzo de vigas, columnas y fundaciones'
    };
  } else if (name.includes('viga') || name.includes('ipn') || name.includes('upn')) {
    return {
      'Norma Técnica': 'ASTM A36 / COVENIN 1148',
      'Material': 'Acero Laminado en Caliente',
      'Largo Estándar': '6 metros',
      'Resistencia Fluencia': '≥ 2.530 kg/cm²',
      'Uso Recomendado': 'Estructuras pesadas, pórticos y vigas de carga'
    };
  } else if (name.includes('tubo') || name.includes('conduven')) {
    return {
      'Norma Técnica': 'ASTM A500 Grado B / COVENIN 1324',
      'Espesor Estimado': '2.25 mm a 3.00 mm',
      'Largo Estándar': '6 metros',
      'Soldabilidad': 'Excelente soldabilidad por arco y TIG',
      'Uso Recomendado': 'Correas de soporte, herrería pesada e infraestructura'
    };
  } else if (name.includes('cemento')) {
    return {
      'Tipo de Cemento': 'Gris Portland Estructural Tipo I',
      'Norma Técnica': 'ASTM C150 / COVENIN 28',
      'Presentación': 'Sacos sellados de 42.5 kg',
      'Resistencia a 28d': '≥ 28 MPa',
      'Uso Recomendado': 'Vaciado de losas, vigas y mezclas estructurales'
    };
  } else if (name.includes('malla') || name.includes('trucson')) {
    return {
      'Norma Técnica': 'ASTM A1064 / COVENIN 1022',
      'Formato': 'Hoja plana 2.00m x 3.00m',
      'Alambre': 'Ø 4.0 mm - 5.0 mm electrosoldado',
      'Espaciamiento': '10cm x 10cm o 15cm x 15cm',
      'Uso Recomendado': 'Refuerzo de losas de piso y aceras peatonales'
    };
  }
  return {
    'Material': 'Acero Estructural Certificado',
    'Norma Técnica': 'Normas COVENIN / FONDONORMA',
    'Condición': 'Stock inmediato en patio de despacho',
    'Uso Recomendado': 'Aplicaciones civiles y metalmecánicas generales'
  };
}

export function getCategoryLabel(cat: string): string {
  const lower = cat.toLowerCase();
  if (lower.includes('cabilla'))                    return 'Cabillas';
  if (lower.includes('viga') || lower.includes('perfil')) return 'Vigas y Perfiles';
  if (lower.includes('tub'))                        return 'Tuberías';
  if (lower.includes('cement'))                     return 'Cemento';
  if (lower.includes('malla'))                      return 'Mallas';
  if (lower.includes('alambre'))                    return 'Alambres';
  if (lower.includes('accesorio'))                  return 'Accesorios';
  if (lower.includes('lamina') || lower.includes('lámina')) return 'Láminas';
  // Fallback: capitalize first letter of each word
  return cat.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

/** @deprecated use getCategoryLabel */
export function getCategoryLabelWithEmoji(cat: string): string {
  return getCategoryLabel(cat);
}
