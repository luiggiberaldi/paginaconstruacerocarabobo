export function Materials() {
  return (
    <section id="productos" className="section-padding container reveal active">
      <div className="section-header">
        <h2>Suministros <span>Siderúrgicos y Estructurales</span></h2>
        <p>Materiales con certificaciones de calidad y resistencia máxima para cualquier tipo de desarrollo e infraestructura.</p>
      </div>

      <div className="product-grid">
        
        {/* Card 1 - Cabillas */}
        <div className="product-card stagger-child">
          <div className="product-icon">
            <svg style={{ width: '24px', height: '24px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }} viewBox="0 0 24 24">
              <path d="M3 8h18M3 16h18" />
              <path d="M7 6v4M12 6v4M17 6v4M7 14v4M12 14v4M17 14v4" />
            </svg>
          </div>
          <h3>Cabillas de Refuerzo</h3>
          <p>Acero corrugado estriado de alta adherencia y ductilidad, ideal para armar estructuras de concreto armado y cimientos de obras civiles.</p>
          <ul className="product-specs">
            <li>Cabilla 3/8"</li>
            <li>Cabilla 1/2"</li>
            <li>Cabilla 5/8"</li>
            <li>Marca Sidetur / Sidor</li>
            <li>COVENIN 316</li>
          </ul>
        </div>

        {/* Card 2 - Vigas */}
        <div className="product-card stagger-child">
          <div className="product-icon">
            <svg style={{ width: '24px', height: '24px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }} viewBox="0 0 24 24">
              <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
              <path d="M4 9h16M4 15h16" />
              <path d="M10 3v18M14 3v18" />
            </svg>
          </div>
          <h3>Vigas Estructurales</h3>
          <p>Perfiles estructurales de acero pesado laminados en caliente para pórticos, puentes, galpones industriales y soportes de carga pesada.</p>
          <ul className="product-specs">
            <li>Vigas IPN / IPE</li>
            <li>Vigas UPL / UPN</li>
            <li>Viga WF (Wide Flange)</li>
            <li>Vigas HEB / HEA</li>
            <li>Norma ASTM A36</li>
          </ul>
        </div>

        {/* Card 3 - Láminas */}
        <div className="product-card stagger-child">
          <div className="product-icon">
            <svg style={{ width: '24px', height: '24px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }} viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="rgba(249, 115, 22, 0.15)" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
              <path d="M2 7l10 5 10-5" />
            </svg>
          </div>
          <h3>Láminas de Acero y Techo</h3>
          <p>Planchas de acero negro, pulido y estriado para metalmecánica, junto con sistemas Losacero y láminas de techo (Zinc y Termopaneles).</p>
          <ul className="product-specs">
            <li>Lámina Losacero 25</li>
            <li>Láminas Estriadas</li>
            <li>Hierro Negro / Pulido</li>
            <li>Zinc / Termopaneles</li>
          </ul>
        </div>

        {/* Card 4 - Cemento */}
        <div className="product-card stagger-child">
          <div className="product-icon">
            <svg style={{ width: '24px', height: '24px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }} viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <rect x="13" y="13" width="8" height="8" rx="1" />
              <path d="M8 7h.01M16 7h.01M7 17h.01M17 17h.01" strokeWidth="3" />
            </svg>
          </div>
          <h3>Cemento Gris Portland</h3>
          <p>Cemento Portland estructural ensacado de alta resistencia y fraguado rápido, ideal para vaciado de losas, vigas y bloques.</p>
          <ul className="product-specs">
            <li>Cemento Gris Portland</li>
            <li>Sacos de 42.5 kg</li>
            <li>Uso Estructural</li>
            <li>Norma COVENIN 28</li>
          </ul>
        </div>

        {/* Card 5 - Tuberías */}
        <div className="product-card stagger-child">
          <div className="product-icon">
            <svg style={{ width: '24px', height: '24px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }} viewBox="0 0 24 24">
              <circle cx="8" cy="16" r="4" />
              <circle cx="8" cy="16" r="1.5" />
              <circle cx="16" cy="16" r="4" />
              <circle cx="16" cy="16" r="1.5" />
              <circle cx="12" cy="8" r="4" />
              <circle cx="12" cy="8" r="1.5" />
            </svg>
          </div>
          <h3>Tuberías y Conexiones</h3>
          <p>Tuberías de acero estructural Conduven (cuadradas/rectangulares), tubos galvanizados conduit EMT y sistemas sanitarios PVC Tubrica.</p>
          <ul className="product-specs">
            <li>Tubo Conduven (Estructural)</li>
            <li>Tubería de Ventilación</li>
            <li>PVC Aguas Negras / Agua Fría</li>
            <li>Tubo EMT y Conexiones</li>
          </ul>
        </div>

        {/* Card 6 - Mallas y Alambres */}
        <div className="product-card stagger-child">
          <div className="product-icon">
            <svg style={{ width: '24px', height: '24px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }} viewBox="0 0 24 24">
              <path d="M5 3v18M12 3v18M19 3v18M3 5h18M3 12h18M3 19h18" />
            </svg>
          </div>
          <h3>Mallas, Alambres y Barras</h3>
          <p>Mallas electrosoldadas Truckson para losas, alambre de amarre recocido y galvanizado, junto con alambrón, zunchos y cerchas estructurales.</p>
          <ul className="product-specs">
            <li>Malla Truckson 4x4</li>
            <li>Alambre Galvanizado / Recocido</li>
            <li>Alambrón Estructural</li>
            <li>Zunchos y Cerchas</li>
          </ul>
        </div>

      </div>
    </section>
  );
}
