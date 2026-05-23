# 📋 BITÁCORA OFICIAL DE CAMBIOS — Construacero Carabobo
> **Ley de Registro Obligatorio**: Todo cambio realizado en este proyecto **DEBE** quedar documentado en este archivo con fecha, hora, descripción y archivos afectados.

---

## [2026-05-23] — Sesión 1: Refactorización Completa y Arquitectura React

### Trabajo Realizado
- **Migración completa** del proyecto a React + Vite + TypeScript con arquitectura modular.
- **Ley de las 600 líneas** instituida: ningún archivo de componente puede superar 600 líneas.
- Creación del sistema de estilos en `src/styles/` con 7 hojas CSS independientes.

### Archivos Creados
| Archivo | Descripción |
|---------|-------------|
| `src/components/Header.tsx` | Navbar con scroll-blur y drawer móvil |
| `src/components/Hero.tsx` | Banner con perfil de Instagram animado |
| `src/components/Stats.tsx` | Contadores con IntersectionObserver |
| `src/components/Materials.tsx` | Cuadrícula con SVGs industriales |
| `src/components/Nosotros.tsx` | Sección de historia y logística |
| `src/components/InstagramGallery.tsx` | Carrusel dinámico de posts reales |
| `src/components/Testimonials.tsx` | Reseñas de ingenieros y maestros |
| `src/components/Footer.tsx` | Pie de página con canales WA |
| `src/hooks/useTasaBcv.ts` | Hook de tasa BCV con caché 4h |
| `src/styles/base.css` | Variables CSS y reset global |
| `src/styles/navigation.css` | Header/drawer styles |
| `src/styles/hero.css` | Hero y perfil Instagram |
| `src/styles/sections.css` | Stats, Materials, Nosotros, Testimonials |
| `src/styles/autocotizador.css` | Catálogo, qty-ctrl, totales |
| `src/styles/footer.css` | Footer corporativo |
| `src/styles/pwa.css` | PWA install button, offline banner, modales |

---

## [2026-05-23] — Sesión 2: Autocotizador 2.0 PWA + Stepper

### Trabajo Realizado
- **Autocotizador 2.0** implementado con stepper de 3 pasos (Proyecto → Suministros → Confirmar).
- Detección de estado online/offline con banner flotante.
- Fichas técnicas detalladas (modal overlay) por producto.
- Tabs de categorías con scroll horizontal (sin scrollbar visible).
- Persistencia de carrito y datos de formulario en `localStorage`.
- Generación de ticket de cotización y envío directo por WhatsApp.
- Modo offline: copia al portapapeles y alerta al usuario.

### Archivos Modificados
| Archivo | Cambio |
|---------|--------|
| `src/components/Autocotizador.tsx` | Reescritura completa → 2.0 con stepper |
| `src/components/AutocotizadorHelpers.ts` | [NEW] Interfaces, fallback catalog, getProductSpecs |
| `src/components/AutocotizadorStep1.tsx` | [NEW] Step 1: datos del solicitante |
| `src/components/AutocotizadorStep3.tsx` | [NEW] Step 3: resumen y confirmación |
| `src/styles/pwa.css` | Estilos offline-banner, spec-modal, category-tabs |

### Archivos de Infraestructura PWA
| Archivo | Descripción |
|---------|-------------|
| `public/manifest.json` | Manifiesto PWA completo con shortcuts |
| `public/sw.js` | Service Worker con cache-first strategy |
| `src/main.tsx` | Registro del SW en el entry point |
| `index.html` | Meta tags PWA, Apple standalone, theme-color |

---

## [2026-05-23] — Sesión 3: Bugfixes de Consola

### Bugs Corregidos
| # | Error | Causa | Solución | Archivo |
|---|-------|-------|----------|---------|
| 1 | `TypeError: Cannot read properties of null (reading 'toLowerCase')` | Productos de Supabase con `nombre` o `codigo` = `null` | Guards `(product.nombre \|\| '').toLowerCase()` en `filteredProducts` useMemo | `Autocotizador.tsx:146-153` |
| 2 | `Manifest: found icon with no valid purpose; ignoring it` | `"purpose": "badge"` no es un valor W3C válido (solo: `any`, `maskable`, `monochrome`) | Cambiado a `"purpose": "any"` | `public/manifest.json:36` |
| 3 | `Invalid DOM property 'class'. Did you mean 'className'?` | Pendiente de identificar qué componente usa `class=` en JSX | — (monitorear en próxima sesión) |

