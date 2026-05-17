import { create } from 'zustand';

export interface Product {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  precio_usd: number;
  medida: string;
  imagen?: string;
  activo: boolean;
}

export interface QuoteItem {
  product: Product;
  quantity: number;
}

interface QuoteStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  items: QuoteItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clear: () => void;
}

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  items: [],
  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
          isOpen: true,
        };
      }
      return { items: [...state.items, { product, quantity }], isOpen: true };
    });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    }));
  },
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    }));
  },
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.product.precio_usd * item.quantity,
      0
    );
  },
  clear: () => set({ items: [] }),
}));
