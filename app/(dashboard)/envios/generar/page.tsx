import { createClient } from "@/lib/supabase/server"
import { GenerarEnvioForm } from "@/components/envios/generar-envio-form"

export default async function GenerarEnvioPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Obtener ID del repartidor
  const { data: repartidor } = await supabase.from("repartidores").select("id").eq("user_auth_id", user.id).single()

  if (!repartidor) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generar Envíos</h1>
        <p className="text-gray-600">Crea un nuevo envío buscando o registrando un cliente</p>
      </div>

      <GenerarEnvioForm repartidorId={repartidor.id} />
    </div>
  )
}
