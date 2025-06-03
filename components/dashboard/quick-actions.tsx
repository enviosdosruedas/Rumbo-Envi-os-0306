import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, List, Map, Package } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      title: "Nuevo Reparto",
      description: "Crear un reparto individual",
      href: "/repartos/nuevo",
      icon: Plus,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Reparto por Lotes",
      description: "Crear múltiples repartos",
      href: "/repartos/lote",
      icon: List,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Ver Mapa",
      description: "Visualizar rutas",
      href: "/mapa-rutas",
      icon: Map,
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Mis Repartos",
      description: "Ver todos los repartos",
      href: "/repartos",
      icon: Package,
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button key={index} asChild className={`h-auto p-4 flex flex-col items-center space-y-2 ${action.color}`}>
              <Link href={action.href}>
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium text-xs">{action.title}</p>
                  <p className="text-xs opacity-90">{action.description}</p>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
