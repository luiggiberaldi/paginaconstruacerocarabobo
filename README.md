# 🏗️ Construacero Carabobo — Plataforma Corporativa y Cotizador Inteligente

¡Bienvenido al repositorio oficial de **Construacero Carabobo**, el distribuidor mayorista líder en el suministro de acero, cabillas, vigas y materiales de construcción de la Región Central de Venezuela!

Esta plataforma ha sido desarrollada con los más altos estándares visuales y de rendimiento, operando como una aplicación web y **PWA (Progressive Web App)** de alto contraste con estética industrial premium.

---

## 🚀 Características Principales

### 1. 🛍️ Cotizador Inteligente Standalone 2.0 (`?cotizar=true`)
Una experiencia de usuario al estilo Amazon / MercadoLibre, optimizada para compras de insumos siderúrgicos:
* **Filtros por Categoría:** Panel lateral dinámico con ordenación automática por volumen de inventario y opción de búsqueda en tiempo real de categorías.
* **Ficha Técnica Integrada:** Fichas de especificaciones técnicas (normas COVENIN/ASTM, elasticidad, etc.) accesibles en un modal por producto.
* **Paginación Inteligente:** Control del catálogo de a 6 productos por página con barra de navegación compacta para optimizar la velocidad de carga.
* **Selector de Cantidad Premium:** Diseño compacto con feedback de foco dinámico y botón dinámico de papelera para remoción rápida de items.
* **Botón Flotante para Móviles:** Botón táctil en la esquina inferior derecha con contador integrado para saltar al carrito con un solo toque.

### 🔍 2. Motor de Búsqueda Avanzado para el Mercado Venezolano
Optimizado específicamente para el vocabulario de obras e ingeniería civil en Venezuela:
* **Fracciones Verbales:** Mapeo inteligente de búsquedas en español a fracciones matemáticas (ej. `"cabilla de media"` o `"media"` se resuelven a `1/2"`; `"tres octavos"` a `3/8"`; `"pulgada y media"` a `1 1/2"`).
* **Tokenización con Regex:** Preserva unidades fraccionarias complejas como un único token (ej: `"1 1/2"`) previniendo falsos positivos con otras cifras de especificaciones.
* **Diccionario de Sinónimos Locales:** Enlaza términos comunes del sector (ej. `viga` &rarr; `ipn`, `ipe`, `upn`; `malla` &rarr; `truckson`, `trucson`; `tubo` &rarr; `conduven`, `structural`).
* **Normalización de Texto:** Ignora acentos/diacríticos y estandariza las comillas de pulgadas (ej. `lámina`, `lamina`, `lamina 1.2"`, `lamina 1.2` coinciden de forma idéntica).
* **Búsqueda Multi-token (AND Logic):** Búsquedas en orden libre que validan todos los componentes del término.

### 💵 3. Sincronizador de Divisas en Vivo (BCV & Paralelo)
* **Precios Duales:** Los presupuestos se totalizan y visualizan de forma dual en **Dólares (USD)** y **Bolívares (Bs)**.
* **Tasa Oficial BCV:** Conectado directamente a las cotizaciones del Banco Central de Venezuela a través de redundancia en cascada y una caché local de 4 horas en `localStorage` para garantizar resiliencia.
* **Fórmula de Conversión Interna:** Las cuentas se procesan de forma matemática transparente al usuario (`precio_db × tasa_paralelo / tasa_bcv`).

### 📸 4. Galería de Instagram Interactiva
* **Instagram Live Feed:** Sección visual responsiva que emula las publicaciones más recientes del perfil oficial `@construacerocarabobo`.
* **Enlaces Seguros:** Cada imagen redirige al perfil oficial de la cuenta en una pestaña nueva, previniendo errores de posts eliminados o enlaces rotos.

### 📱 5. PWA (Progressive Web App) Ready
* **Instalación Directa:** CTA de instalación integrado en el navbar y cajón móvil.
* **Caché Offline:** Service worker activo que almacena recursos clave para permitir la visualización y generación de presupuestos sin conexión a internet.
* **Copia al Portapapeles:** Si el cliente genera su cotización mientras está offline, la app copia automáticamente el ticket estructurado de compra para enviarlo por WhatsApp al recuperar señal.

---

## 🛠️ Tecnologías Utilizadas

* **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
* **Base de Datos:** [Supabase](https://supabase.com/) (conectado a la vista pública optimizada `v_catalogo_publico`)
* **Animaciones:** Custom CSS Transitions + Bounce Cubic Beziers
* **Estilos:** Vanilla CSS (Sistema HSL adaptivo e industrial) + Tailwind CSS (para utilidades flotantes)
* **Iconografía:** Lucide React + Inline SVGs

---

## 💻 Ejecución Local

### Prerrequisitos
* Node.js (versión 18 o superior recomendada)

### Pasos para Configurar
1. Clona el repositorio:
   ```bash
   git clone https://github.com/luiggiberaldi/paginaconstruacerocarabobo.git
   cd paginaconstruacerocarabobo
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura tus variables de entorno en un archivo `.env` en la raíz del proyecto:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
   VITE_WHATSAPP_NUMBER=584244594724
   ```
4. Corre el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Para compilar una versión optimizada de producción:
   ```bash
   npm run build
   ```

---

## 🏛️ Estructura del Código Siderúrgico

* `src/components/Autocotizador.tsx` &mdash; Panel interactivo principal de cotización, lógica de checkout, búsqueda por fracciones e interfaz estilo Amazon.
* `src/components/AutocotizadorHelpers.ts` &mdash; Estructuras de datos, fichas de especificaciones técnicas y mapeo de categorías.
* `src/components/InstagramGallery.tsx` &mdash; Carrusel y grilla interactiva conectada al perfil oficial.
* `src/hooks/useTasaBcv.ts` &mdash; Hook reactivo que descarga, calcula y gestiona la tasa cambiaria oficial.
* `src/styles/autocotizador.css` &mdash; Hoja de estilos del cotizador (layout adaptable, botones, animaciones, checkout).
* `src/styles/sections.css` &mdash; Estilos generales de las secciones informativas y galería.
