import { useState, useMemo } from 'react';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { CartSidebar } from './components/CartSidebar';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { useProducts } from './hooks/useProducts';

export default function App() {
  const { products, isLoading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.categoria));
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? product.categoria === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" />
      <WhatsAppFloat />
      <Header />
      
      <main className="flex-1">
        <Hero />
        
        <div id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-4 border-b border-gray-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold leading-6 text-gray-900">Materiales Disponibles</h2>
            <div className="flex space-x-2">
              <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                Inventario Sincronizado
              </span>
            </div>
          </div>

          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2 border"
            />
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2 border bg-white"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {error && (
            <div className="mb-6 p-4 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <p className="text-gray-500 text-lg">No se encontraron productos coincidentes.</p>
                  <button onClick={() => { setSearchTerm(''); setSelectedCategory(null); }} className="mt-4 text-orange-600 hover:underline">
                    Ver todos los productos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <CartSidebar />
      
      <footer className="bg-gray-900 mt-auto py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 Construacero Carabobo. Todos los derechos reservados.
            <br />
            Este es un Catálogo Interactivo en Vivo conectado a Supabase.
          </p>
          <a href="/INSTRUCCIONES_SUPABASE.md" target="_blank" className="text-orange-400 text-xs hover:underline">
            Ver instrucciones para administradores
          </a>
        </div>
      </footer>
    </div>
  );
}
