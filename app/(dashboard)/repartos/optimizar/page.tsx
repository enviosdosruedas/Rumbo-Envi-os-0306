import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { OptimizadorRuta } from "@/components/repartos/optimizador-ruta"

export default async function OptimizarRutaPage() {
  const supabase = createServerComponentClient({ cookies })

  // Verificar autenticación
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Obtener repartos activos
  const { data: repartos, error } = await supabase
    .from("repartos")
    .select(
      `
      id,
      fecha,
      estado,
      repartidor_id,
      empresa_id,
      repartidores:repartidor_id (id, nombre, apellido),
      empresas:empresa_id (id, nombre, latitud_empresa, longitud_empresa),
      paradas_reparto (
        id,
        orden,
        completada,
        envios (
          id,
          direccion_destino,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Optimizador de Rutas</h1>
      </div>

      <OptimizadorRuta repartos={repartos || []} />
    </div>
  )
}
