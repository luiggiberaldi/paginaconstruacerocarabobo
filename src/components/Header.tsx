import { ShoppingCart, Menu, X, HardHat } from 'lucide-react';
import { useQuoteStore } from '../store';

export function Header() {
  const { getTotalItems, setIsOpen } = useQuoteStore();
  const itemsCount = getTotalItems();

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 border-t-4 border-t-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo-dark.png" alt="Construacero Carabobo" className="h-10 object-contain" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Catálogo</a>
            <a href="#" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Categorías</a>
            <a href="#" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Contacto</a>
          </nav>

          {/* Cart Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {itemsCount}
                </span>
              )}
            </button>
            <button className="md:hidden p-2 text-gray-600">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
