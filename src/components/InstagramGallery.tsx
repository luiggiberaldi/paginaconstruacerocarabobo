interface Post {
  id: number;
  image: string;
  likes: number;
  comments: number;
  text: string;
  url?: string;
}

const postsData: Post[] = [
  {
    id: 1,
    image: '/assets/instagram/post-1.jpg',
    likes: 142,
    comments: 18,
    text: 'Nueva carga de cabillas corrugadas de alta ductilidad. Diámetros de 1/2" y 3/8" listos en almacén.'
  },
  {
    id: 2,
    image: '/assets/instagram/post-2.jpg',
    likes: 98,
    comments: 11,
    text: 'Suministro industrial de vigas HEA, HEB e IPN para grandes infraestructuras civiles.'
  },
  {
    id: 3,
    image: '/assets/instagram/post-3.jpg',
    likes: 124,
    comments: 14,
    text: 'Perfiles de hierro y tubos estructurales Conduven. Alta resistencia en todas las medidas estándar.'
  },
  {
    id: 4,
    image: '/assets/instagram/post-4.jpg',
    likes: 87,
    comments: 7,
    text: 'Cemento Portland Tipo I de alta resistencia. El soporte idóneo para fundaciones pesadas.'
  },
  {
    id: 5,
    image: '/assets/instagram/post-5.jpg',
    likes: 112,
    comments: 9,
    text: 'Láminas de acero pulidas y planchones a medida para bases e ingeniería metalmecánica.'
  },
  {
    id: 6,
    image: '/assets/instagram/post-6.jpg',
    likes: 165,
    comments: 22,
    text: 'Mallas Trucson electrosoldadas para refuerzo de losas en pavimentos y edificaciones.'
  },
  {
    id: 7,
    image: '/assets/instagram/post-7.jpg',
    likes: 95,
    comments: 6,
    text: 'Tuberías de acero al carbono galvanizadas y sin costura para sistemas de fluidos de alta presión.'
  },
  {
    id: 8,
    image: '/assets/instagram/post-8.jpg',
    likes: 138,
    comments: 15,
    text: 'Ángulos y pletinas de hierro estructural. El complemento perfecto para la herrería industrial.'
  },
  {
    id: 9,
    image: '/assets/instagram/post-9.jpg',
    likes: 104,
    comments: 8,
    text: 'Láminas estriadas antideslizantes para rampas, escaleras y plataformas de tráfico pesado.'
  },
  {
    id: 10,
    image: '/assets/instagram/post-10.jpg',
    likes: 151,
    comments: 19,
    text: 'Despachos de gran envergadura coordinados a nivel nacional. La logística más confiable.'
  },
  {
    id: 11,
    image: '/assets/instagram/post-11.jpg',
    likes: 118,
    comments: 12,
    text: 'Atención personalizada para cotizaciones inmediatas vía WhatsApp. Rapidez siderúrgica.'
  },
  {
    id: 12,
    image: '/assets/instagram/post-12.jpg',
    likes: 172,
    comments: 25,
    text: 'Calidad certificada Construacero. Tu aliado de confianza para el suministro de materiales en Venezuela.'
  }
];

export function InstagramGallery() {
  return (
    <section id="catalogo" className="section-padding container reveal active">
      <div className="section-header">
        <h2>Catálogo de <span>Galería Real</span></h2>
        <p>Explora nuestras publicaciones más recientes de Instagram con fotos reales de los materiales que tenemos listos en inventario.</p>
      </div>

      <div className="gallery-grid">
        {postsData.map((post) => (
          <a 
            key={post.id} 
            href={post.url || "https://www.instagram.com/construacerocarabobo/"} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="gallery-item"
            style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
          >
            <img src={post.image} alt={`Publicación ${post.id}`} loading="lazy" />
            <div className="gallery-overlay">
              <div className="gallery-meta">
                <span>❤️ {post.likes}</span>
                <span>💬 {post.comments}</span>
              </div>
              <p className="gallery-text">{post.text}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

