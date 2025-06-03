"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from "lucide-react"
import type { Cliente, Empresa } from "@/types"

interface RutaOptimizadaProps {
  empresa: Empresa | null
  clientes: Cliente[]
  distanciaEstimada: number
  tiempoEstimado: number
}

export function RutaOptimizada({ empresa, clientes, distanciaEstimada, tiempoEstimado }: RutaOptimizadaProps) {
  const abrirMapaCompleto = () => {
    if (clientes.length === 0 || !empresa) return

    // Crear URL para Google Maps con múltiples destinos
    const origen = `${empresa.latitud_empresa},${empresa.longitud_empresa}`
    const destinos = clientes.map((c) => `${c.latitud},${c.longitud}`)

    // Tomar el primer destino como destino principal y el resto como waypoints
    const destino = destinos.shift()
    const waypoints = destinos.join("|")

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origen}&destination=${destino}&waypoints=${waypoints}&travelmode=driving`
    window.open(url, "_blank")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Ruta Optimizada
          </div>
          <Button variant="outline" size="sm" onClick={abrirMapaCompleto} disabled={clientes.length === 0 || !empresa}>
            <Navigation className="mr-2 h-4 w-4" />
            Ver en Maps
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Mapa simulado */}
          <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Ruta Optimizada</p>
              <p className="text-sm">{clientes.length} paradas programadas</p>
              <Button onClick={abrirMapaCompleto} className="mt-4" disabled={clientes.length === 0 || !empresa}>
                <Navigation className="mr-2 h-4 w-4" />
                Ver en Google Maps
              </Button>
            </div>
          </div>

          {/* Estadísticas de la ruta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Distancia total</p>
              <p className="text-xl font-bold">{distanciaEstimada.toFixed(1)} km</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Tiempo estimado</p>
              <p className="text-xl font-bold">{tiempoEstimado} min</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Paradas</p>
              <p className="text-xl font-bold">{clientes.length}</p>
            </div>
          </div>

          {/* Lista de paradas */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Secuencia de visitas:</h4>

            {/* Punto de origen */}
            {empresa && (
              <div className="flex items-center p-3 border rounded-lg bg-blue-50">
                <Badge variant="default" className="mr-3 bg-blue-600">
                  Origen
                </Badge>
                <div>
                  <p className="font-medium">{empresa.nombre}</p>
                  <p className="text-sm text-gray-600">{empresa.direccion}</p>
                </div>
              </div>
            )}

            {/* Clientes en orden */}
            {clientes.map((cliente, index) => (
              <div key={cliente.id} className="flex items-center p-3 border rounded-lg">
                <Badge variant="outline" className="mr-3">
                  {index + 1}
                </Badge>
                <div>
                  <p className="font-medium">
                    {cliente.nombre} {cliente.apellido}
                  </p>
                  <p className="text-sm text-gray-600">{cliente.direccion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
