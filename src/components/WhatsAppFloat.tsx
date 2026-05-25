import { MessageCircle } from 'lucide-react';

export function WhatsAppFloat() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '584124051793';
  
  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('¡Hola Construacero! Me gustaría saber más acerca de cómo funciona su sistema de despachos y presupuestos.')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float-btn"
      aria-label="Chat de WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}

