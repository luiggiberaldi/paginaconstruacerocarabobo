import { navigateToCotizar } from './AutocotizadorHelpers';

interface FooterProps {
  standalone?: boolean;
}

export function Footer({ standalone = false }: FooterProps) {
  return (
    <footer>
      <div className="container footer-grid">
        
        {/* Column 1 - Brand Info */}
        <div className="footer-column">
          <a href={standalone ? "/" : "#"} className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="/assets/logo.png" 
              alt="Construacero Logo" 
              style={{ height: '42px', width: 'auto', objectFit: 'contain', borderRadius: '6px' }} 
            />
            Construacero<span>Carabobo</span>
          </a>
          <p className="footer-desc">
            Proveedores siderúrgicos líderes de acero, cabillas, vigas y perfiles estructurales de máxima calidad y resistencia en la Región Central.
          </p>
          <div className="social-links">
            <a 
              href="https://www.instagram.com/construacerocarabobo/" 
              target="_blank" 
              rel="noreferrer" 
              className="social-btn" 
              aria-label="Instagram"
            >
              <svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m8.4 2.25a.75.75 0 0 1 .75.75.75.75 0 0 1-.75.75.75.75 0 0 1-.75-.75.75.75 0 0 1 .75-.75M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2 - Quick Links */}
        <div className="footer-column">
          <h3>Enlaces Rápidos</h3>
          <ul className="footer-links">
            {standalone ? (
              <>
                <li><a href="/">Inicio</a></li>
                <li><a href="/#productos">Materiales Suministrados</a></li>
                <li><a href="/#nosotros">Sobre Nosotros</a></li>
              </>
            ) : (
              <>
                <li><a href="#">Inicio</a></li>
                <li><a href="#productos">Materiales Suministrados</a></li>
                <li><a href="#nosotros">Sobre Nosotros</a></li>
                <li>
                  <a href="?cotizar=true" onClick={navigateToCotizar} style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    Cotizar en Línea
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Column 3 - Direct Contact */}
        <div className="footer-column">
          <h3>Contacto Directo</h3>
          <ul className="contact-info-list">
            <li className="contact-info-item">
              <span className="contact-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', verticalAlign: 'middle', display: 'inline-block' }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span><strong>Ubicación:</strong> Zona Industrial Aeropuerto, al frente del supermercado Hiperlider, Vía Flor Amarillo. Valencia, Edo. Carabobo, Venezuela.</span>
            </li>
            
            <li className="contact-info-item">
              <span className="contact-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', verticalAlign: 'middle', display: 'inline-block' }}>
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </span>
              <span>
                <strong>WhatsApp de Ventas:</strong><br />
                📞 <a href="https://wa.me/584244594724" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 700 }}>0424-459-4724</a> (Principal)<br />
                📞 <a href="https://wa.me/584244556736" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 700 }}>0424-455-6736</a><br />
                📞 <a href="https://wa.me/584124416005" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 700 }}>0412-441-6005</a><br />
                📞 <a href="https://wa.me/584144805129" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 700 }}>0414-480-5129</a>
              </span>
            </li>
            
            <li className="contact-info-item">
              <span className="contact-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', verticalAlign: 'middle', display: 'inline-block' }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <span><strong>Email:</strong> <a href="mailto:j501159130@gmail.com" style={{ color: 'var(--text-muted)', transition: 'var(--transition-smooth)' }} onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent)')} onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>j501159130@gmail.com</a></span>
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="container copyright">
        <p>&copy; 2026 Construacero Carabobo. Todos los derechos reservados.</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#ff3b30' }}>❤</span> Hecho para el sector metalúrgico de Venezuela.
        </p>
      </div>
    </footer>
  );
}
