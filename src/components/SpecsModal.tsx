import { DbProduct, getCategoryLabel, getProductSpecs } from './AutocotizadorHelpers';

interface SpecsModalProps {
  product: DbProduct | null;
  isAlreadyInCart: boolean;
  onClose: () => void;
  onAddToCart: () => void;
}

// Diccionario de normalización y traducción de claves técnicas del frontend
const labelTranslations: Record<string, string> = {
  'Norma Técnica': 'Norma Técnica (COVENIN / ASTM)',
  'norma_tecnica': 'Norma Técnica (COVENIN / ASTM)',
  'Grado de Acero': 'Grado de Acero Estructural',
  'grado_de_acero': 'Grado de Acero Estructural',
  'Largo Estándar': 'Largo de Suministro',
  'largo_estandar': 'Largo de Suministro',
  'Resistencia Fluencia': 'Resistencia Fluencia (Límite Elástico)',
  'resistencia_fluencia': 'Resistencia Fluencia (Límite Elástico)',
  'Uso Recomendado': 'Aplicación Recomendada B2B',
  'uso_recomendado': 'Aplicación Recomendada B2B',
  'Material': 'Composición del Material',
  'material': 'Composición del Material',
  'Soldabilidad': 'Grado de Soldabilidad',
  'soldabilidad': 'Grado de Soldabilidad',
  'Espesor Estimado': 'Espesor de Pared Nominal',
  'espesor_estimado': 'Espesor de Pared Nominal',
  'Tipo de Cemento': 'Tipo de Cemento Gris',
  'tipo_cemento': 'Tipo de Cemento Gris',
  'Resistencia a 28d': 'Resistencia a la Compresión (28 días)',
  'resistencia_28d': 'Resistencia a la Compresión (28 días)',
  'Formatos': 'Formato / Dimensiones de Hoja',
  'formato': 'Formato / Dimensiones de Hoja',
  'Alambre': 'Calibre / Diámetro del Alambre',
  'alambre': 'Calibre / Diámetro del Alambre',
  'Espaciamiento': 'Espaciamiento de Cuadrícula',
  'espaciamiento': 'Espaciamiento de Cuadrícula',
  'Condición': 'Disponibilidad de Despacho',
  'condicion': 'Disponibilidad de Despacho',
  'Procedencia / Marca': 'Marca / Certificación de Patio',
  'marca': 'Marca / Certificación de Patio'
};

// Función para formatear las etiquetas de manera premium y comercial
const getPrettyLabel = (key: string): string => {
  return labelTranslations[key] || labelTranslations[key.toLowerCase()] || key;
};

// SVG Inline Category Icons for B2B industrial catalog look
const getCategoryIcon = (category: string) => {
  const lower = category.toLowerCase();
  
  if (lower.includes('cabilla')) {
    return (
      <svg className="specs-category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Rebar textured steel icon */}
        <rect x="9" y="2" width="6" height="20" rx="1" strokeWidth="2.5" />
        <path d="M9 6h6M9 10h6M9 14h6M9 18h6" strokeWidth="2" opacity="0.8" />
        <path d="M15 4l-6 4M15 9l-6 4M15 14l-6 4" strokeWidth="1.5" strokeDasharray="2 1" />
      </svg>
    );
  }
  
  if (lower.includes('viga') || lower.includes('perfil')) {
    return (
      <svg className="specs-category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Structural I-Beam profile icon */}
        <path d="M4 3h16M4 21h16" strokeWidth="2.5" />
        <path d="M9 3v18M15 3v18" strokeWidth="2" />
        <rect x="9" y="10" width="6" height="4" fill="currentColor" fillOpacity="0.1" />
      </svg>
    );
  }
  
  if (lower.includes('tub')) {
    return (
      <svg className="specs-category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Cylinder / Industrial pipe section icon */}
        <ellipse cx="12" cy="6" rx="8" ry="3.5" strokeWidth="2.2" />
        <path d="M4 6v12c0 2 3.5 3.5 8 3.5s8-1.5 8-3.5V6" strokeWidth="2.2" />
        <ellipse cx="12" cy="6" rx="4" ry="1.8" strokeWidth="1.2" opacity="0.6" />
      </svg>
    );
  }
  
  if (lower.includes('cement')) {
    return (
      <svg className="specs-category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Bag / Portland Sack icon */}
        <rect x="4" y="3" width="16" height="18" rx="3" strokeWidth="2.2" />
        <path d="M4 8h16M4 16h16" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.15" />
      </svg>
    );
  }
  
  if (lower.includes('malla')) {
    return (
      <svg className="specs-category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Electrosoldered Grid/Mesh icon */}
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" strokeWidth="1.8" />
      </svg>
    );
  }

  if (lower.includes('lamina') || lower.includes('lámina')) {
    return (
      <svg className="specs-category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Industrial sheet metal icon */}
        <path d="M2 17l10 4 10-4M2 12l10 4 10-4" strokeWidth="1.8" opacity="0.7" />
        <polygon points="12 2 22 6 12 10 2 6" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
      </svg>
    );
  }
  
  // Default general industrial icon (Quality certified seal)
  return (
    <svg className="specs-category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" strokeWidth="2.2" />
      <path d="M12 8v4l3 3M8 12h8" strokeWidth="1.8" opacity="0.8" />
    </svg>
  );
};

