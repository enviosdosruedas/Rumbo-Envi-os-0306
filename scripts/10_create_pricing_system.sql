CREATE OR REPLACE FUNCTION calcular_precio_envio(
    p_tipo_servicio_id INTEGER,
    p_distancia_km DECIMAL
)
RETURNS TABLE(
    precio_base DECIMAL,
    precio_km_extra DECIMAL,
    precio_total DECIMAL,
    tarifa_aplicada TEXT
) AS $$
DECLARE
    v_tarifa RECORD;
    v_tipo_servicio RECORD;
    v_precio_base DECIMAL := 0;
    v_precio_km_extra DECIMAL := 0;
    v_precio_total DECIMAL := 0;
    v_tarifa_aplicada TEXT := '';
    v_km_extra DECIMAL := 0;
BEGIN
    -- Obtener información del tipo de servicio
    SELECT * INTO v_tipo_servicio 
    FROM tipos_servicio 
    WHERE id = p_tipo_servicio_id AND activo = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tipo de servicio no encontrado o inactivo';
    END IF;
    
    -- Buscar tarifa que corresponda a la distancia
    SELECT * INTO v_tarifa
    FROM tarifas_distancia 
    WHERE tipo_servicio_id = p_tipo_servicio_id
    AND p_distancia_km >= distancia_min_km 
    AND p_distancia_km <= distancia_max_km
    ORDER BY distancia_max_km ASC
    LIMIT 1;
    
    IF FOUND THEN
        -- Tarifa encontrada dentro del rango
        v_precio_base := v_tarifa.precio_rango;
        v_precio_km_extra := 0;
        v_tarifa_aplicada := 'Rango: ' || v_tarifa.distancia_min_km || '-' || v_tarifa.distancia_max_km || ' km';
    ELSE
        -- No hay tarifa exacta, buscar la tarifa más alta y calcular km extra
        SELECT * INTO v_tarifa
        FROM tarifas_distancia 
        WHERE tipo_servicio_id = p_tipo_servicio_id
        ORDER BY distancia_max_km DESC
        LIMIT 1;
        
        IF FOUND THEN
            v_precio_base := v_tarifa.precio_rango;
            v_km_extra := p_distancia_km - v_tarifa.distancia_max_km;
            
            IF v_km_extra > 0 THEN
                v_precio_km_extra := v_km_extra * v_tipo_servicio.precio_extra_km_default;
            END IF;
            
            v_tarifa_aplicada := 'Base: ' || v_tarifa.distancia_min_km || '-' || v_tarifa.distancia_max_km || ' km + ' || ROUND(v_km_extra, 2) || ' km extra';
        ELSE
            -- No hay tarifas para este servicio
            RAISE EXCEPTION 'No hay tarifas configuradas para este tipo de servicio';
        END IF;
    END IF;
    
    v_precio_total := v_precio_base + v_precio_km_extra;
    
    -- Retornar resultado
    precio_base := v_precio_base;
    precio_km_extra := v_precio_km_extra;
    precio_total := v_precio_total;
    tarifa_aplicada := v_tarifa_aplicada;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
