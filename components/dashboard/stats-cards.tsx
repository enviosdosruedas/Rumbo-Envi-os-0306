import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, CheckCircle, Clock, Truck, XCircle, MapPin, TrendingUp } from "lucide-react"
import type { DashboardStats } from "@/types"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Repartos",
      value: stats.totalRepartos,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Repartos Completados",
      value: stats.repartosCompletados,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Repartos Pendientes",
      value: stats.repartosPendientes,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Total Entregas",
      value: stats.totalEntregas,
      icon: Truck,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Entregas Exitosas",
      value: stats.entregasCompletadas,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Entregas Fallidas",
      value: stats.entregasFallidas,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Kilómetros Recorridos",
      value: `${stats.kilometrosRecorridos.toFixed(1)} km`,
      icon: MapPin,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Eficiencia",
      value:
        stats.totalEntregas > 0 ? `${((stats.entregasCompletadas / stats.totalEntregas) * 100).toFixed(1)}%` : "0%",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
