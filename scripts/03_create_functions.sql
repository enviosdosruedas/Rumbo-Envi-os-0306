-- =====================================================
-- RUMBO ENVÍOS - FUNCIONES
-- =====================================================

-- Función para obtener el ID del repartidor actual
CREATE OR REPLACE FUNCTION get_current_repartidor_id()
RETURNS uuid AS $$
DECLARE
  repartidor_id uuid;
  auth_id uuid;
BEGIN
  auth_id := auth.uid();
  
  SELECT id INTO repartidor_id
  FROM public.repartidores
  WHERE user_auth_id = auth_id
  AND activo = true
  LIMIT 1;
  
  RETURN repartidor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para generar número de seguimiento único
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS text AS $$
DECLARE
  tracking_number text;
  exists_check boolean;
BEGIN
  LOOP
    tracking_number := 'RE' || 
                      to_char(now(), 'YYYYMMDD') || 
                      lpad(floor(random() * 10000)::text, 4, '0');
    
    SELECT EXISTS(
      SELECT 1 FROM public.envios WHERE numero_seguimiento = tracking_number
    ) INTO exists_check;
    
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN tracking_number;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para asignar número de seguimiento
CREATE OR REPLACE FUNCTION set_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_seguimiento IS NULL OR NEW.numero_seguimiento = '' THEN
    NEW.numero_seguimiento = generate_tracking_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular distancia entre dos puntos geográficos
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 numeric, 
  lon1 numeric, 
  lat2 numeric, 
  lon2 numeric
)
RETURNS numeric AS $$
DECLARE
  R numeric := 6371;
  dLat numeric;
  dLon numeric;
  a numeric;
  c numeric;
  d numeric;
BEGIN
  lat1 := radians(lat1);
  lon1 := radians(lon1);
  lat2 := radians(lat2);
  lon2 := radians(lon2);
  
  dLat := lat2 - lat1;
  dLon := lon2 - lon1;
  
  a := sin(dLat/2) * sin(dLat/2) + cos(lat1) * cos(lat2) * sin(dLon/2) * sin(dLon/2);
  c := 2 * asin(sqrt(a));
  d := R * c;
  
  RETURN round(d::numeric, 2);
END;
$$ LANGUAGE plpgsql;
