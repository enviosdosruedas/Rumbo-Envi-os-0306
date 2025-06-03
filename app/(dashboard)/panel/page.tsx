import { createClient } from "@/lib/supabase/server"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Obtener ID del repartidor
  const { data: repartidor } = await supabase.from("repartidores").select("id").eq("user_auth_id", user.id).single()

  if (!repartidor) return null

  // Obtener estadísticas
  const { data: repartos } = await supabase.from("repartos").select("*").eq("repartidor_id", repartidor.id)

  const { data: envios } = await supabase.from("envios").select("*").eq("repartidor_id", repartidor.id)

  const stats = {
    totalRepartos: repartos?.length || 0,
    repartosCompletados: repartos?.filter((r) => r.estado === "completado").length || 0,
    repartosPendientes: repartos?.filter((r) => r.estado === "pendiente").length || 0,
    totalEntregas: envios?.length || 0,
    entregasCompletadas: envios?.filter((e) => e.estado === "entregado").length || 0,
    entregasFallidas: envios?.filter((e) => e.estado === "fallido").length || 0,
    kilometrosRecorridos: repartos?.reduce((acc, r) => acc + (r.kilometros_recorridos || 0), 0) || 0,
    tiempoPromedioEntrega: 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel Principal</h1>
        <p className="text-gray-600">Resumen de tu actividad de reparto</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity repartidorId={repartidor.id} />
        </div>
        <div className="space-y-6">
          <WeatherWidget />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
