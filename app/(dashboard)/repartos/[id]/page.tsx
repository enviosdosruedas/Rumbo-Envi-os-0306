import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { RepartoHeader } from "@/components/repartos/reparto-header"
import { RepartoMap } from "@/components/repartos/reparto-map"
import { ParadasList } from "@/components/repartos/paradas-list"
import { RepartoActions } from "@/components/repartos/reparto-actions"

interface RepartoDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RepartoDetailPage({ params }: RepartoDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Obtener reparto con todos los detalles
  const { data: reparto } = await supabase
    .from("repartos")
    .select(`
      *,
      repartidores (
        nombre,
        apellido,
        vehiculo,
        telefono
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
    .eq("id", id)
    .single()

  if (!reparto) {
    notFound()
  }

  // Ordenar paradas por orden
  const paradasOrdenadas = reparto.paradas_reparto?.sort((a, b) => a.orden - b.orden) || []

  return (
    <div className="space-y-6">
      <RepartoHeader reparto={reparto} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ParadasList paradas={paradasOrdenadas} repartoId={reparto.id} />
          <RepartoActions reparto={reparto} />
        </div>

        <div className="lg:sticky lg:top-6">
          <RepartoMap paradas={paradasOrdenadas} />
        </div>
      </div>
    </div>
  )
}
