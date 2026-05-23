import { useState, useEffect } from 'react';

interface HeaderProps {
  standalone?: boolean;
}

export function Header({ standalone = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // Handle scroll class toggle and section highlights (only on landing page)
  useEffect(() => {
    if (standalone) return;

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      const sections = ['productos', 'nosotros', 'catalogo'];
      let current = '';
      
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - 200;
          if (window.scrollY >= top) {
            current = sectionId;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [standalone]);

  // Listen to beforeinstallprompt event for PWA Installation CTA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Hide if already in standalone app mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header id="site-header" className={scrolled || standalone ? 'scrolled' : ''}>
        <div className="container nav-wrapper">
          
          {/* Logo link: home on standalone, # on landing */}
          <a href={standalone ? "/" : "#"} className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="/assets/logo.png" 
              alt="Construacero Logo" 
              style={{ height: '42px', width: 'auto', objectFit: 'contain', borderRadius: '6px' }} 
            />
            Construacero<span>Carabobo</span>
          </a>
          
          <ul className="nav-links">
            {standalone ? (
              <li>
                <a href="/" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  &larr; Volver al Inicio
                </a>
              </li>
            ) : (
              <>
                <li>
                  <a href="#" className={activeSection === '' ? 'active' : ''}>Inicio</a>
                </li>
                <li>
                  <a href="#productos" className={activeSection === 'productos' ? 'active' : ''}>Materiales</a>
                </li>
                <li>
                  <a href="#nosotros" className={activeSection === 'nosotros' ? 'active' : ''}>Nosotros</a>
                </li>
                <li>
                  <a href="?cotizar=true" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    Cotizar Online
                  </a>
                </li>
              </>
            )}
          </ul>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {showInstallBtn && (
              <button 
                className="pwa-install-btn nav-cta-install" 
                onClick={handleInstallClick}
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  display: 'inline-flex' 
                }}
              >
                <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
                </svg>
                <span>Instalar App</span>
              </button>
            )}

            {!standalone && (
              <a href="?cotizar=true" target="_blank" rel="noopener noreferrer" className="nav-cta" style={{ display: 'inline-block' }}>
                Solicitar Cotización
              </a>
            )}
          </div>

          <button 
            className="menu-toggle" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú"
            style={{ display: standalone ? 'none' : undefined }}
          >
            <svg style={{ width: '24px', height: '24px', fill: 'currentColor' }} viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`mobile-nav-overlay ${mobileMenuOpen ? 'active' : ''}`} 
        onClick={closeMobileMenu}
      />

      {/* Mobile Nav Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'active' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <a href="#" className="logo" onClick={closeMobileMenu}>
            Construacero<span>Carabobo</span>
          </a>
          <button 
            onClick={closeMobileMenu}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.8rem', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        <ul className="mobile-nav-links">
          {standalone ? (
            <li>
              <a href="/" style={{ color: 'var(--accent)' }} onClick={closeMobileMenu}>
                &larr; Volver al Inicio
              </a>
            </li>
          ) : (
            <>
              <li>
                <a href="#" className={activeSection === '' ? 'active' : ''} onClick={closeMobileMenu}>Inicio</a>
              </li>
              <li>
                <a href="#productos" className={activeSection === 'productos' ? 'active' : ''} onClick={closeMobileMenu}>Materiales</a>
              </li>
              <li>
                <a href="#nosotros" className={activeSection === 'nosotros' ? 'active' : ''} onClick={closeMobileMenu}>Nosotros</a>
              </li>
              <li>
                <a href="?cotizar=true" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }} onClick={closeMobileMenu}>
                  Cotizar Online
                </a>
              </li>
            </>
          )}
        </ul>

        {!standalone && (
          <a 
            href="?cotizar=true" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-cta" 
            onClick={closeMobileMenu} 
            style={{ marginTop: '20px', display: 'block', textAlign: 'center' }}
          >
            Solicitar Cotización
          </a>
        )}

        {showInstallBtn && (
          <div className="pwa-install-badge-mobile">
            <div className="pwa-badge-info">
              <h4>Construacero App</h4>
              <p>Instala en tu pantalla de inicio</p>
            </div>
            <button className="pwa-install-btn" onClick={handleInstallClick}>
              Instalar
            </button>
          </div>
        )}
      </div>
    </>
  );
}
