-- =====================================================
-- RUMBO ENVÍOS - DATOS DE PRUEBA
-- =====================================================

-- Insertar empresas de ejemplo
INSERT INTO public.empresas (nombre, direccion, telefono, email, latitud_empresa, longitud_empresa) VALUES
('Empresa ABC Logística', 'Av. Corrientes 1234, CABA, Argentina', '+54 11 1234-5678', 'contacto@empresaabc.com', -34.6037, -58.3816),
('Distribuidora XYZ', 'Av. Santa Fe 5678, CABA, Argentina', '+54 11 8765-4321', 'info@distribuidoraxyz.com', -34.5956, -58.3772),
('Comercial Del Sur', 'Av. Rivadavia 9876, CABA, Argentina', '+54 11 5555-0000', 'ventas@comercialdelsur.com', -34.6118, -58.3960)
ON CONFLICT DO NOTHING;

-- Insertar clientes de ejemplo
INSERT INTO public.clientes (nombre, apellido, direccion, telefono, email, latitud, longitud, empresa_id) 
SELECT 
  'Juan', 'Pérez', 'Av. Rivadavia 1000, CABA', '+54 11 1111-1111', 'juan.perez@email.com', -34.6118, -58.3960, e.id
FROM public.empresas e WHERE e.nombre = 'Empresa ABC Logística'
UNION ALL
SELECT 
  'María', 'González', 'Av. Cabildo 2000, CABA', '+54 11 2222-2222', 'maria.gonzalez@email.com', -34.5601, -58.4601, e.id
FROM public.empresas e WHERE e.nombre = 'Empresa ABC Logística'
UNION ALL
SELECT 
  'Carlos', 'López', 'Av. Las Heras 3000, CABA', '+54 11 3333-3333', 'carlos.lopez@email.com', -34.5889, -58.3974, e.id
FROM public.empresas e WHERE e.nombre = 'Distribuidora XYZ'
UNION ALL
SELECT 
  'Ana', 'Martínez', 'Av. Belgrano 4000, CABA', '+54 11 4444-4444', 'ana.martinez@email.com', -34.6092, -58.3731, e.id
FROM public.empresas e WHERE e.nombre = 'Distribuidora XYZ'
UNION ALL
SELECT 
  'Luis', 'Rodríguez', 'Av. Callao 5000, CABA', '+54 11 5555-5555', 'luis.rodriguez@email.com', -34.5998, -58.3925, e.id
FROM public.empresas e WHERE e.nombre = 'Comercial Del Sur'
ON CONFLICT DO NOTHING;
