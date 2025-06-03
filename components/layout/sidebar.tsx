"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, User, Truck, Plus, List, Map, Send, Route } from "lucide-react"
import type { Repartidor } from "@/types"

interface SidebarProps {
  repartidor: Repartidor | null
}

const navigation = [
  {
    name: "Panel Principal",
    href: "/panel",
    icon: LayoutDashboard,
  },
  {
    name: "Mis Repartos",
    href: "/repartos",
    icon: Package,
  },
  {
    name: "Nuevo Reparto",
    href: "/repartos/nuevo",
    icon: Plus,
  },
  {
    name: "Reparto por Lotes",
    href: "/repartos/lote",
    icon: List,
  },
  {
    name: "Optimizar Rutas",
    href: "/repartos/optimizar",
    icon: Route,
  },
  {
    name: "Generar Envíos",
    href: "/envios/generar",
    icon: Send,
  },
  {
    name: "Mapa de Rutas",
    href: "/mapa-rutas",
    icon: Map,
  },
  {
    name: "Mi Perfil",
    href: "/perfil",
    icon: User,
  },
]

export function Sidebar({ repartidor }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rumbo Envíos</h1>
            <p className="text-sm text-gray-500">Sistema de Repartos</p>
          </div>
        </div>
      </div>

      {repartidor && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {repartidor.nombre} {repartidor.apellido}
              </p>
              <p className="text-xs text-gray-500">{repartidor.vehiculo || "Sin vehículo"}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.name}
              variant={isActive ? "default" : "ghost"}
              className={cn("w-full justify-start", isActive && "bg-blue-600 text-white hover:bg-blue-700")}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
