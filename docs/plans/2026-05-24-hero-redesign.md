# Hero Section Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the main Hero header of the landing page to feature a modern, asymmetric layout styled with Industrial Luxe aesthetics: a fullscreen height, an industrial background image with a dark gradient overlay, rubbed-orange glowing CTAs, and a glassmorphic secondary button.

**Architecture:** Remove the static Instagram profile card mockup from the Hero grid. Structure the layout asymmetrically (taking 60% of the viewport width on the left). Define fullscreen min-height bounds, custom metallic/orange typography highlighting, and responsive typography scales in CSS.

**Tech Stack:** React, TypeScript, Vite, CSS Custom Properties.

---

### Task 1: Redesign React Component Markup

**Files:**
- Modify: `src/components/Hero.tsx`

**Step 1: Write the minimal JSX markup**

Replace the entire contents of `src/components/Hero.tsx` with the following clean asymmetrical structure:

```tsx
export function Hero() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '584244594724';
  const whatsappMessage = encodeURIComponent('¡Hola! Vengo de la página web y deseo solicitar un presupuesto para materiales siderúrgicos al mayor.');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">
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
          
          <div className="hero-ctas">
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary hero-btn-whatsapp"
            >
              <span>Contactar por WhatsApp</span>
              <svg style={{ width: '18px', height: '18px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </a>
            
            <a href="#productos" className="btn btn-secondary hero-btn-catalog">
              Ver Catálogo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify compilation and syntax**

Run: `npm run build`
Expected output: successful compilation with Vite, showing no TypeScript or linting errors.

**Step 3: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "feat(hero): restructure hero markup for asymmetrical layout"
```

---

### Task 2: Redesign Styling in CSS

**Files:**
- Modify: `src/styles/hero.css`

**Step 1: Implement full-width background, gradient overlays, and glowing/glassmorphic variables**

Replace the entire contents of `src/styles/hero.css` with the following clean, responsive styles:

```css
/* Hero Section - Industrial Luxe Asymmetrical Layout */
.hero {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  /* Use the premium industrial about_steel image as background */
  background-image: url('/assets/about_steel.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  padding-top: 100px;
  padding-bottom: 60px;
}

/* Deep dark gradient overlay to ensure perfect text readability */
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(12, 14, 18, 0.95) 0%,
    rgba(12, 14, 18, 0.85) 45%,
    rgba(12, 14, 18, 0.4) 100%
  );
  z-index: 1;
}

.hero-container {
  position: relative;
  z-index: 2;
  width: 100%;
}

/* Asymmetric 60% width text block */
.hero-content {
  max-width: 60%;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  background-color: rgba(249, 115, 22, 0.08);
  border: 1px solid rgba(249, 115, 22, 0.2);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 6px 14px;
  border-radius: 99px;
  margin-bottom: 24px;
}

.hero-content h1 {
  font-family: var(--font-headings);
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.12;
  color: var(--text-main);
  text-transform: uppercase;
  margin-bottom: 24px;
  letter-spacing: -0.01em;
}

/* Molten steel orange gradient for keyword highlighting */
.hero-content h1 span {
  background: linear-gradient(135deg, #ff5722 0%, #ff8a50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.hero-content p {
  font-family: var(--font-body);
  font-size: 1.15rem;
  line-height: 1.65;
  color: var(--text-muted);
  margin-bottom: 40px;
  max-width: 580px;
}

.hero-ctas {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* WhatsApp CTA Button with Glowing Safety Orange Effect */
.hero-btn-whatsapp {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  box-shadow: 0 0 25px rgba(249, 115, 22, 0.35);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: none;
  cursor: pointer;
  padding: 14px 28px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.92rem;
  color: white;
}

.hero-btn-whatsapp:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 35px rgba(249, 115, 22, 0.6);
  filter: brightness(1.05);
}

/* Secondary Button with Glassmorphism Effect */
.hero-btn-catalog {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 14px 28px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.92rem;
  color: white !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.hero-btn-catalog:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-2px);
}

/* ─────────────────────────────────────────────────────────────
   RESPONSIVE DESIGN BREAKPOINTS
   ───────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .hero-content {
    max-width: 80%;
  }
  .hero-content h1 {
    font-size: 2.8rem;
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: 100vh;
    padding-top: 120px;
    padding-bottom: 60px;
    /* Centered overlay gradient for centered layout */
    background-position: 30% center;
  }
  
  .hero-overlay {
    background: linear-gradient(
      180deg,
      rgba(12, 14, 18, 0.95) 0%,
      rgba(12, 14, 18, 0.85) 100%
    );
  }

  .hero-content {
    max-width: 100%;
    align-items: center;
    text-align: center;
  }
  
  .hero-content h1 {
    font-size: 2.3rem;
  }
  
  .hero-content p {
    font-size: 1.05rem;
    margin-left: auto;
    margin-right: auto;
  }
}

@media (max-width: 480px) {
  .hero-content h1 {
    font-size: 1.95rem;
  }
  
  .hero-ctas {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
  
  .hero-btn-whatsapp,
  .hero-btn-catalog {
    width: 100%;
    justify-content: center;
    padding: 14px 20px;
  }
}
```

**Step 2: Verify build and look**

Run: `npm run build`
Expected: successful compilation.

**Step 3: Commit**

```bash
git add src/styles/hero.css
git commit -m "style(hero): update styles for fullscreen background and luxe CTAs"
```
