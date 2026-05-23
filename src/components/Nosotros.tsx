export function Nosotros() {
  return (
    <section id="nosotros" className="section-padding bg-dark" style={{ backgroundColor: 'var(--bg-card)' }}>
      <div className="container about-grid reveal active">
        
        {/* Left Side: Images & Badge */}
        <div className="about-img-box">
          <div className="about-img-wrapper">
            <img src="/assets/about_steel.png" alt="Acero Estructural Construacero" />
          </div>
          <div className="about-badge">
            <div className="about-badge-icon">
              <svg style={{ width: '20px', height: '20px', stroke: 'currentColor', fill: 'none', strokeWidth: 3 }} viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="about-badge-text">
              <h4>Calidad Certificada</h4>
              <p>Resistencia bajo norma SENCAMER e ISO</p>
            </div>
          </div>
        </div>

        {/* Right Side: Copys and Features */}
        <div className="about-content">
          <h3>Trayectoria de Acero</h3>
          <h2>Compromiso Inquebrantable en Cada Despacho</h2>
          <p>
            En <strong>Construacero Carabobo</strong> nos especializamos en la distribución integral de materiales siderúrgicos para el sector construcción, metalmecánico e industrial de la región central del país.
          </p>
          <p>
            Nuestra misión es abastecer a contratistas, constructoras e ingenieros con los insumos exactos requeridos en sus cálculos estructurales, garantizando los más altos estándares de flexión y resistencia a la tracción.
          </p>
          
          <div className="about-features">
            
            {/* Feature 1 - Logistica */}
            <div className="about-feat-item">
              <span className="about-feat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', display: 'block' }}>
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </span>
              <div className="about-feat-text">
                <h4>Logística Nacional</h4>
                <p>Despachos eficientes a todo el territorio nacional, coordinados de forma directa y segura hasta tu obra o negocio.</p>
              </div>
            </div>

            {/* Feature 2 - Precios */}
            <div className="about-feat-item">
              <span className="about-feat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', display: 'block' }}>
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" />
                </svg>
              </span>
              <div className="about-feat-text">
                <h4>Precios de Distribuidor</h4>
                <p>Cotizaciones altamente competitivas adaptadas a presupuestos de pequeña y gran escala.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