---

## [Pendiente] — Próxima Sesión

- [x] ~~Identificar y corregir el `Invalid DOM property 'class'` restante en algún JSX.~~ — **Hero.tsx:19,97-102** (7 atributos `class=` → `className=`)
- [x] ~~Mejora visual del Autocotizador: inputs más elegantes, botones con mayor contraste.~~ — **Sesión 5: forms.css creado**

---

## [2026-05-23] — Sesión 5: Sistema de Formularios Premium

### Nuevo archivo: `src/styles/forms.css`
Sistema de diseño completo para todos los elementos de formulario del autocotizador.

| Clase CSS | Elemento | Mejora |
|-----------|----------|--------|
| `.form-input` | Inputs y textareas | Fondo glass dark, borde `rgba(255,255,255,0.10)`, ring naranja en focus, hover con borde más visible |
| `.form-label` | Labels | Uppercase + letra-espaciado, iconos SVG integrados, cambia a naranja al enfocar el input |
| `.form-group` | Contenedor | Flex column con gap, label reactivo al focus-within |
| `.btn-primary` | Botón principal | Gradiente naranja, sombra luminosa, `translateY(-2px)` al hover, disabled con 38% opacity |
| `.btn-secondary` | Botón secundario | Ghost con borde visible `rgba(255,255,255,0.14)`, hover refuerza el borde |
| `.quote-box` | Contenedor principal | Glass gradient, línea ambient naranja en el tope, sombra profunda |
| `.quote-info` | Panel izquierdo | Fondo `rgba(0,0,0,0.15)` con separador sutil |
| `.stepper-content-card` | Tarjeta de paso | Backdrop blur + borde apenas visible |

### Componentes actualizados
- **`AutocotizadorStep1.tsx`**: Labels con iconos SVG, `autoComplete` correcto, estructura limpia.
- **`AutocotizadorStep3.tsx`**: Textarea con label + ícono de edición.
- **`Autocotizador.tsx`**: Input de búsqueda con label + ícono de lupa.

### Verificación
- Build de producción: ✅ 0 errores · 3.45s · CSS: 32.14 kB
- [ ] Validar la vista SQL `v_catalogo_publico` en Supabase con inventario real.
- [ ] Generar los assets PWA reales (`icon-192x192.png`, `icon-512x512.png`, `badge.png`, screenshots).

---

## [2026-05-23] — Sesión 4: Precios en Bs. (BCV) como Principal

### Cambio de Lógica de Visualización de Precios
Los precios almacenados en `precio_usd` ahora se muestran **convertidos a Bs. mediante la tasa BCV** como precio principal en toda la interfaz. El valor USD queda como referencia secundaria.

| Componente | Antes | Ahora |
|-----------|-------|-------|
| Tarjetas de producto (Step 2) | `$12.50` grande / `Bs. 640.xx` pequeño | `Bs. 640.xx` grande / `$12.50 USD` pequeño |
| Subtotales en resumen (Step 3) | `$25.00` en naranja | `Bs. 1.280,00` en naranja / `$25.00 USD` pequeño |
| Total general (Step 3) | `$50.00` grande / `Bs. X` pequeño | `Bs. X` grande en naranja / `$50.00 USD` pequeño |
| Ticket WhatsApp | USD primero, luego VES | Bs. primero con tasa BCV, USD como referencia al final |

### Mejora de Estado de Carga
- Mientras `tasaBcv.cargando = true`, las tarjetas muestran `"Cargando..."` en vez de `Bs. 0,00` o precio incorrecto.

### Archivos Modificados
| Archivo | Líneas |
|---------|--------|
| `src/components/Autocotizador.tsx` | L183-198 (WhatsApp), L432-444 (tarjetas) |
| `src/components/AutocotizadorStep3.tsx` | L51-107 (lista ítems + total box) |

