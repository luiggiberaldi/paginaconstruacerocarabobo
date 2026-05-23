import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useTasaBcv } from '../hooks/useTasaBcv';
import { 
  DbProduct, 
  fallbackProducts, 
  getProductSpecs, 
  getCategoryLabel 
} from './AutocotizadorHelpers';

// Optimized text normalization for Venezuelan market (removes accents, standardizes inch symbols)
function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/["”']/g, "") // remove inch/quote symbols
    .replace(/pulgadas|pulgada|pulg/g, "") // remove common inch text variants
    .trim();
}

const SPANISH_STOPWORDS = new Set<string>([
  'de', 'con', 'para', 'el', 'la', 'los', 'las', 'un', 'una', 'y', 'en', 'del', 'al', 'por', 'sobre'
]);

function preprocessQuery(query: string): string {
  let term = (query || '').toLowerCase();
  
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


// Synonyms map tailored to the Venezuelan construction & steel market
const VENEZUELAN_SYNONYMS: { [key: string]: string[] } = {
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

export function Autocotizador() {
  const tasaBcv = useTasaBcv();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Connection and Offline States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Modal Specifications State
  const [selectedSpecProduct, setSelectedSpecProduct] = useState<DbProduct | null>(null);

  // Form State - Persisted in localStorage
  const [clientName, setClientName] = useState(() => localStorage.getItem('construacero_client_name') || '');
  const [clientCedula, setClientCedula] = useState(() => localStorage.getItem('construacero_client_cedula') || '');
  const [clientAddress, setClientAddress] = useState(() => localStorage.getItem('construacero_client_address') || '');
  
  // Selection State: { [productId]: quantity } - Persisted in localStorage
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('construacero_cart');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset pagination page to 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Handle Online/Offline Status
  useEffect(() => {
    const toggle = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', toggle);
    window.addEventListener('offline', toggle);
    return () => {
      window.removeEventListener('online', toggle);
      window.removeEventListener('offline', toggle);
    };
  }, []);

  // Save Form Fields to localStorage
  useEffect(() => {
    localStorage.setItem('construacero_client_name', clientName);
    localStorage.setItem('construacero_client_cedula', clientCedula);
    localStorage.setItem('construacero_client_address', clientAddress);
  }, [clientName, clientCedula, clientAddress]);

  // Save Cart Items to localStorage
  useEffect(() => {
    localStorage.setItem('construacero_cart', JSON.stringify(selectedItems));
  }, [selectedItems]);

  // Fetch Inventory from Supabase
  useEffect(() => {
    async function fetchInventory() {
      if (!supabase) {
        setProducts(fallbackProducts);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setDbError(null);
        const { data, error } = await supabase
          .from('v_catalogo_publico')
          .select('*')
          .order('categoria', { ascending: true })
          .order('nombre', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const filtered = (data as DbProduct[]).filter(p => p.stock_actual > 0);
          setProducts(filtered);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (err: any) {
        console.error('Error fetching inventory from Supabase:', err);
        const isMissingRelation = err?.message?.includes('relation') || err?.message?.includes('v_catalogo_publico') || err?.code === 'PGRST116';
        if (isMissingRelation) {
          setDbError('Base de datos no disponible. Mostrando catálogo cached.');
        } else {
          setDbError('No se pudo conectar al inventario en vivo. Mostrando catálogo en caché.');
        }
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    products.forEach(p => {
      counts[p.categoria] = (counts[p.categoria] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Compute Categories dynamically sorted by item volume descending
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.categoria));
    return Array.from(cats).sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0));
  }, [products, categoryCounts]);

  // Filter categories based on category search term (case-insensitive label matching)
  const filteredCategories = useMemo(() => {
    const term = normalizeText(categorySearchTerm);
    if (!term) return categories;
    return categories.filter(cat => 
      normalizeText(getCategoryLabel(cat)).includes(term)
    );
  }, [categories, categorySearchTerm]);

  // Sliced categories for the expand/collapse sidebar feature
  const visibleCategories = useMemo(() => {
    return showAllCategories ? filteredCategories : filteredCategories.slice(0, 8);
  }, [filteredCategories, showAllCategories]);

  // Handle checking/unchecking/adding a product card
  const handleToggleProduct = (product: DbProduct) => {
    setSelectedItems(prev => {
      const updated = { ...prev };
      if (prev[product.id] !== undefined) {
        delete updated[product.id];
      } else {
        updated[product.id] = 1;
      }
      return updated;
    });
  };

  // Adjust product quantity
  const handleAdjustQuantity = (productId: string, amount: number, maxStock: number) => {
    setSelectedItems(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(1, Math.min(currentQty + amount, maxStock));
      return { ...prev, [productId]: newQty };
    });
  };

  // Adjust product quantity directly via input field
  const handleInputChange = (productId: string, value: string, maxStock: number) => {
    const parsed = parseInt(value, 10);
    const validQty = isNaN(parsed) ? 1 : Math.max(1, Math.min(parsed, maxStock));
    setSelectedItems(prev => ({ ...prev, [productId]: validQty }));
  };

  // Remove specific product from cart
  const handleRemoveFromCart = (productId: string) => {
    setSelectedItems(prev => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (window.confirm('¿Seguro que deseas vaciar tu lista de cotización?')) {
      setSelectedItems({});
    }
  };

  // Filter products reactive logic (optimized for Venezuelan market)
  const filteredProducts = useMemo(() => {
    const rawTerm = searchTerm.trim();
    if (!rawTerm) {
      return products.filter(product => 
        selectedCategory ? product.categoria === selectedCategory : true
      );
    }

    const preprocessed = preprocessQuery(rawTerm);
    const normalized = normalizeText(preprocessed);
    
    // Matches compound fractions "1 1/2", simple fractions "1/2", or words/numbers
    const tokenRegex = /\d+\s+\d+\/\d+|\d+\/\d+|[a-z0-9]+/g;
    const matches = normalized.match(tokenRegex) || [];
    const normalizedTokens = matches.filter(token => !SPANISH_STOPWORDS.has(token));

    if (normalizedTokens.length === 0) {
      return products.filter(product => 
        selectedCategory ? product.categoria === selectedCategory : true
      );
    }

    return products.filter(product => {
      const normalizedNombre = normalizeText(product.nombre || '');
      const normalizedCodigo = normalizeText(product.codigo || '');
      const normalizedCategory = normalizeText(product.categoria || '');
      
      const productText = `${normalizedNombre} ${normalizedCodigo} ${normalizedCategory}`;

      // All tokens must match (AND search)
      const matchesSearch = normalizedTokens.every(token => {
        if (productText.includes(token)) return true;
        // Check synonyms
        const synonyms = VENEZUELAN_SYNONYMS[token];
        if (synonyms) {
          return synonyms.some(syn => productText.includes(syn));
        }
        return false;
      });

      const matchesCategory = selectedCategory ? product.categoria === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Paginated selection calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, startIndex, itemsPerPage]);

  // Sliding window page numbers generator (compact style like Amazon)
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include page 1
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always include last page
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  // Pricing Conversion Factors
  // precio_db está en USDT → convertir a USD BCV: precio_db × (tasaUsdt / tasaBcv)
  // equivalente en Bs: precio_db × tasaUsdt
  const factor = tasaBcv.tasaUsdt > 0 && tasaBcv.precio > 0
    ? tasaBcv.tasaUsdt / tasaBcv.precio
    : 1;

  // Compute Running Totals (in USD BCV and VES)
  const totalUsd = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const prod = products.find(p => p.id === id);
      return sum + (prod ? prod.precio_usd * factor * qty : 0);
    }, 0);
  }, [selectedItems, products, factor]);

  const totalVes = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const prod = products.find(p => p.id === id);
      return sum + (prod ? prod.precio_usd * tasaBcv.tasaUsdt * qty : 0);
    }, 0);
  }, [selectedItems, products, tasaBcv.tasaUsdt]);

  const totalSelectedCount = useMemo(() => Object.keys(selectedItems).length, [selectedItems]);

  // Submit quote to WhatsApp
  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalSelectedCount === 0 || clientName.trim() === '' || clientCedula.trim() === '' || clientAddress.trim() === '') return;

    const itemsSummary = Object.entries(selectedItems).map(([id, qty]) => {
      const prod = products.find(p => p.id === id);
      if (!prod) return '';
      const precioUsdBcv  = prod.precio_usd * factor;
      const precioVes     = prod.precio_usd * tasaBcv.tasaUsdt;
      const subtotalUsd   = precioUsdBcv * qty;
      const subtotalVes   = precioVes * qty;
      return `- ${qty} x ${prod.nombre} (${prod.codigo})\n  Precio: $${precioUsdBcv.toFixed(2)} (≈ Bs. ${precioVes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}) / ${prod.unidad}\n  Sub-total: $${subtotalUsd.toFixed(2)} (Bs. ${subtotalVes.toLocaleString('es-ES', { minimumFractionDigits: 2 })})`;
    }).filter(s => s !== '').join('\n\n');

    let text = `*SOLICITUD DE COTIZACIÓN - CONSTRUACERO CARABOBO*\n\n`;
    text += `👤 *Cliente:* ${clientName.trim()}\n`;
    text += `🪪 *Cédula:* ${clientCedula.trim()}\n`;
    text += `📍 *Dirección:* ${clientAddress.trim()}\n\n`;
    text += `📦 *Materiales Solicitados:*\n${itemsSummary}\n\n`;
    text += `💰 *TOTAL ESTIMADO:*\n`;
    text += `💵 *Total USD (tasa BCV):* $${totalUsd.toFixed(2)}\n`;
    text += `🇻🇪 *Equivalente Bs.:* Bs. ${totalVes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    text += `📊 _Tasa BCV aplicada: ${tasaBcv.precio.toFixed(2)} Bs/$_\n\n`;

    if (!isOnline) text += `⚠️ [COTIZACIÓN REALIZADA SIN INTERNET - TICKET GUARDADO LOCALMENTE]\n\n`;
    text += `⚙️ _Generado desde la App Oficial de Construacero (Autocotizador 2.0 PWA)_`;

    try {
      navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Fallo al copiar ticket al portapapeles:', err);
    }

    if (!isOnline) {
      alert('¡Sin conexión a internet! Tu cotización ha sido copiada de forma segura a tu portapapeles. Se abrirá WhatsApp para que la envíes al recuperar señal.');
    }

    const encodedText = encodeURIComponent(text);
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '584244594724';
    const url = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
    window.open(url, '_blank');
  };

  const currentSpecSheet = useMemo(() => {
    return selectedSpecProduct ? getProductSpecs(selectedSpecProduct) : null;
  }, [selectedSpecProduct]);

  return (
    <>
      {/* Dynamic Offline Status Banner */}
      {!isOnline && (
        <div className="offline-status-indicator">
          <span className="bcv-rate-dot-pulse" style={{ backgroundColor: '#ffffff', boxShadow: 'none' }}></span>
          <span>Modo Sin Conexión Activo. Cotizaciones guardadas localmente.</span>
        </div>
      )}

      <section id="cotizar" className="autocotizador-section reveal active">
        {/* Title Header Section */}
        <div className="autocotizador-title-block container">
          <h2>Cotizador Inteligente <span>de Materiales Siderúrgicos</span></h2>
          <p>Planifique y presupueste su obra con total transparencia y precisión. Explore nuestro catálogo con inventario verificado en tiempo real, precios calculados bajo la tasa oficial del BCV y envíe su solicitud formal directo a WhatsApp.</p>
        </div>

        {/* 3-Column Layout */}
        <div className="amazon-layout-grid">
          
          {/* COLUMN 1: Category sidebar and live rates */}
          <aside className="amazon-sidebar-left">
            <div className="sidebar-title">
              <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
              </svg>
              Filtrar Categorías
            </div>

            {/* Category Search Input */}
            <div className="category-search-wrapper" style={{ margin: '0 0 4px 0', position: 'relative' }}>
              <input 
                type="text" 
                className="category-search-input"
                placeholder="Buscar categoría..."
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '8px 12px 8px 32px',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              />
              <svg 
                style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  width: '13px', 
                  height: '13px', 
                  fill: 'var(--text-muted)',
                  pointerEvents: 'none' 
                }} 
                viewBox="0 0 24 24"
              >
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              {categorySearchTerm && (
                <button
                  type="button"
                  onClick={() => setCategorySearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: 0,
                    lineHeight: 1
                  }}
                  title="Limpiar búsqueda"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="category-filter-list-container">
              <nav className="category-filter-list">
                <button 
                  type="button" 
                  className={`category-filter-item ${selectedCategory === '' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('')}
                >
                  <span className="category-filter-item-name">
                    <svg style={{ width: '13px', height: '13px', fill: 'currentColor', opacity: 0.8 }} viewBox="0 0 24 24">
                      <path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/>
                    </svg>
                    Todos los Productos
                  </span>
                  <span className="category-item-count">{products.length}</span>
                </button>

                {visibleCategories.map(cat => (
                  <button 
                    key={cat}
                    type="button" 
                    className={`category-filter-item ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span className="category-filter-item-name" title={getCategoryLabel(cat)}>
                      <svg style={{ width: '12px', height: '12px', fill: 'currentColor', opacity: 0.6 }} viewBox="0 0 24 24">
                        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                      </svg>
                      {getCategoryLabel(cat)}
                    </span>
                    <span className="category-item-count">{categoryCounts[cat] || 0}</span>
                  </button>
                ))}
              </nav>
            </div>

            {filteredCategories.length > 8 && (
              <button 
                type="button" 
                className="category-expand-btn"
                onClick={() => setShowAllCategories(!showAllCategories)}
              >
                <span>{showAllCategories ? 'Ver menos' : `Ver más (${filteredCategories.length - 8})`}</span>
                <svg 
                  style={{ 
                    width: '10px', 
                    height: '10px', 
                    fill: 'none', 
                    stroke: 'currentColor', 
                    strokeWidth: 3,
                    transform: showAllCategories ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} 
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            {/* Live Ticker Box */}
            <div className="sidebar-title" style={{ marginTop: '10px' }}>
              <span className="bcv-rate-dot-pulse" style={{ width: '6px', height: '6px', marginRight: '4px' }}></span>
              Tasa Referencial
            </div>

            <div className={`bcv-rate-banner ${!tasaBcv.cargando ? 'bcv-rate-banner-active' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tasa BCV:</span>
                <strong style={{ color: 'white' }}>{tasaBcv.cargando ? '...' : `${tasaBcv.precio.toFixed(2)} Bs`}</strong>
              </div>
              {tasaBcv.ultimaActualizacion && (
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px' }}>
                  Act. vía {tasaBcv.fuente.split('/')[0].trim()}
                </div>
              )}
            </div>

            {dbError && (
              <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.15)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ⚠️ {dbError}
              </div>
            )}
          </aside>

          {/* COLUMN 2: Search and Visual Product Grid */}
          <main className="amazon-center-content">
            
            {/* Search row with item counters */}
            <div className="amazon-search-bar-row">
              <div className="amazon-search-input-wrapper">
                <svg viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input 
                  type="text" 
                  className="amazon-search-field"
                  placeholder="Buscar por código o nombre de material..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="catalog-stats-badge">
                Mostrando <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong> productos
              </div>
            </div>

            {/* Product Cards list or loader */}
            {loading ? (
              <div className="amazon-products-grid">
                <div className="catalog-skeleton-card"></div>
                <div className="catalog-skeleton-card"></div>
                <div className="catalog-skeleton-card"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                <svg style={{ width: '48px', height: '48px', fill: 'currentColor', opacity: 0.2, marginBottom: '16px' }} viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Ningún material coincide con los criterios de búsqueda.</p>
                <button 
                  type="button" 
                  onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
                  style={{ marginTop: '12px', background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <>
                <div className="amazon-products-grid">
                {paginatedProducts.map((product) => {
                  const isSelected = selectedItems[product.id] !== undefined;
                  const currentQty = selectedItems[product.id] || 1;
                  
                  // Conversion formula
                  const priceUsdBcv = product.precio_usd * factor;
                  const priceVes    = product.precio_usd * tasaBcv.tasaUsdt;

                  // Read specs for dynamic technical badges on the card
                  const specs = getProductSpecs(product);
                  const specsArray = Object.entries(specs).slice(0, 2); // Show first 2 attributes

                  return (
                    <article 
                      key={product.id}
                      className={`product-visual-card ${isSelected ? 'selected' : ''}`}
                    >
                      {/* Image Thumbnail Header */}
                      <div className="product-img-wrapper">
                        <img 
                          src={product.imagen_url || '/assets/product_placeholder.png'} 
                          alt={product.nombre}
                          className="product-img"
                          loading="lazy"
                        />
                        <div className="product-badge-category">
                          {getCategoryLabel(product.categoria)}
                        </div>
                        
                        <div className="product-badge-stock">
                          <span className="product-stock-dot"></span>
                          Stock: {product.stock_actual} {product.unidad}
                        </div>

                        {/* Specs Overlay Button */}
                        <button 
                          type="button"
                          className="product-badge-info-btn"
                          onClick={(e) => { e.stopPropagation(); setSelectedSpecProduct(product); }}
                          title="Ver Ficha Técnica"
                        >
                          <svg style={{ width: '14px', height: '14px', fill: 'currentColor' }} viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                          </svg>
                        </button>
                      </div>

                      {/* Card Information */}
                      <div className="product-visual-body">
                        <span className="product-visual-code">{product.codigo}</span>
                        <h4 className="product-visual-title" title={product.nombre}>
                          {product.nombre}
                        </h4>

                        {/* Dynamic Mini Tech Badges */}
                        <div className="product-mini-specs">
                          {specsArray.map(([label, val]) => (
                            <span key={label} className="mini-spec-badge" title={`${label}: ${val}`}>
                              {val}
                            </span>
                          ))}
                        </div>

                        {/* Pricing Box */}
                        <div className="product-visual-price-row">
                          <div className="price-box">
                            <span className="price-label">Precio Unitario</span>
                            <span className="price-usd">
                              ${priceUsdBcv.toFixed(2)} <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>USD</span>
                            </span>
                            <span className="price-ves">
                              ≈ Bs. <strong>{priceVes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Action Cart Controls */}
                        <div className="card-action-container">
                          {!isSelected ? (
                            <button 
                              type="button" 
                              className="product-add-btn"
                              onClick={() => handleToggleProduct(product)}
                            >
                              <svg style={{ width: '14px', height: '14px', fill: 'currentColor' }} viewBox="0 0 24 24">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                              </svg>
                              Añadir al Carrito
                            </button>
                          ) : (
                            <div className="product-qty-selector">
                              <button 
                                type="button" 
                                className="product-qty-btn"
                                onClick={() => {
                                  if (currentQty === 1) {
                                    handleRemoveFromCart(product.id);
                                  } else {
                                    handleAdjustQuantity(product.id, -1, product.stock_actual);
                                  }
                                }}
                                title={currentQty === 1 ? "Eliminar del presupuesto" : "Disminuir cantidad"}
                                style={currentQty === 1 ? { color: '#ef4444' } : undefined}
                              >
                                {currentQty === 1 ? (
                                  <svg style={{ width: '13px', height: '13px', fill: 'currentColor' }} viewBox="0 0 24 24">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                  </svg>
                                ) : (
                                  '-'
                                )}
                              </button>
                              <input 
                                type="number" 
                                className="product-qty-value"
                                value={currentQty}
                                onChange={(e) => handleInputChange(product.id, e.target.value, product.stock_actual)}
                              />
                              <button 
                                type="button" 
                                className="product-qty-btn"
                                onClick={() => handleAdjustQuantity(product.id, 1, product.stock_actual)}
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Amazon Premium Pagination Bar */}
              {totalPages > 1 && (
                <div className="amazon-pagination-bar">
                  <button 
                    type="button" 
                    className="pagination-btn arrow"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    &larr; Anterior
                  </button>
                  
                  <div className="pagination-numbers">
                    {pageNumbers.map((pageVal, idx) => {
                      if (typeof pageVal === 'number') {
                        return (
                          <button
                            key={idx}
                            type="button"
                            className={`pagination-btn num ${currentPage === pageVal ? 'active' : ''}`}
                            onClick={() => setCurrentPage(pageVal)}
                          >
                            {pageVal}
                          </button>
                        );
                      } else {
                        return (
                          <span 
                            key={idx} 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              width: '34px', 
                              height: '34px', 
                              color: 'var(--text-muted)', 
                              fontSize: '0.85rem',
                              fontWeight: 700
                            }}
                          >
                            {pageVal}
                          </span>
                        );
                      }
                    })}
                  </div>

                  <button 
                    type="button" 
                    className="pagination-btn arrow"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </main>

          {/* COLUMN 3: Sticky shopping cart and project form */}
          <aside id="cart-sidebar-section" className="amazon-cart-sidebar">
            <div className="cart-header">
              <span className="cart-header-title">
                <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.9 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                Tu Presupuesto ({totalSelectedCount})
              </span>
              
              {totalSelectedCount > 0 && (
                <button 
                  type="button" 
                  className="cart-clear-btn"
                  onClick={handleClearCart}
                >
                  Vaciar todo
                </button>
              )}
            </div>

            {/* Offline notification card inside cart */}
            {!isOnline && (
              <div className="offline-warning-card">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <span>Offline: Copiaremos tu ticket al portapapeles.</span>
              </div>
            )}

            {/* Cart list content */}
            {totalSelectedCount === 0 ? (
              <div className="cart-empty-wrapper">
                <svg className="cart-empty-icon" viewBox="0 0 24 24" style={{ fill: 'currentColor' }}>
                  <path d="M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-1.1 0-2 .9-2 2v2c0 .96.69 1.76 1.62 1.97L3.84 21c.15.57.66.97 1.25.97h13.82c.59 0 1.1-.4 1.25-.97l2.22-6.03c.93-.21 1.62-1.01 1.62-1.97v-2c0-1.1-.9-2-2-2h-4.79zM9 6l3-4.5L15 6H9zm11 7H4v-2h16v2z"/>
                </svg>
                <div className="cart-empty-text">
                  Su carrito está vacío.<br />
                  Añada insumos del catálogo para elaborar su cotización.
                </div>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {Object.entries(selectedItems).map(([id, qty]) => {
                    const prod = products.find(p => p.id === id);
                    if (!prod) return null;
                    
                    const priceUsdBcv = prod.precio_usd * factor;
                    const subtotalUsd  = priceUsdBcv * qty;

                    return (
                      <div key={id} className="cart-item-row">
                        <img 
                          src={prod.imagen_url || '/assets/product_placeholder.png'} 
                          alt={prod.nombre} 
                          className="cart-item-img"
                        />
                        
                        <div className="cart-item-details">
                          <h5 className="cart-item-title" title={prod.nombre}>
                            {prod.nombre}
                          </h5>
                          <div className="cart-item-price-desc">
                            {qty} {prod.unidad} x <strong>${priceUsdBcv.toFixed(2)}</strong>
                          </div>
                        </div>

                        <div className="cart-item-actions">
                          <strong style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                            ${subtotalUsd.toFixed(2)}
                          </strong>
                          
                          <button 
                            type="button" 
                            className="cart-item-delete"
                            onClick={() => handleRemoveFromCart(prod.id)}
                            title="Remover producto"
                          >
                            <svg style={{ width: '13px', height: '13px', fill: 'currentColor' }} viewBox="0 0 24 24">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Checkout Details Form */}
                <form className="checkout-details-form" onSubmit={handleSendQuote}>
                  <div className="sidebar-title" style={{ paddingBottom: '8px', marginBottom: '4px' }}>
                    👤 Información de Despacho
                  </div>

                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label className="form-label">Nombre y Apellido</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ej: Pedro Pérez"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label className="form-label">Cédula de Identidad</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ej: V-12345678"
                      value={clientCedula}
                      onChange={(e) => setClientCedula(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Dirección de Entrega</label>
                    <textarea 
                      className="form-input" 
                      rows={2}
                      placeholder="Ej: Av. Bolívar, Calle 4, Local 12-B..."
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      required
                    />
                  </div>

                  {/* Totals Summary */}
                  <div className="checkout-totals-summary">
                    <div className="total-row">
                      <span className="total-label">Total en USD (BCV):</span>
                      <span className="total-value-usd">${totalUsd.toFixed(2)}</span>
                    </div>

                    <div className="total-row" style={{ marginTop: '2px' }}>
                      <span className="total-label">Total en Bolívares (VES):</span>
                      <span className="total-value-ves">
                        Bs. {totalVes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="checkout-rates-info">
                      Tasa BCV oficial: <strong>{tasaBcv.precio.toFixed(2)} Bs/$</strong>
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <button 
                    type="submit" 
                    className="checkout-submit-btn"
                    disabled={totalSelectedCount === 0 || clientName.trim() === '' || clientCedula.trim() === '' || clientAddress.trim() === ''}
                  >
                    <span>Contactar con un Asesor Comercial</span>
                    <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                </form>
              </>
            )}

          </aside>

        </div>
      </section>

      {/* Technical Spec Sheet Modal Overlay */}
      <div className={`specs-modal-overlay ${selectedSpecProduct ? 'active' : ''}`} onClick={() => setSelectedSpecProduct(null)}>
        {selectedSpecProduct && currentSpecSheet && (
          <div className="specs-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="specs-modal-close" onClick={() => setSelectedSpecProduct(null)}>&times;</button>
            
            <h3 className="specs-modal-title">Ficha Técnica Oficial</h3>
            <div className="specs-modal-code">{selectedSpecProduct.codigo}</div>
            
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              {selectedSpecProduct.nombre}
            </h4>
            
            <p className="specs-modal-desc" style={{ fontSize: '0.8rem', marginBottom: '16px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {selectedSpecProduct.descripcion || 'Material siderúrgico de primera calidad certificado bajo estándares internacionales para obras civiles e infraestructura pesada.'}
            </p>

            <table className="specs-table" style={{ marginBottom: '20px', width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr className="specs-table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="specs-table-label" style={{ fontSize: '0.75rem', padding: '8px 0', color: 'var(--text-muted)' }}>Categoría</td>
                  <td className="specs-table-value" style={{ fontSize: '0.8rem', padding: '8px 0', fontWeight: 600, color: 'white', textAlign: 'right' }}>{getCategoryLabel(selectedSpecProduct.categoria)}</td>
                </tr>
                <tr className="specs-table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="specs-table-label" style={{ fontSize: '0.75rem', padding: '8px 0', color: 'var(--text-muted)' }}>Unidad de Medida</td>
                  <td className="specs-table-value" style={{ fontSize: '0.8rem', padding: '8px 0', fontWeight: 600, color: 'white', textAlign: 'right' }}>{selectedSpecProduct.unidad}</td>
                </tr>
                {Object.entries(currentSpecSheet).map(([label, val]) => (
                  <tr key={label} className="specs-table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="specs-table-label" style={{ fontSize: '0.75rem', padding: '8px 0', color: 'var(--text-muted)' }}>{label}</td>
                    <td className="specs-table-value" style={{ fontSize: '0.8rem', padding: '8px 0', fontWeight: 600, color: 'white', textAlign: 'right' }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '12px', fontSize: '0.85rem', justifyContent: 'center', borderRadius: '10px' }}
                onClick={() => {
                  const isSelected = selectedItems[selectedSpecProduct.id] !== undefined;
                  if (!isSelected) {
                    handleToggleProduct(selectedSpecProduct);
                  }
                  setSelectedSpecProduct(null);
                }}
              >
                {selectedItems[selectedSpecProduct.id] !== undefined ? 'Ya en Carrito' : 'Agregar a Cotización'}
              </button>
              
              <button 
                type="button" 
                className="btn" 
                style={{ padding: '12px 18px', fontSize: '0.85rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px' }}
                onClick={() => setSelectedSpecProduct(null)}
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        )}
      </div>

      {totalSelectedCount > 0 && (
        <a 
          href="#cart-sidebar-section" 
          className="floating-mobile-cart"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('cart-sidebar-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <svg style={{ width: '24px', height: '24px', fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.9 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
          <span className="floating-mobile-cart-badge">{totalSelectedCount}</span>
        </a>
      )}
    </>
  );
}
