import { createClient } from "@/lib/supabase/server"
import { MapaRutas } from "@/components/mapa/mapa-rutas"
import { FiltrosMapaRutas } from "@/components/mapa/filtros-mapa-rutas"
import { EstadisticasMapaRutas } from "@/components/mapa/estadisticas-mapa-rutas"

export default async function MapaRutasPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Obtener ID del repartidor
  const { data: repartidor } = await supabase.from("repartidores").select("id").eq("user_auth_id", user.id).single()

  if (!repartidor) return null

  // Obtener repartos activos con sus paradas
  const { data: repartos } = await supabase
    .from("repartos")
    .select(`
      *,
      repartidores (
        nombre,
        apellido,
        vehiculo
      ),
      paradas_reparto (
        *,
        envios (
          *,
          clientes (
            nombre,
            apellido,
            direccion,
            telefono,
            latitud,
            longitud
          )
        )
      )
    `)
    .eq("repartidor_id", repartidor.id)
    .in("estado", ["pendiente", "en_progreso"])
    .order("fecha", { ascending: false })

  // Obtener todas las empresas para mostrar puntos de origen
  const { data: empresas } = await supabase.from("empresas").select("*").eq("activa", true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mapa de Rutas</h1>
        <p className="text-gray-600">Visualiza y gestiona tus rutas de reparto en tiempo real</p>
      </div>

      <EstadisticasMapaRutas repartos={repartos || []} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FiltrosMapaRutas />
        </div>
        <div className="lg:col-span-3">
          <MapaRutas repartos={repartos || []} empresas={empresas || []} />
        </div>
      </div>
    </div>
  )
}
