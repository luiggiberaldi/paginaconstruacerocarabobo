# Integración con Supabase (Catálogo Web)

Para que esta página web pueda consultar el inventario de **Construacero Carabobo** sin comprometer la seguridad ni exponer el `costo_usd`, **debes ejecutar el siguiente script SQL** en el SQL Editor de tu proyecto de Supabase.

### 1. Script SQL a ejecutar en Supabase

Este script crea una **Vista** segura de solo lectura para los productos y le otorga permisos al rol `anon` (usuarios no autenticados en la web pública).

```sql
-- 1. Crear una vista para el catálogo público (sin costo_usd ni datos sensibles)
CREATE OR REPLACE VIEW public.v_catalogo_publico AS
SELECT
  id,
  codigo,
  nombre,
  categoria,
  descripcion,
  unidad,
  precio_usd,
  imagen_url,
  activo
FROM public.productos
WHERE activo = true;

-- 2. Asegurar que la vista use los permisos del definidor (para saltar el RLS de la tabla base)
-- Ya que 'productos' está bloqueada para 'anon' por la política de seguridad
ALTER VIEW public.v_catalogo_publico SET (security_invoker = off);

-- 3. Otorgar permisos de lectura al rol público (anon)
GRANT SELECT ON public.v_catalogo_publico TO anon;
GRANT SELECT ON public.v_catalogo_publico TO authenticated;

-- Comentario para mantenimiento
COMMENT ON VIEW public.v_catalogo_publico IS 'Catálogo público para el autocotizador web. Omite costo_usd y muestra solo activos.';
```

### 2. Configurar Variables de Entorno

En esta aplicación web (Autocotizador), ve al apartado de **Settings / variables de entorno** y agrega las siguientes llaves (las mismas que usaste en `listo-pos-cotizaciones`):

- `VITE_SUPABASE_URL`: Tu URL del proyecto (ej: `https://xxx.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Tu clave pública `anon`

Una vez configurado, el frontend se conectará y listará los productos directamente de Supabase en tiempo real.
