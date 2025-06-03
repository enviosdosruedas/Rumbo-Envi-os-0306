"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Eye, RotateCcw } from "lucide-react"
import Link from "next/link"

interface MapaRutasProps {
  repartos: any[]
  empresas: any[]
}

export function MapaRutas({ repartos, empresas }: MapaRutasProps) {
  const [repartoSeleccionado, setRepartoSeleccionado] = useState<string | null>(null)
  const [vistaActual, setVistaActual] = useState<"mapa" | "lista">("mapa")

  const abrirEnGoogleMaps = (reparto: any) => {
    if (!reparto.paradas_reparto || reparto.paradas_reparto.length === 0) return

    // Encontrar empresa origen
    const empresa = empresas.find((e) => e.id === reparto.empresa_id) || empresas[0]
    const origen = empresa ? `${empresa.latitud_empresa},${empresa.longitud_empresa}` : ""

    // Crear waypoints con las paradas
    const waypoints = reparto.paradas_reparto
      .sort((a: any, b: any) => a.orden - b.orden)
      .map((p: any) => `${p.envios.clientes.latitud},${p.envios.clientes.longitud}`)
      .join("|")

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origen}&waypoints=${waypoints}&travelmode=driving`
    window.open(url, "_blank")
  }

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

  const calcularProgreso = (paradas: any[]) => {
    if (!paradas.length) return 0
    const completadas = paradas.filter((p) => p.completada).length
    return Math.round((completadas / paradas.length) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Controles del mapa */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Mapa de Rutas Activas
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={vistaActual === "mapa" ? "default" : "outline"}
                size="sm"
                onClick={() => setVistaActual("mapa")}
              >
                Mapa
              </Button>
              <Button
                variant={vistaActual === "lista" ? "default" : "outline"}
                size="sm"
                onClick={() => setVistaActual("lista")}
              >
                Lista
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {vistaActual === "mapa" ? (
            <div className="space-y-4">
              {/* Mapa simulado */}
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50"></div>
                <div className="relative z-10 text-center">
                  <MapPin className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Mapa Interactivo</h3>
                  <p className="text-gray-600 mb-4">
                    {repartos.length} repartos activos • {empresas.length} puntos de origen
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Navigation className="mr-2 h-4 w-4" />
                      Ver en Google Maps
                    </Button>
                    <Button size="sm" variant="outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Actualizar
                    </Button>
                  </div>
                </div>

                {/* Simulación de marcadores */}
                <div className="absolute top-4 left-4 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute top-12 right-8 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute bottom-8 left-12 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>

              {/* Leyenda */}
              <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Completado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">En Progreso</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Pendiente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Retrasado</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {repartos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No hay repartos activos</p>
                  <p className="text-sm">Los repartos aparecerán aquí cuando estén en progreso</p>
                </div>
              ) : (
                repartos.map((reparto) => {
                  const progreso = calcularProgreso(reparto.paradas_reparto || [])
                  return (
                    <div
                      key={reparto.id}
                      className={`p-4 border rounded-lg transition-all cursor-pointer ${
                        repartoSeleccionado === reparto.id ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"
                      }`}
                      onClick={() => setRepartoSeleccionado(repartoSeleccionado === reparto.id ? null : reparto.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <MapPin className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Reparto del {new Date(reparto.fecha).toLocaleDateString("es-ES")}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {reparto.repartidores?.nombre} {reparto.repartidores?.apellido} •{" "}
                              {reparto.paradas_reparto?.length || 0} paradas
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {getEstadoBadge(reparto.estado)}
                              <span className="text-xs text-gray-500">{progreso}% completado</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => abrirEnGoogleMaps(reparto)}>
                            <Navigation className="mr-2 h-4 w-4" />
                            Navegar
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/repartos/${reparto.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {repartoSeleccionado === reparto.id && (
                        <div className="mt-4 pt-4 border-t">
                          <h5 className="font-medium text-gray-900 mb-2">Paradas del reparto:</h5>
                          <div className="space-y-2">
                            {reparto.paradas_reparto
                              ?.sort((a: any, b: any) => a.orden - b.orden)
                              .slice(0, 5)
                              .map((parada: any) => (
                                <div key={parada.id} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        parada.completada ? "bg-green-500" : "bg-gray-300"
                                      }`}
                                    />
                                    <span>
                                      {parada.envios.clientes.nombre} - {parada.envios.direccion_destino}
                                    </span>
                                  </div>
                                  <Badge variant={parada.completada ? "default" : "secondary"} className="text-xs">
                                    {parada.completada ? "✓" : parada.orden}
                                  </Badge>
                                </div>
                              ))}
                            {(reparto.paradas_reparto?.length || 0) > 5 && (
                              <div className="text-xs text-gray-500">
                                +{(reparto.paradas_reparto?.length || 0) - 5} paradas más
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
