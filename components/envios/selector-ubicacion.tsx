"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Search } from "lucide-react"

interface Coordenadas {
  lat: number
  lng: number
}

interface SelectorUbicacionProps {
  onUbicacionSeleccionada: (direccion: string, coordenadas: Coordenadas) => void
}

export function SelectorUbicacion({ onUbicacionSeleccionada }: SelectorUbicacionProps) {
  const [open, setOpen] = useState(false)
  const [direccionBusqueda, setDireccionBusqueda] = useState("")
  const [loading, setLoading] = useState(false)
  const [resultados, setResultados] = useState<
    Array<{
      direccion: string
      coordenadas: Coordenadas
    }>
  >([])

  // Simulación de geocodificación - en producción usar Google Maps API
  const buscarUbicacion = async () => {
    if (!direccionBusqueda.trim()) return

    setLoading(true)

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Resultados simulados
    const resultadosSimulados = [
      {
        direccion: `${direccionBusqueda}, Ciudad, País`,
        coordenadas: {
          lat: -34.6037 + (Math.random() - 0.5) * 0.1,
          lng: -58.3816 + (Math.random() - 0.5) * 0.1,
        },
      },
      {
        direccion: `${direccionBusqueda} (Alternativa), Ciudad, País`,
        coordenadas: {
          lat: -34.6037 + (Math.random() - 0.5) * 0.1,
          lng: -58.3816 + (Math.random() - 0.5) * 0.1,
        },
      },
    ]

    setResultados(resultadosSimulados)
    setLoading(false)
  }

  const seleccionarUbicacion = (direccion: string, coordenadas: Coordenadas) => {
    onUbicacionSeleccionada(direccion, coordenadas)
    setOpen(false)
    setDireccionBusqueda("")
    setResultados([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon">
          <MapPin className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Ubicación</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="busqueda">Buscar Dirección</Label>
            <div className="flex gap-2">
              <Input
                id="busqueda"
                value={direccionBusqueda}
                onChange={(e) => setDireccionBusqueda(e.target.value)}
                placeholder="Ingresa una dirección..."
                onKeyPress={(e) => e.key === "Enter" && buscarUbicacion()}
              />
              <Button onClick={buscarUbicacion} disabled={loading}>
                {loading ? "..." : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {resultados.length > 0 && (
            <div className="space-y-2">
              <Label>Resultados:</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {resultados.map((resultado, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => seleccionarUbicacion(resultado.direccion, resultado.coordenadas)}
                  >
                    <div className="font-medium text-sm">{resultado.direccion}</div>
                    <div className="text-xs text-gray-500">
                      Lat: {resultado.coordenadas.lat.toFixed(6)}, Lng: {resultado.coordenadas.lng.toFixed(6)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            💡 En producción, esto se integrará con Google Maps para obtener ubicaciones reales
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
