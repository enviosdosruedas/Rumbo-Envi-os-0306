-- =====================================================
-- RUMBO ENVÍOS - TABLAS
-- =====================================================

-- Tabla de empresas
CREATE TABLE IF NOT EXISTS public.empresas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  direccion text,
  telefono text,
  email text,
  latitud_empresa double precision,
  longitud_empresa double precision,
  activa boolean DEFAULT true,
  codigo_empresa text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT empresas_pkey PRIMARY KEY (id)
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  apellido text,
  telefono text,
  email text,
  direccion text,
  latitud numeric,
  longitud numeric,
  empresa_id uuid,
  activo boolean DEFAULT true,
  codigo_cliente text,
  notas text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT clientes_pkey PRIMARY KEY (id),
  CONSTRAINT clientes_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE SET NULL
);

-- Tabla de repartidores
CREATE TABLE IF NOT EXISTS public.repartidores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_auth_id uuid NOT NULL UNIQUE,
  nombre text NOT NULL,
  apellido text NOT NULL,
  telefono text,
  vehiculo text,
  matricula text,
  activo boolean NOT NULL DEFAULT true,
  empresa_id uuid,
  email text,
  licencia_conducir text,
  fecha_ingreso date,
  salario_base numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT repartidores_pkey PRIMARY KEY (id),
  CONSTRAINT repartidores_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE SET NULL,
  CONSTRAINT repartidores_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabla de repartos
CREATE TABLE IF NOT EXISTS public.repartos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  repartidor_id uuid NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  estado estado_reparto NOT NULL DEFAULT 'pendiente',
  notas text,
  hora_inicio timestamp with time zone,
  hora_fin timestamp with time zone,
  kilometros_recorridos numeric,
  combustible_usado numeric,
  costo_total numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT repartos_pkey PRIMARY KEY (id),
  CONSTRAINT repartos_repartidor_id_fkey FOREIGN KEY (repartidor_id) REFERENCES public.repartidores(id) ON DELETE CASCADE
);

-- Tabla de envíos
CREATE TABLE IF NOT EXISTS public.envios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  numero_seguimiento text NOT NULL UNIQUE,
  cliente_id uuid NOT NULL,
  repartidor_id uuid,
  reparto_id uuid,
  direccion_origen text NOT NULL DEFAULT '',
  latitud_origen numeric NOT NULL,
  longitud_origen numeric NOT NULL,
  direccion_destino text NOT NULL,
  latitud_destino numeric NOT NULL,
  longitud_destino numeric NOT NULL,
  estado estado_envio NOT NULL DEFAULT 'pendiente',
  descripcion text,
  peso numeric,
  peso_kg numeric,
  valor_declarado numeric,
  precio numeric,
  fecha_estimada date,
  fecha_entrega timestamp with time zone,
  notas_entrega text,
  orden_parada integer,
  tipo_envio tipo_envio DEFAULT 'entrega',
  es_parada_origen boolean DEFAULT false,
  distancia_km numeric,
  tiempo_estimado_minutos numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT envios_pkey PRIMARY KEY (id),
  CONSTRAINT envios_reparto_id_fkey FOREIGN KEY (reparto_id) REFERENCES public.repartos(id) ON DELETE SET NULL,
  CONSTRAINT envios_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE,
  CONSTRAINT envios_repartidor_id_fkey FOREIGN KEY (repartidor_id) REFERENCES public.repartidores(id) ON DELETE SET NULL
);

-- Tabla de paradas de reparto
CREATE TABLE IF NOT EXISTS public.paradas_reparto (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reparto_id uuid NOT NULL,
  envio_id uuid NOT NULL,
  orden integer NOT NULL,
  completada boolean NOT NULL DEFAULT false,
  hora_llegada timestamp with time zone,
  hora_salida timestamp with time zone,
  hora_real_llegada timestamp with time zone,
  hora_real_salida timestamp with time zone,
  notas_parada text,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'asignado', 'en_progreso', 'completado', 'fallido')),
  firma_cliente text,
  foto_entrega text,
  tiempo_permanencia_minutos numeric,
  hora_estimada_llegada timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT paradas_reparto_pkey PRIMARY KEY (id),
  CONSTRAINT paradas_reparto_reparto_id_fkey FOREIGN KEY (reparto_id) REFERENCES public.repartos(id) ON DELETE CASCADE,
  CONSTRAINT paradas_reparto_envio_id_fkey FOREIGN KEY (envio_id) REFERENCES public.envios(id) ON DELETE CASCADE,
  CONSTRAINT paradas_reparto_unique_orden UNIQUE (reparto_id, orden)
);

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_clientes_empresa_id ON public.clientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_repartidores_user_auth_id ON public.repartidores(user_auth_id);
CREATE INDEX IF NOT EXISTS idx_repartidores_activo ON public.repartidores(activo);
CREATE INDEX IF NOT EXISTS idx_repartos_repartidor_id ON public.repartos(repartidor_id);
CREATE INDEX IF NOT EXISTS idx_repartos_fecha ON public.repartos(fecha);
CREATE INDEX IF NOT EXISTS idx_repartos_estado ON public.repartos(estado);
CREATE INDEX IF NOT EXISTS idx_envios_cliente_id ON public.envios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_envios_repartidor_id ON public.envios(repartidor_id);
CREATE INDEX IF NOT EXISTS idx_envios_reparto_id ON public.envios(reparto_id);
CREATE INDEX IF NOT EXISTS idx_envios_estado ON public.envios(estado);
CREATE INDEX IF NOT EXISTS idx_envios_numero_seguimiento ON public.envios(numero_seguimiento);
CREATE INDEX IF NOT EXISTS idx_paradas_reparto_reparto_id ON public.paradas_reparto(reparto_id);
CREATE INDEX IF NOT EXISTS idx_paradas_reparto_envio_id ON public.paradas_reparto(envio_id);
CREATE INDEX IF NOT EXISTS idx_paradas_reparto_orden ON public.paradas_reparto(reparto_id, orden);
