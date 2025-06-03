import { createClient } from "@/lib/supabase/server"
import { RepartosTable } from "@/components/repartos/repartos-table"
import { RepartosFilters } from "@/components/repartos/repartos-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function RepartosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Obtener ID del repartidor
  const { data: repartidor } = await supabase.from("repartidores").select("id").eq("user_auth_id", user.id).single()

  if (!repartidor) return null

  // Obtener repartos con detalles
  const { data: repartos } = await supabase
    .from("repartos")
    .select(`
      *,
      paradas_reparto (
        id,
        completada,
        envios (
          id,
          direccion_destino,
          clientes (nombre, apellido)
        )
      )
    `)
    .eq("repartidor_id", repartidor.id)
    .order("fecha", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Repartos</h1>
          <p className="text-gray-600">Gestiona todos tus repartos y entregas</p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link href="/repartos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Reparto
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/repartos/lote">
              <Plus className="mr-2 h-4 w-4" />
              Reparto por Lotes
            </Link>
          </Button>
        </div>
      </div>

      <RepartosFilters />
      <RepartosTable repartos={repartos || []} />
    </div>
  )
}
