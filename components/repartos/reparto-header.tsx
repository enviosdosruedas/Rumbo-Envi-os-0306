import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Truck, MapPin, Clock } from "lucide-react"

interface RepartoHeaderProps {
  reparto: any // Tipo completo del reparto con relaciones
}

export function RepartoHeader({ reparto }: RepartoHeaderProps) {
  const getEstadoBadge = (estado: string) => {
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

  const totalParadas = reparto.paradas_reparto?.length || 0
  const paradasCompletadas = reparto.paradas_reparto?.filter((p: any) => p.completada).length || 0
  const progreso = totalParadas > 0 ? Math.round((paradasCompletadas / totalParadas) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">
              Reparto del{" "}
              {new Date(reparto.fecha).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardTitle>
            <p className="text-gray-600 mt-1">ID: {reparto.id.slice(0, 8)}</p>
          </div>
          {getEstadoBadge(reparto.estado)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Repartidor</p>
              <p className="font-medium">
                {reparto.repartidores?.nombre} {reparto.repartidores?.apellido}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vehículo</p>
              <p className="font-medium">{reparto.repartidores?.vehiculo || "No especificado"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Paradas</p>
              <p className="font-medium">
                {paradasCompletadas}/{totalParadas}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progreso</p>
              <p className="font-medium">{progreso}%</p>
            </div>
          </div>
        </div>

        {reparto.notas && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Notas del reparto:</p>
            <p className="text-gray-900">{reparto.notas}</p>
          </div>
        )}

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progreso del reparto</span>
            <span>{progreso}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progreso}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
