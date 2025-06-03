import { createClient } from "@/lib/supabase/server"
import { PerfilForm } from "@/components/perfil/perfil-form"
import { PerfilStats } from "@/components/perfil/perfil-stats"
import { redirect } from "next/navigation"

export default async function PerfilPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Obtener datos del repartidor
  const { data: repartidor } = await supabase.from("repartidores").select("*").eq("user_auth_id", user.id).single()

  if (!repartidor) {
    redirect("/login")
  }

  // Obtener estadísticas del repartidor
  const { data: repartos } = await supabase.from("repartos").select("*").eq("repartidor_id", repartidor.id)

  const { data: envios } = await supabase.from("envios").select("*").eq("repartidor_id", repartidor.id)

  const stats = {
    totalRepartos: repartos?.length || 0,
    repartosCompletados: repartos?.filter((r) => r.estado === "completado").length || 0,
    totalEntregas: envios?.length || 0,
    entregasCompletadas: envios?.filter((e) => e.estado === "entregado").length || 0,
    kilometrosRecorridos: repartos?.reduce((acc, r) => acc + (r.kilometros_recorridos || 0), 0) || 0,
    fechaIngreso: repartidor.fecha_ingreso,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerfilForm repartidor={repartidor} user={user} />
        </div>
        <div>
          <PerfilStats stats={stats} />
        </div>
      </div>
    </div>
  )
}
