import { navigateToCotizar } from './AutocotizadorHelpers';

export function MainHero() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '584124051793';
  const whatsappMessage = encodeURIComponent('¡Hola! Vengo de la página web y deseo solicitar un presupuesto para materiales siderúrgicos al mayor.');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section className="main-hero">
      <div className="main-hero-overlay"></div>
      
      <div className="container main-hero-container">
        <div className="main-hero-content">
          <div className="main-hero-badge">
            <svg 
              style={{ width: '14px', height: '14px', stroke: 'currentColor', fill: 'none', strokeWidth: 2.5, marginRight: '6px', display: 'inline-block' }} 
              viewBox="0 0 24 24"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Suministros de Acero en Venezuela
          </div>
          
          <h1>
            SUMINISTRAMOS EL <span>ACERO</span> QUE SOPORTA TUS GRANDES PROYECTOS
          </h1>
          
          <p>
            Distribución líder al mayor y detal de cabillas, vigas estructurales, perfiles de hierro y láminas. Despachos directos y certificados a obras civiles, comercios e industrias de todo el país.
          </p>
          
          <div className="main-hero-ctas">
            {/* Desktop WhatsApp CTA */}
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn main-hero-btn-whatsapp desktop-only-cta"
            >
              <span>Contactar por WhatsApp</span>
              <svg style={{ width: '18px', height: '18px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
            </a>

            {/* Mobile Quote CTA */}
            <a 
              href="?cotizar=true"
              onClick={navigateToCotizar}
              className="btn main-hero-btn-whatsapp mobile-only-cta"
            >
              <span>Solicitar Cotización</span>
              <svg style={{ width: '18px', height: '18px', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </a>
            
            <a href="#productos" className="btn main-hero-btn-catalog">
              Ver Catálogo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
