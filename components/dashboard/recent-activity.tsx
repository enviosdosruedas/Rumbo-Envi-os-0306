import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { Package, Clock } from "lucide-react"

interface RecentActivityProps {
  repartidorId: string
}

export async function RecentActivity({ repartidorId }: RecentActivityProps) {
  const supabase = await createClient()

  const { data: repartos } = await supabase
    .from("repartos")
    .select(`
      *,
      paradas_reparto (
        *,
        envios (
          *,
          clientes (nombre, apellido, direccion)
        )
      )
    `)
    .eq("repartidor_id", repartidorId)
    .order("created_at", { ascending: false })
    .limit(5)

  const getEstadoBadge = (estado: string) => {
    const variants = {
      pendiente: "secondary",
      en_progreso: "default",
      completado: "default",
      cancelado: "destructive",
    } as const

    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800",
      en_progreso: "bg-blue-100 text-blue-800",
      completado: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800",
    } as const

    return (
      <Badge className={colors[estado as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {estado.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {repartos && repartos.length > 0 ? (
            repartos.map((reparto) => (
              <div key={reparto.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Reparto del {new Date(reparto.fecha).toLocaleDateString("es-ES")}</p>
                    <p className="text-sm text-gray-500">{reparto.paradas_reparto?.length || 0} paradas</p>
                  </div>
                </div>
                <div className="text-right">
                  {getEstadoBadge(reparto.estado)}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(reparto.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No hay actividad reciente</p>
              <p className="text-sm">Crea tu primer reparto para comenzar</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
