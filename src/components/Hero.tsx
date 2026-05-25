import { navigateToCotizar } from './AutocotizadorHelpers';

export function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        
        {/* Text Hero Column */}
        <div className="hero-content">
          <h2>
            <svg 
              style={{ width: '16px', height: '16px', stroke: 'currentColor', fill: 'none', strokeWidth: 2.5, verticalAlign: 'middle', marginRight: '8px', display: 'inline-block' }} 
              viewBox="0 0 24 24"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            CONEXIÓN SIDERÚRGICA DIRECTA
          </h2>
          <h1>Sigue Nuestro Despacho y Stock de Materiales en Vivo</h1>
          <p>Publicamos el día a día directamente desde nuestro patio de carga en Carabobo. Mira la llegada de nuevos lotes de cabillas, vigas, perfiles de hierro y mallas de refuerzo antes de solicitar tu presupuesto.</p>
          <div className="hero-ctas">
            <a href="?cotizar=true" onClick={navigateToCotizar} className="btn btn-primary">
              <span>Cotizar Materiales</span>
              <svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/construacerocarabobo/" target="_blank" rel="noreferrer" className="btn btn-secondary">Ver Comunidad</a>
          </div>
        </div>

        {/* Instagram Premium Card Column */}
        <div className="instagram-card">
          
          {/* IG Card Header */}
          <div className="ig-header-top">
            <div className="ig-avatar-wrapper">
              <div className="ig-avatar-ring"></div>
              <img className="ig-avatar" src="/assets/instagram/profile.jpg" alt="Construacero Carabobo" />
              <span className="ig-badge-live">ACTIVO</span>
            </div>
            
            <div className="ig-meta-stats">
              <div>
                <div className="ig-stat-val">133</div>
                <div className="ig-stat-lbl">Posts</div>
              </div>
              <div>
                <div className="ig-stat-val">9,447</div>
                <div className="ig-stat-lbl">Seguidores</div>
              </div>
              <div>
                <div className="ig-stat-val">1,560</div>
                <div className="ig-stat-lbl">Seguidos</div>
              </div>
            </div>
          </div>

          {/* Username, Badge, Bio */}
          <div className="ig-profile-info">
            <div className="ig-handle-row">
              <span className="ig-username">construacerocarabobo</span>
              <span className="ig-verified-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px', color: 'var(--steel-blue)' }}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </span>
            </div>
            <div className="ig-category">Ferretería Industrial • Suministros Sólidos</div>
            <div className="ig-bio">
              <span className="ig-bio-strong">Construacero Carabobo</span>
              🏢 Suministros siderúrgicos de alta resistencia.<br />
              🏗️ Cabillas, Vigas, Láminas y Perfiles a nivel nacional.<br />
              📦 Venta al Mayor y Detal para obras civiles.
            </div>
          </div>

          {/* Follow CTA Row */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <a 
              href="https://www.instagram.com/construacerocarabobo/" 
              target="_blank" 
              rel="noreferrer"
              style={{ flex: 1, backgroundColor: 'var(--accent)', color: 'white', textAlign: 'center', padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 4px 10px rgba(249,115,22,0.2)' }}
            >
              Seguir Perfil
            </a>
            <a 
              href="?cotizar=true" 
              onClick={navigateToCotizar}
              style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', textAlign: 'center', padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}
            >
              Enviar Mensaje
            </a>
          </div>

          {/* Mini Grid of Scraped Photos */}
          <div className="ig-mini-grid">
            <a href="#catalogo" className="ig-mini-photo"><img src="/assets/instagram/post-1.jpg" alt="Post 1" /></a>
            <a href="#catalogo" className="ig-mini-photo"><img src="/assets/instagram/post-2.jpg" alt="Post 2" /></a>
            <a href="#catalogo" className="ig-mini-photo"><img src="/assets/instagram/post-3.jpg" alt="Post 3" /></a>
            <a href="#catalogo" className="ig-mini-photo"><img src="/assets/instagram/post-4.jpg" alt="Post 4" /></a>
            <a href="#catalogo" className="ig-mini-photo"><img src="/assets/instagram/post-5.jpg" alt="Post 5" /></a>
            <a href="#catalogo" className="ig-mini-photo"><img src="/assets/instagram/post-6.jpg" alt="Post 6" /></a>
          </div>

        </div>

      </div>
    </section>
  );
}
