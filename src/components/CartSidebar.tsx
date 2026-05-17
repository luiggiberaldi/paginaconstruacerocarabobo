import { X, Minus, Plus, Trash2, Send } from 'lucide-react';
import { useQuoteStore } from '../store';
import { useState } from 'react';

export function CartSidebar() {
  const { isOpen, setIsOpen, items, updateQuantity, removeItem, getTotalPrice, clear } = useQuoteStore();
  const [formData, setFormData] = useState({ name: '', phone: '', document: '', state: '', city: '' });
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '584120000000';
    
    // Aquí iría la lógica de insertar en Supabase, luego redirigimos a whatsapp
    const mockId = Math.floor(Math.random() * 10000);
    const msg = `¡Hola! Soy ${formData.name} (CI/RIF: ${formData.document}), de ${formData.city}, estado ${formData.state}. He generado la pre-cotización web #${mockId} por un total referencial de $${getTotalPrice().toFixed(2)}. Quisiera validarla con un asesor.`;
    
    // Formatear items
    const itemsText = items.map(i => `- ${i.quantity}x ${i.product.nombre} ($${(i.product.precio_usd * i.quantity).toFixed(2)})`).join('\n');
    const finalMsg = `${msg}\n\n*Productos solicitados:*\n${itemsText}`;

    // Simulate Supabase insert delay
    setTimeout(() => {
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(finalMsg)}`, '_blank');
      clear();
      setIsOpen(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={() => setIsOpen(false)} />
      
      <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col">
          
          <div className="px-4 py-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between sm:px-6">
            <h2 className="text-xl font-bold text-gray-900">Tu Cotización</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Cerrar panel</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Tu cotización está vacía</p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mt-4 text-sm font-medium text-orange-600 hover:text-orange-500"
                >
                  Seguir viendo productos
                </button>
              </div>
            ) : (
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={item.product.id} className="flex py-2">
                    <div className="flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-base font-semibold text-gray-900">
                          <div className="flex gap-3">
                            {item.product.imagen ? (
                              <img src={item.product.imagen} alt={item.product.nombre} className="w-12 h-12 object-cover rounded-md border border-gray-200" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-xs text-gray-400">Img</div>
                            )}
                            <div>
                              <h3 className="line-clamp-2 pr-4">{item.product.nombre}</h3>
                              <p className="mt-0.5 text-sm font-normal text-gray-500">${item.product.precio_usd.toFixed(2)} c/u</p>
                            </div>
                          </div>
                          <p className="ml-4 whitespace-nowrap">${(item.product.precio_usd * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm mt-4">
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-1 text-gray-900 font-medium border-x border-gray-200 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="font-medium text-red-600 hover:text-red-500 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal referencial (USD)</p>
                <p>${getTotalPrice().toFixed(2)}</p>
              </div>
              <p className="text-sm text-gray-500 mb-6">El costo de flete será calculado por el asesor una vez enviada la solicitud.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Nombre o Razón Social</label>
                  <input
                    type="text"
                    id="name"
                    required
                    placeholder="Ej. Inversiones El Constructor C.A."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-2.5 border outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="document" className="block text-sm font-semibold text-gray-700">Cédula o RIF</label>
                    <input
                      type="text"
                      id="document"
                      required
                      placeholder="J-12345678-9"
                      value={formData.document}
                      onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                      className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-2.5 border outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">WhatsApp</label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      placeholder="0414-0000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-2.5 border outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="block text-sm font-semibold text-gray-700">Estado</label>
                    <input
                      type="text"
                      id="state"
                      required
                      placeholder="Carabobo"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-2.5 border outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700">Ciudad</label>
                    <input
                      type="text"
                      id="city"
                      required
                      placeholder="Valencia"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-2.5 border outline-none"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-orange-600 hover:bg-orange-500 mt-6 transition-all"
                >
                  <Send className="mr-2 h-5 w-5" />
                  Enviar al Asesor
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
