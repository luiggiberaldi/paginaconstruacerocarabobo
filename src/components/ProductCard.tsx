import { Plus } from 'lucide-react';
import { Product } from '../store';
import { useQuoteStore } from '../store';
import { toast } from 'sonner';

export function ProductCard({ product }: { product: Product }) {
  const addItem = useQuoteStore((state) => state.addItem);

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.nombre} añadido a tu cotización`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col group">
      <div className="aspect-[4/3] bg-gray-200 w-full overflow-hidden">
        {product.imagen ? (
          <img
            src={product.imagen}
            alt={product.nombre}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-sm font-semibold text-orange-600 mb-1 uppercase tracking-wider">{product.categoria}</p>
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{product.nombre}</h3>
            <p className="text-sm text-gray-500 font-mono">{product.codigo}</p>
          </div>
        </div>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-extrabold text-gray-900">${product.precio_usd.toFixed(2)}</span>
            <span className="text-sm tracking-tight text-gray-500 ml-1">USD / {product.medida}</span>
          </div>
          <button
            onClick={handleAdd}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors"
            title="Añadir a cotización"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
