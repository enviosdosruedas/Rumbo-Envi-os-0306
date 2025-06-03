import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, CheckCircle, TrendingUp } from "lucide-react"

interface EstadisticasMapaRutasProps {
  repartos: any[]
}

export function EstadisticasMapaRutas({ repartos }: EstadisticasMapaRutasProps) {
  // Calcular estadísticas
  const totalRepartos = repartos.length
  const repartosEnProgreso = repartos.filter((r) => r.estado === "en_progreso").length
  const repartosPendientes = repartos.filter((r) => r.estado === "pendiente").length

  const totalParadas = repartos.reduce((acc, r) => acc + (r.paradas_reparto?.length || 0), 0)
  const paradasCompletadas = repartos.reduce(
    (acc, r) => acc + (r.paradas_reparto?.filter((p: any) => p.completada).length || 0),
    0,
  )

  const eficiencia = totalParadas > 0 ? Math.round((paradasCompletadas / totalParadas) * 100) : 0

  const estadisticas = [
    {
      title: "Repartos Activos",
      value: totalRepartos,
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: `${repartosEnProgreso} en progreso`,
    },
    {
      title: "Paradas Completadas",
      value: `${paradasCompletadas}/${totalParadas}`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: `${eficiencia}% de eficiencia`,
    },
    {
      title: "Repartos Pendientes",
      value: repartosPendientes,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      description: "Por iniciar",
    },
    {
      title: "Tiempo Promedio",
      value: "25 min",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Por parada",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {estadisticas.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
