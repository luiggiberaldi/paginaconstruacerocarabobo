interface Testimonial {
  id: number;
  stars: string;
  content: string;
  avatar: string;
  name: string;
  role: string;
}

const testimonialsData: Testimonial[] = [
  {
    id: 1,
    stars: '★★★★★',
    content: 'Excelente servicio y cobertura a nivel nacional. Solicitamos un despacho de vigas IPN de gran tonelaje para nuestra obra y la entrega se coordinó en tiempo récord directo en sitio. Calidad certificada.',
    avatar: 'RM',
    name: 'Ing. Ricardo Mendoza',
    role: 'Gerente de Proyectos Civiles • Valencia'
  },
  {
    id: 2,
    stars: '★★★★★',
    content: 'Son nuestros proveedores exclusivos de cabillas y mallas electrosoldadas. Lo que más valoramos es la honestidad en el pesaje, la rapidez de respuesta por WhatsApp y los excelentes precios por lote mayorista.',
    avatar: 'GG',
    name: 'Arq. Gabriela Gómez',
    role: 'Directora de Desarrollos Residenciales'
  },
  {
    id: 3,
    stars: '★★★★★',
    content: 'Compramos tubos estructurales y perfiles Conduven al mayor para la fabricación de portones industriales. El acero viene limpio, sin óxido y cortado con precisión. La atención del equipo por WhatsApp es excelente.',
    avatar: 'CP',
    name: 'Ing. Carlos Peralta',
    role: 'Director General • Metalmecánica Guacara C.A.'
  },
  {
    id: 4,
    stars: '★★★★★',
    content: 'Llevo 12 años como maestro de obra en San Diego y Naguanagua. La cabilla corrugada que nos despacha Construacero Carabobo tiene la mejor ductilidad para el doblado y armado de cimientos estructurales. Suministro garantizado.',
    avatar: 'JR',
    name: 'Mro. José Gregorio Rivas',
    role: 'Maestro de Obra y Enfierrador Principal'
  }
];

export function Testimonials() {
  return (
    <section className="section-padding bg-dark container reveal active" style={{ borderRadius: '24px', padding: '60px', marginBottom: '100px', backgroundColor: 'var(--bg-card)' }}>
      <div className="section-header">
        <h2>Sólido <span>Respaldo Profesional</span></h2>
        <p>Lo que dicen ingenieros, maestros de obra y empresas metalúrgicas que confían en nuestro suministro de acero.</p>
      </div>

      <div className="testi-carousel">
        {testimonialsData.map((testi) => (
          <div key={testi.id} className="testi-card">
            <span className="testi-quote-icon">“</span>
            <div className="testi-rating">{testi.stars}</div>
            <p className="testi-content">{testi.content}</p>
            <div className="testi-user">
              <div className="testi-avatar">{testi.avatar}</div>
              <div className="testi-details">
                <h4>{testi.name}</h4>
                <p>{testi.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
