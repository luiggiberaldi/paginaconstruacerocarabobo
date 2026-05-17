import { MessageCircle } from 'lucide-react';

export function WhatsAppFloat() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '584120000000';
  
  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('¡Hola Construacero! Me gustaría saber más acerca de cómo funciona su sistema de despachos y presupuestos.')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-green-500 text-white rounded-full p-3.5 shadow-lg hover:bg-green-600 hover:scale-110 transition-transform duration-200"
      aria-label="Chat de WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}
