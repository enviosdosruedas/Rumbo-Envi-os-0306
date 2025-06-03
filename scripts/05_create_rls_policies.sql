-- =====================================================
-- RUMBO ENVÍOS - POLÍTICAS RLS
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repartidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repartos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paradas_reparto ENABLE ROW LEVEL SECURITY;

-- Políticas para repartidores
CREATE POLICY "repartidores_select_own" ON public.repartidores
  FOR SELECT USING (user_auth_id = auth.uid());

CREATE POLICY "repartidores_update_own" ON public.repartidores
  FOR UPDATE USING (user_auth_id = auth.uid());

-- Políticas para repartos
CREATE POLICY "repartos_select_own" ON public.repartos
  FOR SELECT USING (
    repartidor_id IN (
      SELECT id FROM public.repartidores WHERE user_auth_id = auth.uid()
    )
  );

CREATE POLICY "repartos_insert_own" ON public.repartos
  FOR INSERT WITH CHECK (
    repartidor_id IN (
      SELECT id FROM public.repartidores WHERE user_auth_id = auth.uid()
    )
  );

CREATE POLICY "repartos_update_own" ON public.repartos
  FOR UPDATE USING (
    repartidor_id IN (
      SELECT id FROM public.repartidores WHERE user_auth_id = auth.uid()
    )
  );

-- Políticas para envíos
CREATE POLICY "envios_select_own" ON public.envios
  FOR SELECT USING (
    repartidor_id IN (
      SELECT id FROM public.repartidores WHERE user_auth_id = auth.uid()
    )
  );

CREATE POLICY "envios_insert_own" ON public.envios
  FOR INSERT WITH CHECK (
    repartidor_id IN (
      SELECT id FROM public.repartidores WHERE user_auth_id = auth.uid()
    )
  );

CREATE POLICY "envios_update_own" ON public.envios
  FOR UPDATE USING (
    repartidor_id IN (
      SELECT id FROM public.repartidores WHERE user_auth_id = auth.uid()
    )
  );

-- Políticas para paradas de reparto
CREATE POLICY "paradas_reparto_select_own" ON public.paradas_reparto
  FOR SELECT USING (
    reparto_id IN (
      SELECT r.id FROM public.repartos r
      JOIN public.repartidores rep ON r.repartidor_id = rep.id
      WHERE rep.user_auth_id = auth.uid()
    )
  );

CREATE POLICY "paradas_reparto_insert_own" ON public.paradas_reparto
  FOR INSERT WITH CHECK (
    reparto_id IN (
      SELECT r.id FROM public.repartos r
      JOIN public.repartidores rep ON r.repartidor_id = rep.id
      WHERE rep.user_auth_id = auth.uid()
    )
  );

CREATE POLICY "paradas_reparto_update_own" ON public.paradas_reparto
  FOR UPDATE USING (
    reparto_id IN (
      SELECT r.id FROM public.repartos r
      JOIN public.repartidores rep ON r.repartidor_id = rep.id
      WHERE rep.user_auth_id = auth.uid()
    )
  );

-- Políticas para empresas y clientes (solo lectura)
CREATE POLICY "empresas_select_all" ON public.empresas
  FOR SELECT USING (true);

CREATE POLICY "clientes_select_all" ON public.clientes
  FOR SELECT USING (true);
