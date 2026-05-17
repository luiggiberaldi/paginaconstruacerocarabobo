import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../store';
import { mockProducts } from '../data/mockProducts';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      // Return mock data if Supabase is not configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setProducts(mockProducts);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch public view created in Supabase
        const { data, error: dbError } = await supabase
          .from('v_catalogo_publico')
          .select('*')
          .order('categoria', { ascending: true })
          .order('nombre', { ascending: true });

        if (dbError) {
          throw new Error(dbError.message);
        }

        // Map database fields to the Product interface
        const formattedProducts: Product[] = (data || []).map((item) => ({
          id: item.id,
          codigo: item.codigo,
          nombre: item.nombre,
          categoria: item.categoria,
          precio_usd: item.precio_usd,
          medida: item.unidad || 'Unidad',
          activo: item.activo,
          imagen: item.imagen_url || null, // Optional generic mapping could go here if no image
        }));

        setProducts(formattedProducts);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        // Fallback to mock data if the view doesn't exist yet or query fails
        setError('No se pudo conectar al catálogo. Mostrando datos de demostración.');
        setProducts(mockProducts);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, isLoading, error };
}
