"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, MapPin, Phone, Navigation } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ParadasListProps {
  paradas: any[]
  repartoId: string
}

export function ParadasList({ paradas, repartoId }: ParadasListProps) {
  const [updatingParada, setUpdatingParada] = useState<string | null>(null)

  // Simple calculations without memoization
  const completadas = paradas.filter((p) => p.completada).length
  const total = paradas.length
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0

  const handleMarcarCompletada = async (paradaId: string) => {
    setUpdatingParada(paradaId)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("paradas_reparto")
        .update({
          completada: true,
          hora_real_llegada: new Date().toISOString(),
          hora_real_salida: new Date().toISOString(),
          estado: "completado",
        })
        .eq("id", paradaId)

      if (error) throw error
      window.location.reload()
    } catch (error) {
      console.error("Error al marcar parada como completada:", error)
      alert("Error al marcar la parada como completada")
    } finally {
      setUpdatingParada(null)
    }
  }

  const handleAbrirNavegacion = (latitud: number, longitud: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}`
    window.open(url, "_blank")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Paradas del Reparto ({total})
          </div>
          <div className="text-sm text-gray-600">
            {completadas} de {total} completadas ({porcentaje}%)
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {total === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No hay paradas programadas</p>
            </div>
          ) : (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${porcentaje}%` }} />
              </div>

              {paradas.map((parada) => (
                <div
                  key={parada.id}
                  className={`p-4 border rounded-lg transition-all ${
                    parada.completada
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          parada.completada ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {parada.completada ? <CheckCircle className="h-4 w-4" /> : parada.orden}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {parada.envios.clientes.nombre} {parada.envios.clientes.apellido}
                          </h4>
                          <Badge variant={parada.completada ? "default" : "secondary"}>
                            {parada.completada ? "Completada" : "Pendiente"}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4" />
                            {parada.envios.direccion_destino}
                          </div>

                          {parada.envios.clientes.telefono && (
                            <div className="flex items-center">
                              <Phone className="mr-2 h-4 w-4" />
                              {parada.envios.clientes.telefono}
                            </div>
                          )}

                          {parada.hora_estimada_llegada && (
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              Estimada:{" "}
                              {new Date(parada.hora_estimada_llegada).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          )}
                        </div>

                        {parada.notas_parada && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Notas:</strong> {parada.notas_parada}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      {!parada.completada && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleAbrirNavegacion(parada.envios.clientes.latitud, parada.envios.clientes.longitud)
                            }
                            variant="outline"
                          >
                            <Navigation className="mr-2 h-4 w-4" />
                            Navegar
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleMarcarCompletada(parada.id)}
                            disabled={updatingParada === parada.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updatingParada === parada.id ? (
                              "Marcando..."
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Completar
                              </>
                            )}
                          </Button>
                        </>
                      )}

                      {parada.completada && (
                        <div className="text-xs text-green-600 text-right">
                          ✓ Completada
                          {parada.hora_real_llegada && (
                            <div>
                              {new Date(parada.hora_real_llegada).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
