import { createClient } from "@/lib/supabase/server"
import { RepartoPorLoteForm } from "@/components/repartos/reparto-por-lote-form"

export default async function RepartoPorLotePage() {
  const supabase = await createClient()

  // Obtener empresas para el formulario
  const { data: empresas } = await supabase.from("empresas").select("*").eq("activa", true).order("nombre")

  // Obtener clientes agrupados por empresa
  const { data: clientes } = await supabase
    .from("clientes")
    .select(`
      *,
      empresas (id, nombre)
    `)
    .eq("activo", true)
    .order("nombre")

  // Agrupar clientes por empresa para facilitar la selección
  const clientesPorEmpresa: Record<string, any[]> = {}

  clientes?.forEach((cliente) => {
    const empresaId = cliente.empresa_id
    if (empresaId) {
      if (!clientesPorEmpresa[empresaId]) {
        clientesPorEmpresa[empresaId] = []
      }
      clientesPorEmpresa[empresaId].push(cliente)
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reparto por Lotes</h1>
        <p className="text-gray-600">Crea múltiples repartos de manera eficiente y optimizada</p>
      </div>

      <RepartoPorLoteForm empresas={empresas || []} clientesPorEmpresa={clientesPorEmpresa} />
    </div>
  )
}
