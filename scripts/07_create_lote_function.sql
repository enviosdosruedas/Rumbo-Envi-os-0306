-- Función para generar reparto por lote
CREATE OR REPLACE FUNCTION generar_reparto_lote(
  p_repartidor_id uuid,
  p_fecha date,
  p_empresa_id uuid,
  p_clientes_ids uuid[],
  p_notas text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_reparto_id uuid;
  v_empresa record;
  v_cliente record;
  v_envio_id uuid;
  v_parada_id uuid;
  v_orden integer := 0;
  v_cliente_anterior record;
  v_tracking_number text;
  v_result jsonb;
BEGIN
  -- Validaciones
  IF p_repartidor_id IS NULL OR p_fecha IS NULL OR p_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Faltan datos obligatorios: repartidor, fecha o empresa';
  END IF;
  
  IF array_length(p_clientes_ids, 1) IS NULL OR array_length(p_clientes_ids, 1) = 0 THEN
    RAISE EXCEPTION 'Debe seleccionar al menos un cliente';
  END IF;
  
  -- Verificar que el repartidor existe y está activo
  PERFORM id FROM public.repartidores 
  WHERE id = p_repartidor_id AND activo = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Repartidor no encontrado o inactivo';
  END IF;
  
  -- Obtener datos de la empresa
  SELECT * INTO v_empresa FROM public.empresas WHERE id = p_empresa_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Empresa no encontrada';
  END IF;
  
  -- Iniciar transacción
  BEGIN
    -- 1. Crear el reparto
    INSERT INTO public.repartos (
      repartidor_id, 
      fecha, 
      estado, 
      notas
    ) VALUES (
      p_repartidor_id,
      p_fecha,
      'pendiente',
      p_notas
    ) RETURNING id INTO v_reparto_id;
    
    -- 2. Crear parada 0 (empresa - punto de partida)
    v_tracking_number := 'ORIGEN-' || substring(v_reparto_id::text, 1, 8);
    
    INSERT INTO public.envios (
      cliente_id,
      direccion_origen,
      latitud_origen,
      longitud_origen,
      direccion_destino,
      latitud_destino,
      longitud_destino,
      estado,
      descripcion,
      fecha_estimada,
      repartidor_id,
      reparto_id,
      tipo_envio,
      es_parada_origen,
      orden_parada,
      numero_seguimiento
    ) VALUES (
      p_clientes_ids[1], -- Temporal, se usa el primer cliente
      v_empresa.direccion,
      v_empresa.latitud_empresa,
      v_empresa.longitud_empresa,
      v_empresa.direccion,
      v_empresa.latitud_empresa,
      v_empresa.longitud_empresa,
      'asignado',
      'Punto de partida - ' || v_empresa.nombre,
      p_fecha,
      p_repartidor_id,
      v_reparto_id,
      'origen',
      true,
      0,
      v_tracking_number
    ) RETURNING id INTO v_envio_id;
    
    INSERT INTO public.paradas_reparto (
      reparto_id,
      envio_id,
      orden,
      estado,
      notas_parada,
      completada
    ) VALUES (
      v_reparto_id,
      v_envio_id,
      0,
      'asignado',
      'Punto de partida - ' || v_empresa.nombre,
      false
    ) RETURNING id INTO v_parada_id;
    
    -- 3. Crear paradas para cada cliente (1 a N)
    v_cliente_anterior := v_empresa;
    
    FOR i IN 1..array_length(p_clientes_ids, 1) LOOP
      v_orden := i;
      
      -- Obtener datos del cliente
      SELECT * INTO v_cliente FROM public.clientes WHERE id = p_clientes_ids[i];
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Cliente % no encontrado', i;
      END IF;
      
      -- Crear envío
      v_tracking_number := substring(v_reparto_id::text, 1, 8) || '-' || lpad(i::text, 3, '0');
      
      INSERT INTO public.envios (
        cliente_id,
        direccion_origen,
        latitud_origen,
        longitud_origen,
        direccion_destino,
        latitud_destino,
        longitud_destino,
        estado,
        descripcion,
        fecha_estimada,
        repartidor_id,
        reparto_id,
        tipo_envio,
        es_parada_origen,
        orden_parada,
        numero_seguimiento
      ) VALUES (
        v_cliente.id,
        v_cliente_anterior.direccion,
        v_cliente_anterior.latitud,
        v_cliente_anterior.longitud,
        v_cliente.direccion,
        v_cliente.latitud,
        v_cliente.longitud,
        'asignado',
        'Entrega a ' || v_cliente.nombre || ' ' || COALESCE(v_cliente.apellido, ''),
        p_fecha,
        p_repartidor_id,
        v_reparto_id,
        'entrega',
        false,
        v_orden,
        v_tracking_number
      ) RETURNING id INTO v_envio_id;
      
      -- Crear parada de reparto
      INSERT INTO public.paradas_reparto (
        reparto_id,
        envio_id,
        orden,
        estado,
        notas_parada,
        completada
      ) VALUES (
        v_reparto_id,
        v_envio_id,
        v_orden,
        'asignado',
        'Entrega a ' || v_cliente.nombre || ' ' || COALESCE(v_cliente.apellido, '') || ' - ' || v_cliente.direccion,
        false
      );
      
      -- Actualizar cliente anterior para la siguiente iteración
      v_cliente_anterior := v_cliente;
    END LOOP;
    
    -- Preparar resultado
    v_result := jsonb_build_object(
      'success', true,
      'reparto', jsonb_build_object(
        'id', v_reparto_id,
        'fecha', p_fecha,
        'repartidor_id', p_repartidor_id,
        'total_paradas', array_length(p_clientes_ids, 1) + 1
      )
    );
    
    RETURN v_result;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql;
