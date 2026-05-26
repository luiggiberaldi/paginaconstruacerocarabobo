import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useTasaBcv } from '../hooks/useTasaBcv';
import { 
  DbProduct, 
  fallbackProducts, 
  getCategoryLabel,
  isCedulaValid,
  isPhoneValid
} from './AutocotizadorHelpers';
import { ProductVisualCard } from './ProductVisualCard';
import { SpecsModal } from './SpecsModal';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';

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
    { regex: /\b(?:una?|1)\s+y\s+(?:media|medio)\b/g, replacement: '1 1/2' },
    { regex: /\b(?:pulgada|pulgadas)\s+y\s+(?:media|medio)\b/g, replacement: '1 1/2' },
    { regex: /\b1[-.]1\/2\b/g, replacement: '1 1/2' },
    { regex: /\b(?:dos|2)\s+y\s+(?:media|medio)\b/g, replacement: '2 1/2' },
    { regex: /\b2[-.]1\/2\b/g, replacement: '2 1/2' },
    { regex: /\b(?:tres|3)\s+y\s+(?:media|medio)\b/g, replacement: '3 1/2' },
    { regex: /\b3[-.]1\/2\b/g, replacement: '3 1/2' },
    { regex: /\b(?:tres\s+octavos?)\b/g, replacement: '3/8' },
    { regex: /\b(?:tres\s+cuartos?)\b/g, replacement: '3/4' },
    { regex: /\b(?:cinco\s+octavos?)\b/g, replacement: '5/8' },
    { regex: /\b(?:siete\s+octavos?)\b/g, replacement: '7/8' },
    { regex: /\b(?:un\s+cuarto|una\s+cuarta)\b/g, replacement: '1/4' },
    { regex: /\b(?:un\s+octavo)\b/g, replacement: '1/8' },
    { regex: /\b(?:tres\s+dieciseis(?:avos)?)\b/g, replacement: '3/16' },
    { regex: /\b(?:cinco\s+dieciseis(?:avos)?)\b/g, replacement: '5/16' },
    { regex: /\b(?:siete\s+dieciseis(?:avos)?)\b/g, replacement: '7/16' },
    { regex: /\b(?:nueve\s+dieciseis(?:avos)?)\b/g, replacement: '9/16' },
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

