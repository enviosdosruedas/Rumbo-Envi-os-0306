"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation } from "lucide-react"

interface RepartoMapProps {
  paradas: any[]
}

export function RepartoMap({ paradas }: RepartoMapProps) {
  // En una implementación real, aquí integrarías Google Maps o Leaflet
  const abrirMapaCompleto = () => {
    if (paradas.length === 0) return

    // Crear URL para Google Maps con múltiples destinos
    const waypoints = paradas.map((p) => `${p.envios.clientes.latitud},${p.envios.clientes.longitud}`).join("|")

    const url = `https://www.google.com/maps/dir/?api=1&waypoints=${waypoints}&travelmode=driving`
    window.open(url, "_blank")
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Mapa de Ruta
          </div>
          <button onClick={abrirMapaCompleto} className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
            <Navigation className="mr-1 h-4 w-4" />
            Abrir en Maps
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Placeholder para el mapa */}
        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Mapa de Ruta</p>
            <p className="text-sm">{paradas.length} paradas programadas</p>
            <button
              onClick={abrirMapaCompleto}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver en Google Maps
            </button>
          </div>
        </div>

        {/* Lista resumida de paradas */}
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-900">Paradas programadas:</h4>
          <div className="space-y-1">
            {paradas.slice(0, 5).map((parada, index) => (
              <div key={parada.id} className="flex items-center text-sm">
                <div
                  className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${
                    parada.completada ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span className="truncate">
                  {parada.envios.clientes.nombre} - {parada.envios.direccion_destino}
                </span>
              </div>
            ))}
            {paradas.length > 5 && <div className="text-xs text-gray-500 ml-7">+{paradas.length - 5} paradas más</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