export function SpecsModal({
  product,
  isAlreadyInCart,
  onClose,
  onAddToCart,
}: SpecsModalProps) {
  if (!product) return null;
  const originalSpecs = getProductSpecs(product);

  // 1. Extraer Atributo Mecánico Crítico para Destacarlo como Hero Card
  const priorityKeys = [
    'Norma Técnica',
    'norma_tecnica',
    'Resistencia Fluencia',
    'resistencia_fluencia',
    'Resistencia a 28d',
    'resistencia_28d',
    'Grado de Acero',
    'grado_de_acero'
  ];

  let heroSpec: { key: string; val: string } | null = null;
  const remainingSpecs: Record<string, string> = { ...originalSpecs };

  for (const pKey of priorityKeys) {
    const foundEntry = Object.entries(originalSpecs).find(
      ([key]) => key.toLowerCase() === pKey.toLowerCase()
    );
    if (foundEntry) {
      heroSpec = { key: foundEntry[0], val: foundEntry[1] };
      delete remainingSpecs[foundEntry[0]];
      break;
    }
  }

  // 2. Agrupar Atributos Restantes Dinámicamente para el Layout Bento
  const groups: {
    ingenieria: [string, string][];
    dimensiones: [string, string][];
    logistica: [string, string][];
  } = {
    ingenieria: [],
    dimensiones: [],
    logistica: []
  };

  Object.entries(remainingSpecs).forEach(([key, val]) => {
    const k = key.toLowerCase();
    if (
      k.includes('norma') || 
      k.includes('grado') || 
      k.includes('resistencia') || 
      k.includes('fluencia') || 
      k.includes('compresión') || 
      k.includes('material') || 
      k.includes('soldabilidad') || 
      k.includes('alambre') || 
      k.includes('tipo') ||
      k.includes('sello')
    ) {
      groups.ingenieria.push([key, val]);
    } else if (
      k.includes('largo') || 
      k.includes('diámetro') || 
      k.includes('espesor') || 
      k.includes('altura') || 
      k.includes('ancho') || 
      k.includes('formato') || 
      k.includes('medida') || 
      k.includes('presentación') || 
      k.includes('espaciamiento') ||
      k.includes('dimensión')
    ) {
      groups.dimensiones.push([key, val]);
    } else {
      groups.logistica.push([key, val]);
    }
  });

  return (
    <div className="specs-modal-overlay active" onClick={onClose}>
      <div className="specs-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="specs-modal-close" onClick={onClose} aria-label="Cerrar ficha">&times;</button>

        {/* HEADER DE FICHA CON ICONO VECTORIAL INDUSTRIAL */}
        <div className="specs-header-section">
          <div className="specs-icon-wrapper">
            {getCategoryIcon(product.categoria)}
          </div>
          <div style={{ flex: 1 }}>
            <span className="specs-category-badge">{getCategoryLabel(product.categoria)}</span>
            <div className="specs-modal-code">{product.codigo}</div>
          </div>
        </div>

        {/* NOMBRE DE PRODUCTO INDUSTRIAL */}
        <h4 className="specs-product-title">
          {product.nombre}
        </h4>

        {/* DESCRIPCIÓN TÉCNICA BREVE */}
        <p className="specs-modal-desc">
          {product.descripcion || 'Material siderúrgico de primera calidad certificado bajo estándares internacionales para obras civiles e infraestructura pesada.'}
        </p>

        {/* ÁREA DE CONTENIDO CON SCOLL VERTICAL SEGURO PARA COMPATIBILIDAD MÓVIL */}
        <div className="specs-scrollable-content">
          
          {/* BADGES GENERALES RÁPIDOS */}
          <div className="specs-quick-badges">
            <div className="specs-quick-badge">
              <span className="specs-qb-label">Unidad</span>
              <span className="specs-qb-val">{product.unidad.toUpperCase()}</span>
            </div>
            <div className="specs-quick-badge">
              <span className="specs-qb-label">Stock Patio</span>
              <span className="specs-qb-val highlight">{product.stock_actual} und</span>
            </div>
            <div className="specs-quick-badge">
              <span className="specs-qb-label">Control</span>
              <span className="specs-qb-val success">100% OK</span>
            </div>
          </div>

          {/* FEATURE CARD: ATRIBUTO CLAVE DE INGENIERÍA */}
          {heroSpec && (
            <div className="specs-feature-card">
              <div className="specs-fc-header">
                <svg className="specs-fc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 11l2 2 4-4" />
                </svg>
                <span className="specs-fc-label">{getPrettyLabel(heroSpec.key)}</span>
              </div>
              <div className="specs-fc-value">{heroSpec.val}</div>
            </div>
          )}

          {/* GRUPO BENTO 1: PROPIEDADES DE INGENIERÍA Y CALIDAD */}
          {groups.ingenieria.length > 0 && (
            <div className="specs-group-container">
              <div className="specs-group-title">
                <span className="specs-title-indicator blue" />
                Ingeniería y Calidad
              </div>
              <table className="specs-group-table">
                <tbody>
                  {groups.ingenieria.map(([key, val]) => (
                    <tr key={key} className="specs-grid-row">
                      <td className="specs-grid-label">{getPrettyLabel(key)}</td>
                      <td className="specs-grid-value">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* GRUPO BENTO 2: DIMENSIONES Y FORMATO DE SUMINISTRO */}
          {groups.dimensiones.length > 0 && (
            <div className="specs-group-container">
              <div className="specs-group-title">
                <span className="specs-title-indicator orange" />
                Dimensiones y Formato
              </div>
              <table className="specs-group-table">
                <tbody>
                  {groups.dimensiones.map(([key, val]) => (
                    <tr key={key} className="specs-grid-row">
                      <td className="specs-grid-label">{getPrettyLabel(key)}</td>
                      <td className="specs-grid-value">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* GRUPO BENTO 3: USO, LOGÍSTICA Y DESPACHO */}
          {groups.logistica.length > 0 && (
            <div className="specs-group-container">
              <div className="specs-group-title">
                <span className="specs-title-indicator green" />
                Uso y Logística
              </div>
              <table className="specs-group-table">
                <tbody>
                  {groups.logistica.map(([key, val]) => (
                    <tr key={key} className="specs-grid-row">
                      <td className="specs-grid-label">{getPrettyLabel(key)}</td>
                      <td className="specs-grid-value">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ACCIONES Y BOTONES DEL PIE DE FICHA */}
        <div className="specs-actions-footer">
          <button
            type="button"
            className="btn btn-primary specs-btn-main"
            onClick={() => {
              if (!isAlreadyInCart) {
                onAddToCart();
              }
              onClose();
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {isAlreadyInCart ? 'Ya en tu Cotización' : 'Agregar a Cotización'}
          </button>

          <button
            type="button"
            className="btn specs-btn-close"
            onClick={onClose}
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
