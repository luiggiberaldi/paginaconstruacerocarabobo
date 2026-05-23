import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Materials } from './components/Materials';
import { Nosotros } from './components/Nosotros';
import { InstagramGallery } from './components/InstagramGallery';
import { Autocotizador } from './components/Autocotizador';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';

export default function App() {
  const [isCotizadorRoute, setIsCotizadorRoute] = useState(false);

  useEffect(() => {
    const handleRoute = () => {
      const search = window.location.search;
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (search.includes('cotizar') || hash.includes('cotizar') || path.includes('/cotizar')) {
        setIsCotizadorRoute(true);
      } else {
        setIsCotizadorRoute(false);
      }
    };

    // Run on mount
    handleRoute();

    // Listen to route changes
    window.addEventListener('popstate', handleRoute);
    window.addEventListener('hashchange', handleRoute);

    return () => {
      window.removeEventListener('popstate', handleRoute);
      window.removeEventListener('hashchange', handleRoute);
    };
  }, []);

  if (isCotizadorRoute) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-darker)' }}>
        {/* Dynamic notifications provider */}
        <Toaster position="top-center" theme="dark" />
        
        {/* Header in standalone mode (simplified links) */}
        <Header standalone={true} />
        
        <main className="flex-1" style={{ paddingTop: '100px' }}>
          {/* Standing Alone Autocotizador (Full-width Amazon visual grid) */}
          <Autocotizador />
        </main>

        {/* Footer in standalone mode */}
        <Footer standalone={true} />
      </div>
    );
  }

  // Normal landing page (Informational Site)
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-darker)' }}>
      {/* Dynamic notifications provider */}
      <Toaster position="top-center" theme="dark" />
      
      {/* Normal Site Header */}
      <Header standalone={false} />
      
      <main className="flex-1">
        {/* Hero Banner with Live Instagram Profile Card Mockup */}
        <Hero />
        
        {/* Animated Numerical Performance Counter Stats Bar */}
        <Stats />
        
        {/* Industrial Structural Materials Cards */}
        <Materials />
        
        {/* Trayectoria & Nosotros Section */}
        <Nosotros />
        
        {/* dynamic Scraped Instagram feed masonry */}
        {/* <InstagramGallery /> */}
        
        {/* Testimonials from master builders and engineers */}
        <Testimonials />
      </main>

      {/* Corporate Siderurgic Footer */}
      <Footer standalone={false} />
    </div>
  );
}
