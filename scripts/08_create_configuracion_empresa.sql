-- =====================================================
-- RUMBO ENVÍOS - CONFIGURACIÓN DE EMPRESA
-- =====================================================

-- Tabla de configuración general de la empresa
CREATE TABLE IF NOT EXISTS public.configuracion_empresa (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre_empresa text NOT NULL,
  ciudad text NOT NULL,
  provincia text NOT NULL,
  pais text NOT NULL,
  codigo_postal text,
  direccion_completa text,
  latitud double precision NOT NULL,
  longitud double precision NOT NULL,
  zona_horaria text DEFAULT 'America/Argentina/Buenos_Aires',
  telefono_principal text,
  email_principal text,
  sitio_web text,
  es_configuracion_principal boolean DEFAULT true,
  moneda text DEFAULT 'ARS',
  idioma text DEFAULT 'es',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT configuracion_empresa_pkey PRIMARY KEY (id)
);

-- Tabla de configuración general del sistema
CREATE TABLE IF NOT EXISTS public.configuracion_sistema (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clave text NOT NULL UNIQUE,
  valor text NOT NULL,
  descripcion text,
  tipo text DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
  categoria text DEFAULT 'general',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT configuracion_sistema_pkey PRIMARY KEY (id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_configuracion_empresa_principal ON public.configuracion_empresa(es_configuracion_principal);
CREATE INDEX IF NOT EXISTS idx_configuracion_sistema_clave ON public.configuracion_sistema(clave);
CREATE INDEX IF NOT EXISTS idx_configuracion_sistema_categoria ON public.configuracion_sistema(categoria);

-- Aplicar triggers para updated_at
CREATE TRIGGER update_configuracion_empresa_updated_at 
  BEFORE UPDATE ON public.configuracion_empresa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracion_sistema_updated_at 
  BEFORE UPDATE ON public.configuracion_sistema
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo para Mar del Plata
INSERT INTO public.configuracion_empresa (
  nombre_empresa,
  ciudad,
  provincia,
  pais,
  codigo_postal,
  direccion_completa,
  latitud,
  longitud,
  zona_horaria,
  telefono_principal,
  email_principal,
  es_configuracion_principal
) VALUES (
  'Rumbo Envíos Mar del Plata',
  'Mar del Plata',
  'Provincia de Buenos Aires',
  'Argentina',
  '7600',
  'Mar del Plata, Provincia de Buenos Aires, Argentina',
  -38.0171811,
  -57.765342,
  'America/Argentina/Buenos_Aires',
  '+54 223 123-4567',
  'info@rumboenvios.com.ar',
  true
) ON CONFLICT DO NOTHING;

-- Insertar configuraciones del sistema
INSERT INTO public.configuracion_sistema (clave, valor, descripcion, tipo, categoria) VALUES
('api_clima_key', '', 'Clave API para servicio de clima', 'string', 'integraciones'),
('distancia_maxima_reparto', '50', 'Distancia máxima en km para un reparto', 'number', 'repartos'),
('tiempo_estimado_por_parada', '15', 'Tiempo estimado en minutos por parada', 'number', 'repartos'),
('notificaciones_email', 'true', 'Habilitar notificaciones por email', 'boolean', 'notificaciones'),
('notificaciones_sms', 'false', 'Habilitar notificaciones por SMS', 'boolean', 'notificaciones'),
('horario_inicio_repartos', '08:00', 'Horario de inicio de repartos', 'string', 'horarios'),
('horario_fin_repartos', '18:00', 'Horario de fin de repartos', 'string', 'horarios')
ON CONFLICT (clave) DO NOTHING;

-- Políticas RLS
ALTER TABLE public.configuracion_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas para configuración de empresa (solo lectura para repartidores)
CREATE POLICY "configuracion_empresa_select_all" ON public.configuracion_empresa
  FOR SELECT USING (true);

-- Políticas para configuración del sistema (solo lectura para repartidores)
CREATE POLICY "configuracion_sistema_select_all" ON public.configuracion_sistema
  FOR SELECT USING (true);
