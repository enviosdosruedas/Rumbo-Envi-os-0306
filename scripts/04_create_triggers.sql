-- =====================================================
-- RUMBO ENVÍOS - TRIGGERS
-- =====================================================

-- Aplicar triggers para updated_at a todas las tablas
CREATE TRIGGER update_empresas_updated_at 
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at 
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repartidores_updated_at 
  BEFORE UPDATE ON public.repartidores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repartos_updated_at 
  BEFORE UPDATE ON public.repartos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_envios_updated_at 
  BEFORE UPDATE ON public.envios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paradas_reparto_updated_at 
  BEFORE UPDATE ON public.paradas_reparto
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para generar número de seguimiento automáticamente
CREATE TRIGGER set_envios_tracking_number
  BEFORE INSERT ON public.envios
  FOR EACH ROW EXECUTE FUNCTION set_tracking_number();
