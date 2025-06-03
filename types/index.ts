import type { Database } from "./database"

export type Empresa = Database["public"]["Tables"]["empresas"]["Row"]
export type Cliente = Database["public"]["Tables"]["clientes"]["Row"]
export type Repartidor = Database["public"]["Tables"]["repartidores"]["Row"]
export type Reparto = Database["public"]["Tables"]["repartos"]["Row"]
export type Envio = Database["public"]["Tables"]["envios"]["Row"]
export type ParadaReparto = Database["public"]["Tables"]["paradas_reparto"]["Row"]
export type ConfiguracionEmpresa = Database["public"]["Tables"]["configuracion_empresa"]["Row"]
export type ConfiguracionSistema = Database["public"]["Tables"]["configuracion_sistema"]["Row"]

export type EstadoEnvio = Database["public"]["Enums"]["estado_envio"]
export type EstadoReparto = Database["public"]["Enums"]["estado_reparto"]
export type TipoEnvio = Database["public"]["Enums"]["tipo_envio"]

export interface RepartoConDetalles extends Reparto {
  repartidor: Repartidor
  paradas: (ParadaReparto & {
    envio: Envio & {
      cliente: Cliente
    }
  })[]
}

export interface DashboardStats {
  totalRepartos: number
  repartosCompletados: number
  repartosPendientes: number
  totalEntregas: number
  entregasCompletadas: number
  entregasFallidas: number
  kilometrosRecorridos: number
  tiempoPromedioEntrega: number
}
