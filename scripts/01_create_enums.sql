-- =====================================================
-- RUMBO ENVÍOS - TIPOS ENUMERADOS
-- =====================================================

-- Enum para estados de envío
CREATE TYPE estado_envio AS ENUM (
  'pendiente',
  'asignado', 
  'en_transito',
  'entregado',
  'fallido',
  'cancelado'
);

-- Enum para estados de reparto
CREATE TYPE estado_reparto AS ENUM (
  'pendiente',
  'en_progreso', 
  'completado',
  'cancelado'
);

-- Enum para tipos de envío
CREATE TYPE tipo_envio AS ENUM (
  'origen',
  'entrega',
  'recogida'
);