// Category SVG icon map (used for mobile chips and filter tags)
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Cabillas': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <line x1="6" y1="20" x2="18" y2="4" />
      <line x1="10" y1="20" x2="20" y2="10" />
      <line x1="4" y1="14" x2="14" y2="4" />
    </svg>
  ),
  'Vigas y Perfiles': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M6 5h12 M6 19h12 M12 5v14" />
    </svg>
  ),
  'Tuberías': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="8" cy="12" r="4" />
      <circle cx="16" cy="12" r="4" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="16" x2="16" y2="16" />
    </svg>
  ),
  'Cemento': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M6 2L18 2 L20 6 L20 20 C20 21 19 22 18 22 L6 22 C5 22 4 21 4 20 L4 6 Z" />
      <path d="M4 8h16" />
      <path d="M12 11l-3 3h6z" fill="currentColor" />
    </svg>
  ),
  'Mallas': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
    </svg>
  ),
  'Alambres': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M4 10c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" />
      <path d="M7 11c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5-5-2.2-5-5z" opacity="0.7" />
    </svg>
  ),
  'Láminas': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  'Accesorios': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
};

  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Connection and Offline States
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Mobile Viewport State
  const [isMobile, setIsMobile] = useState(false);

  // Cart Drawer State (Mobile/Tablet)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 992);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Modal Specifications State
  const [selectedSpecProduct, setSelectedSpecProduct] = useState<DbProduct | null>(null);

  // Form State - Persisted in localStorage
  const [clientName, setClientName] = useState(() => localStorage.getItem('construacero_client_name') || '');
  const [clientCedula, setClientCedula] = useState(() => localStorage.getItem('construacero_client_cedula') || '');
  const [clientPhone, setClientPhone] = useState(() => localStorage.getItem('construacero_client_phone') || '');
  const [clientAddress, setClientAddress] = useState(() => localStorage.getItem('construacero_client_address') || '');
  const [clientState, setClientState] = useState(() => localStorage.getItem('construacero_client_state') || '');
  const [clientCity, setClientCity] = useState(() => localStorage.getItem('construacero_client_city') || '');
  
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
    localStorage.setItem('construacero_client_phone', clientPhone);
    localStorage.setItem('construacero_client_address', clientAddress);
    localStorage.setItem('construacero_client_state', clientState);
    localStorage.setItem('construacero_client_city', clientCity);
  }, [clientName, clientCedula, clientPhone, clientAddress, clientState, clientCity]);

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

  // Count items per category (grouped by user-facing label)
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    products.forEach(p => {
      const label = getCategoryLabel(p.categoria);
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Compute unique labeled Categories dynamically sorted by item volume descending
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => getCategoryLabel(p.categoria)));
    return Array.from(cats).sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0));
  }, [products, categoryCounts]);

  // Filter categories based on category search term (case-insensitive label matching)
  const filteredCategories = useMemo(() => {
    const term = normalizeText(categorySearchTerm);
    if (!term) return categories;
    return categories.filter(cat => 
      normalizeText(cat).includes(term)
    );
  }, [categories, categorySearchTerm]);

  // Sliced categories for the expand/collapse sidebar feature
  const visibleCategories = useMemo(() => {
    if (isMobile) return filteredCategories;
    return showAllCategories ? filteredCategories : filteredCategories.slice(0, 8);
  }, [filteredCategories, showAllCategories, isMobile]);

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
    if (value === '') {
      setSelectedItems(prev => ({ ...prev, [productId]: '' as any }));
      return;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return;
    const validQty = Math.max(0, Math.min(parsed, maxStock));
    setSelectedItems(prev => ({ ...prev, [productId]: validQty }));
  };

  // Safe blur handler to ensure quantities never remain empty or zero
  const handleInputBlur = (productId: string) => {
    setSelectedItems(prev => {
      const current = prev[productId];
      if (current === '' as any || current === 0 || isNaN(Number(current))) {
        return { ...prev, [productId]: 1 };
      }
      return prev;
    });
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

  // Adjust product quantity from cart
  const handleCartAdjustQuantity = (productId: string, amount: number) => {
    const prod = products.find(p => p.id === productId) || fallbackProducts.find(p => p.id === productId);
    const maxStock = prod ? prod.stock_actual : 9999;
    handleAdjustQuantity(productId, amount, maxStock);
  };

  // Adjust product quantity directly from input in cart
  const handleCartInputChange = (productId: string, value: string) => {
    const prod = products.find(p => p.id === productId) || fallbackProducts.find(p => p.id === productId);
    const maxStock = prod ? prod.stock_actual : 9999;
    handleInputChange(productId, value, maxStock);
  };

  // Safe blur handler from cart
  const handleCartInputBlur = (productId: string) => {
    handleInputBlur(productId);
  };

  // Filter products reactive logic (optimized for Venezuelan market)
  const filteredProducts = useMemo(() => {
    const rawTerm = searchTerm.trim();
    if (!rawTerm) {
      return products.filter(product => 
        selectedCategory ? getCategoryLabel(product.categoria) === selectedCategory : true
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
        selectedCategory ? getCategoryLabel(product.categoria) === selectedCategory : true
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

      const matchesCategory = selectedCategory ? getCategoryLabel(product.categoria) === selectedCategory : true;
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

      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  // Pricing Conversion Factors
  const factor = tasaBcv.tasaUsdt > 0 && tasaBcv.precio > 0
    ? tasaBcv.tasaUsdt / tasaBcv.precio
    : 1;

  // Compute Running Totals (in USD BCV and VES)
  const totalUsd = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const prod = products.find(p => p.id === id) || 
                   fallbackProducts.find(p => p.id === id) || {
                     precio_usd: 15.0
                   };
      return sum + (prod ? prod.precio_usd * factor * Number(qty) : 0);
    }, 0);
  }, [selectedItems, products, factor]);

  const totalVes = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const prod = products.find(p => p.id === id) || 
                   fallbackProducts.find(p => p.id === id) || {
                     precio_usd: 15.0
                   };
      return sum + (prod ? prod.precio_usd * tasaBcv.tasaUsdt * Number(qty) : 0);
    }, 0);
  }, [selectedItems, products, tasaBcv.tasaUsdt]);

  const totalSelectedCount = useMemo(() => Object.keys(selectedItems).length, [selectedItems]);

  // Submit quote to WhatsApp
  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      totalSelectedCount === 0 || 
      clientName.trim() === '' || 
      clientCedula.trim() === '' || 
      clientPhone.trim() === '' || 
      clientState.trim() === '' ||
      clientCity.trim() === '' ||
      clientAddress.trim() === '' ||
      !isCedulaValid(clientCedula) ||
      !isPhoneValid(clientPhone)
    ) return;

    const itemsSummary = Object.entries(selectedItems).map(([id, qty]) => {
      const prod = products.find(p => p.id === id) || 
                   fallbackProducts.find(p => p.id === id) || {
                     id: id,
                     codigo: 'ESP-' + id.substring(0, 4).toUpperCase(),
                     nombre: 'Material Estructural Especial (' + id + ')',
                     categoria: 'MATERIALES',
                     descripcion: '',
                     unidad: 'und',
                     precio_usd: 15.0,
                     stock_actual: 999,
                     imagen_url: null,
                     activo: true
                   };
      return `* ${qty} x ${prod.nombre} (${prod.codigo})`;
    }).filter(s => s !== '').join('\n');

    let text = `*SOLICITUD DE COTIZACIÓN - CONSTRUACERO CARABOBO*\n\n`;
    text += `Cliente: ${clientName.trim()}\n`;
    text += `Cédula / RIF: ${clientCedula.trim()}\n`;
    text += `Teléfono: ${clientPhone.trim()}\n`;
    text += `Estado: ${clientState.trim()}\n`;
    text += `Ciudad: ${clientCity.trim()}\n`;
    text += `Dirección: ${clientAddress.trim()}\n\n`;
    text += `*Materiales Solicitados:*\n${itemsSummary}\n\n`;
    text += `*TOTAL ESTIMADO (REFERENCIAL):*\n`;
    text += `Total USD (tasa BCV): $${totalUsd.toFixed(2)}\n`;
    text += `Equivalente en Bolívares: Bs. ${totalVes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    text += `Tasa BCV de Referencia: ${tasaBcv.precio.toFixed(2)} Bs/$\n\n`;
    text += `Nota: Los precios mostrados son aproximados y de carácter referencial, sujetos a cambio sin previo aviso y a la disponibilidad física en el patio.`;

    if (!isOnline) {
      text += `\n\n[Nota: Cotización realizada en modo sin conexión - Guardada localmente]\n`;
    }

    try {
      navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Fallo al copiar ticket al portapapeles:', err);
    }

    if (!isOnline) {
      alert('¡Sin conexión a internet! Tu cotización ha sido copiada de forma segura a tu portapapeles. Se abrirá WhatsApp para que la envíes al recuperar señal.');
    }

    const encodedText = encodeURIComponent(text);
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '584124051793';
    const url = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
    window.open(url, '_blank');
  };

  const sharedCartProps = {
    selectedItems,
    products,
    factor,
    tasaBcv,
    isOnline,
    clientName,
    setClientName,
    clientCedula,
    setClientCedula,
    clientPhone,
    setClientPhone,
    clientAddress,
    setClientAddress,
    totalUsd,
    totalVes,
    onRemoveFromCart: handleRemoveFromCart,
    onClearCart: handleClearCart,
    onSendQuote: handleSendQuote,
    onCheckout: () => setIsCheckoutOpen(true),
    onAdjustQuantity: handleCartAdjustQuantity,
    onInputChange: handleCartInputChange,
    onInputBlur: handleCartInputBlur,
  };

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

            {/* ── MOBILE: search pill + chip strip ─────────────────── */}
            {isMobile && (
              <div className="mobile-category-outer">

                {/* Mobile category search */}
                <div className="mobile-cat-search-wrapper">
                  <svg className="mobile-cat-search-icon" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  <input
                    type="text"
                    className="mobile-cat-search-input"
                    placeholder="Buscar categoría..."
                    value={categorySearchTerm}
                    onChange={e => setCategorySearchTerm(e.target.value)}
                  />
                  {categorySearchTerm && (
                    <button
                      type="button"
                      className="mobile-cat-search-clear"
                      onClick={() => setCategorySearchTerm('')}
                      aria-label="Limpiar búsqueda de categoría"
                    >
                      <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                  )}
                </div>

                {/* Scrollable chip strip with gradient masks */}
                <div className="mobile-category-strip">
                  <div className="category-filter-list-container">
                    <nav className="category-filter-list">
                      <button
                        type="button"
                        className={`category-filter-item ${selectedCategory === '' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('')}
                      >
                        <span className="category-chip-icon">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                          </svg>
                        </span>
                        <span className="category-chip-label">Todos</span>
                        <span className="category-item-count">{products.length}</span>
                      </button>
                      {visibleCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          className={`category-filter-item ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          <span className="category-chip-icon">{CATEGORY_ICONS[cat] || '📦'}</span>
                          <span className="category-chip-label">{cat}</span>
                          <span className="category-item-count">{categoryCounts[cat] || 0}</span>
                        </button>
                      ))}
                      {visibleCategories.length === 0 && categorySearchTerm && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '10px 8px', whiteSpace: 'nowrap', opacity: 0.7 }}>
                          Sin coincidencias
                        </span>
                      )}
                    </nav>
                  </div>
                </div>

              </div>
            )}

            {/* ── DESKTOP: sticky sidebar with title, search, list ── */}
            {!isMobile && (
              <>
                <div className="sidebar-title">
                  <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
                  </svg>
                  Filtrar Categorías
                </div>

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
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', fill: 'var(--text-muted)', pointerEvents: 'none' }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  {categorySearchTerm && (
                    <button
                      type="button"
                      onClick={() => setCategorySearchTerm('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: 0, lineHeight: 1 }}
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
                        <span className="category-filter-item-name" title={cat}>
                          {CATEGORY_ICONS[cat] || (
                            <svg style={{ width: '12px', height: '12px', fill: 'currentColor', opacity: 0.6 }} viewBox="0 0 24 24">
                              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                            </svg>
                          )}
                          {cat}
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
                      style={{ width: '10px', height: '10px', fill: 'none', stroke: 'currentColor', strokeWidth: 3, transform: showAllCategories ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </>
            )}

            {dbError && (
              <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.15)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg style={{ width: '14px', height: '14px', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, flexShrink: 0, color: 'var(--accent)' }} viewBox="0 0 24 24">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>{dbError}</span>
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
                <span>Mostrando <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong> productos</span>
                {isMobile && !tasaBcv.cargando && (
                  <span className="mobile-tasa-badge">
                    <span className="bcv-rate-dot-pulse" style={{ display: 'inline-block', width: '6px', height: '6px', marginRight: '5px', backgroundColor: '#22c55e' }}></span>
                    Tasa BCV: <strong>{tasaBcv.precio.toFixed(2)} Bs</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Mobile: active filter breadcrumb shown above product grid */}
            {isMobile && selectedCategory && (
              <div className="mobile-active-filter-bar">
                <span>Filtro:</span>
                <button
                  type="button"
                  className="filter-tag"
                  onClick={() => setSelectedCategory('')}
                  title="Quitar filtro"
                >
                  <span className="filter-tag-icon">{CATEGORY_ICONS[selectedCategory] || '📦'}</span>
                  {selectedCategory}
                  <span className="filter-clear-x">✕</span>
                </button>
              </div>
            )}
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
                    
                    const priceUsdBcv = product.precio_usd * factor;
                    const priceVes    = product.precio_usd * tasaBcv.tasaUsdt;

                    return (
                      <ProductVisualCard
                        key={product.id}
                        product={product}
                        isSelected={isSelected}
                        currentQty={currentQty}
                        priceUsdBcv={priceUsdBcv}
                        priceVes={priceVes}
                        onToggle={handleToggleProduct}
                        onRemove={handleRemoveFromCart}
                        onAdjustQuantity={handleAdjustQuantity}
                        onInputChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onShowSpecs={setSelectedSpecProduct}
                      />
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
            <CartDrawer {...sharedCartProps} isDrawer={false} />
          </aside>

        </div>
      </section>

      {/* Technical Spec Sheet Modal Overlay */}
      <SpecsModal
        product={selectedSpecProduct}
        isAlreadyInCart={selectedSpecProduct ? selectedItems[selectedSpecProduct.id] !== undefined : false}
        onClose={() => setSelectedSpecProduct(null)}
        onAddToCart={() => selectedSpecProduct && handleToggleProduct(selectedSpecProduct)}
      />

      {/* Checkout Focused Modal Overlay */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        clientName={clientName}
        setClientName={setClientName}
        clientCedula={clientCedula}
        setClientCedula={setClientCedula}
        clientPhone={clientPhone}
        setClientPhone={setClientPhone}
        clientAddress={clientAddress}
        setClientAddress={setClientAddress}
        clientState={clientState}
        setClientState={setClientState}
        clientCity={clientCity}
        setClientCity={setClientCity}
        totalUsd={totalUsd}
        totalVes={totalVes}
        tasaBcv={tasaBcv}
        onSubmit={handleSendQuote}
        totalSelectedCount={totalSelectedCount}
      />

      {/* Mobile Cart Drawer Overlay & Container */}
      <div className={`cart-drawer-overlay ${isCartDrawerOpen ? 'active' : ''}`} onClick={() => setIsCartDrawerOpen(false)} />
      <div className={`cart-drawer-container ${isCartDrawerOpen ? 'active' : ''}`}>
        <CartDrawer
          {...sharedCartProps}
          isDrawer={true}
          onCloseDrawer={() => setIsCartDrawerOpen(false)}
        />
      </div>

      {totalSelectedCount > 0 && (
        <button 
          type="button" 
          className="floating-mobile-cart"
          onClick={() => setIsCartDrawerOpen(true)}
        >
          <svg style={{ width: '24px', height: '24px', fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.9 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
          <span className="floating-mobile-cart-badge">{totalSelectedCount}</span>
        </button>
      )}
    </>
  );
}
