import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Package, CheckCircle, MapPin, Calendar, TrendingUp, Award } from "lucide-react"

interface PerfilStatsProps {
  stats: {
    totalRepartos: number
    repartosCompletados: number
    totalEntregas: number
    entregasCompletadas: number
    kilometrosRecorridos: number
    fechaIngreso: string | null
  }
}

export function PerfilStats({ stats }: PerfilStatsProps) {
  const eficienciaRepartos =
    stats.totalRepartos > 0 ? Math.round((stats.repartosCompletados / stats.totalRepartos) * 100) : 0
  const eficienciaEntregas =
    stats.totalEntregas > 0 ? Math.round((stats.entregasCompletadas / stats.totalEntregas) * 100) : 0

  const diasTrabajando = stats.fechaIngreso
    ? Math.floor((new Date().getTime() - new Date(stats.fechaIngreso).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const promedioKmPorDia = diasTrabajando > 0 ? (stats.kilometrosRecorridos / diasTrabajando).toFixed(1) : "0"

  const getNivelRepartidor = () => {
    if (stats.totalRepartos >= 100) return { nivel: "Experto", color: "bg-purple-100 text-purple-800", icon: "🏆" }
    if (stats.totalRepartos >= 50) return { nivel: "Avanzado", color: "bg-blue-100 text-blue-800", icon: "⭐" }
    if (stats.totalRepartos >= 20) return { nivel: "Intermedio", color: "bg-green-100 text-green-800", icon: "📈" }
    return { nivel: "Principiante", color: "bg-yellow-100 text-yellow-800", icon: "🌱" }
  }

  const nivelRepartidor = getNivelRepartidor()

  return (
    <div className="space-y-6">
      {/* Nivel del Repartidor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Nivel de Repartidor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl mb-2">{nivelRepartidor.icon}</div>
            <Badge className={`text-lg px-4 py-2 ${nivelRepartidor.color}`}>{nivelRepartidor.nivel}</Badge>
            <p className="text-sm text-gray-600 mt-2">{stats.totalRepartos} repartos completados</p>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Package className="mx-auto h-6 w-6 text-blue-600 mb-1" />
              <div className="text-2xl font-bold text-blue-600">{stats.totalRepartos}</div>
              <div className="text-xs text-gray-600">Repartos</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="mx-auto h-6 w-6 text-green-600 mb-1" />
              <div className="text-2xl font-bold text-green-600">{stats.entregasCompletadas}</div>
              <div className="text-xs text-gray-600">Entregas</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Eficiencia en Repartos</span>
                <span>{eficienciaRepartos}%</span>
              </div>
              <Progress value={eficienciaRepartos} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Eficiencia en Entregas</span>
                <span>{eficienciaEntregas}%</span>
              </div>
              <Progress value={eficienciaEntregas} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Información Adicional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Kilómetros Recorridos</span>
            <span className="font-medium">{stats.kilometrosRecorridos.toFixed(1)} km</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Promedio por Día</span>
            <span className="font-medium">{promedioKmPorDia} km/día</span>
          </div>

          {stats.fechaIngreso && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Días Trabajando</span>
              <span className="font-medium">{diasTrabajando} días</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Fecha de Ingreso</span>
            <span className="font-medium">
              {stats.fechaIngreso ? new Date(stats.fechaIngreso).toLocaleDateString("es-ES") : "No especificada"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Próximos Objetivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Próximos Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.totalRepartos < 20 && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-sm font-medium text-yellow-800">🎯 Alcanzar nivel Intermedio</div>
                <div className="text-xs text-yellow-600">{20 - stats.totalRepartos} repartos restantes</div>
              </div>
            )}

            {stats.totalRepartos >= 20 && stats.totalRepartos < 50 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">🎯 Alcanzar nivel Avanzado</div>
                <div className="text-xs text-blue-600">{50 - stats.totalRepartos} repartos restantes</div>
              </div>
            )}

            {stats.totalRepartos >= 50 && stats.totalRepartos < 100 && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-800">🎯 Alcanzar nivel Experto</div>
                <div className="text-xs text-purple-600">{100 - stats.totalRepartos} repartos restantes</div>
              </div>
            )}

            {stats.totalRepartos >= 100 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-800">🏆 ¡Felicitaciones! Eres un repartidor experto</div>
                <div className="text-xs text-green-600">Sigue manteniendo tu excelente trabajo</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
