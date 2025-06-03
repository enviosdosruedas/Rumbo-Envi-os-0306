import { createClient } from "@/lib/supabase/server"
import { NuevoRepartoForm } from "@/components/repartos/nuevo-reparto-form"

export default async function NuevoRepartoPage() {
  const supabase = await createClient()

  // Obtener empresas y clientes para el formulario
  const { data: empresas } = await supabase.from("empresas").select("*").eq("activa", true).order("nombre")

  const { data: clientes } = await supabase
    .from("clientes")
    .select(`
      *,
      empresas (nombre)
    `)
    .eq("activo", true)
    .order("nombre")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Reparto</h1>
        <p className="text-gray-600">Crea un reparto individual con paradas personalizadas</p>
      </div>

      <NuevoRepartoForm empresas={empresas || []} clientes={clientes || []} />
    </div>
  )
}
