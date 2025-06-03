import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OptimizadorRuta } from "@/components/repartos/optimizador-ruta"

export default async function OptimizarRutaPage() {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("Error fetching session:", sessionError.message)
    redirect("/login")
  }

  if (!sessionData?.session) {
    redirect("/login")
  }

  // Safely get user data
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    console.error("Error fetching user:", userError?.message)
    redirect("/login")
  }

  const user = userData.user

  // Obtener configuración de empresa para punto de inicio
  const { data: configuracionEmpresa } = await supabase
    .from("configuracion_empresa")
    .select("*")
    .eq("es_configuracion_principal", true)
    .single()

  // Obtener repartos activos con sus relaciones válidas
  const { data: repartos, error } = await supabase
    .from("repartos")
    .select(
      `
      id,
      fecha,
      estado,
      repartidor_id,
      repartidores (id, nombre, apellido),
      paradas_reparto (
        id,
        orden,
        completada,
        envio_id,
        envios (
          id,
          direccion_destino,
          latitud_destino,
          longitud_destino,
          cliente_id,
          clientes (
            id,
            nombre,
            apellido,
            latitud,
            longitud
          )
        )
      )
    `,
    )
    .in("estado", ["pendiente", "en_progreso"])
    .order("fecha", { ascending: false })

  if (error) {
    console.error("Error cargando repartos:", error)
  }

  // Agregar configuración de empresa a los datos
  const repartosConEmpresa = (repartos || []).map((reparto) => ({
    ...reparto,
    configuracion_empresa: configuracionEmpresa,
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Optimizador de Rutas</h1>
      </div>

      <OptimizadorRuta repartos={repartosConEmpresa} />
    </div>
  )
}
