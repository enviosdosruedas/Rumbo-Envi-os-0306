-- =====================================================
-- RUMBO ENVÍOS - AGREGAR CAMPOS DE COORDENADAS
-- =====================================================

-- Agregar campos de coordenadas como texto para almacenar lat,lng
ALTER TABLE public.envios 
ADD COLUMN IF NOT EXISTS coordenadas_origen text,
ADD COLUMN IF NOT EXISTS coordenadas_destino text,
ADD COLUMN IF NOT EXISTS telefono_origen text,
ADD COLUMN IF NOT EXISTS telefono_destino text,
ADD COLUMN IF NOT EXISTS nombre_destinatario text,
ADD COLUMN IF NOT EXISTS email_destinatario text,
ADD COLUMN IF NOT EXISTS fecha_programada date,
ADD COLUMN IF NOT EXISTS hora_programada time,
ADD COLUMN IF NOT EXISTS propina_requerida boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notas text;

-- Agregar campos de configuración de punto de recogida a la tabla de configuración de empresa
ALTER TABLE public.configuracion_empresa
ADD COLUMN IF NOT EXISTS nombre_punto_recogida text DEFAULT 'Punto de Recogida Principal',
ADD COLUMN IF NOT EXISTS telefono_punto_recogida text,
ADD COLUMN IF NOT EXISTS direccion_punto_recogida text,
ADD COLUMN IF NOT EXISTS latitud_punto_recogida double precision,
ADD COLUMN IF NOT EXISTS longitud_punto_recogida double precision;

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_envios_coordenadas_origen ON public.envios(coordenadas_origen);
CREATE INDEX IF NOT EXISTS idx_envios_coordenadas_destino ON public.envios(coordenadas_destino);
CREATE INDEX IF NOT EXISTS idx_envios_telefono_origen ON public.envios(telefono_origen);
CREATE INDEX IF NOT EXISTS idx_envios_telefono_destino ON public.envios(telefono_destino);
CREATE INDEX IF NOT EXISTS idx_envios_fecha_programada ON public.envios(fecha_programada);

-- Actualizar configuración de empresa con datos de ejemplo para Mar del Plata
UPDATE public.configuracion_empresa 
SET 
  nombre_punto_recogida = 'Rumbo Envíos - Oficina Central',
  telefono_punto_recogida = '+54 223 123-4567',
  direccion_punto_recogida = 'Av. Independencia 1234, Mar del Plata, Buenos Aires',
  latitud_punto_recogida = -38.0171811,
  longitud_punto_recogida = -57.765342
WHERE es_configuracion_principal = true;
