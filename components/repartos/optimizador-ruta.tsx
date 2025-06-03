"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MapaOptimizacion } from "@/components/repartos/mapa-optimizacion"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, Route, Save, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OptimizadorRutaProps {
  repartos: any[]
}

export function OptimizadorRuta({ repartos }: OptimizadorRutaProps) {
  const [repartoSeleccionado, setRepartoSeleccionado] = useState<string | null>(null)
  const [repartoActual, setRepartoActual] = useState<any>(null)
  const [rutaOriginal, setRutaOriginal] = useState<any[]>([])
  const [rutaOptimizada, setRutaOptimizada] = useState<any[]>([])
  const [distanciaOriginal, setDistanciaOriginal] = useState<number>(0)
  const [distanciaOptimizada, setDistanciaOptimizada] = useState<number>(0)
  const [optimizando, setOptimizando] = useState<boolean>(false)
  const [guardando, setGuardando] = useState<boolean>(false)
  const [optimizacionCompletada, setOptimizacionCompletada] = useState<boolean>(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Cuando cambia el reparto seleccionado
  useEffect(() => {
    if (repartoSeleccionado) {
      const reparto = repartos.find((r) => r.id === repartoSeleccionado)
      if (reparto) {
        setRepartoActual(reparto)

        // Ordenar paradas por orden actual
        const paradasOrdenadas = [...reparto.paradas_reparto].sort((a, b) => a.orden - b.orden)
        setRutaOriginal(paradasOrdenadas)
        setRutaOptimizada([])
        setDistanciaOriginal(0)
        setDistanciaOptimizada(0)
        setOptimizacionCompletada(false)
      }
    } else {
      setRepartoActual(null)
      setRutaOriginal([])
      setRutaOptimizada([])
    }
  }, [repartoSeleccionado, repartos])

  // Función para calcular distancia entre dos puntos (fórmula de Haversine)
  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Función para calcular la distancia total de una ruta
  const calcularDistanciaTotal = (ruta: any[], puntoInicio?: { lat: number; lng: number }) => {
    if (ruta.length < 2) return 0

    let distanciaTotal = 0
    let puntoAnterior = puntoInicio
      ? { lat: puntoInicio.lat, lng: puntoInicio.lng }
      : {
          lat: Number.parseFloat(ruta[0].envios.clientes.latitud),
          lng: Number.parseFloat(ruta[0].envios.clientes.longitud),
        }

    for (let i = 0; i < ruta.length; i++) {
      const puntoActual = {
        lat: Number.parseFloat(ruta[i].envios.clientes.latitud),
        lng: Number.parseFloat(ruta[i].envios.clientes.longitud),
      }

      distanciaTotal += calcularDistancia(puntoAnterior.lat, puntoAnterior.lng, puntoActual.lat, puntoActual.lng)

      puntoAnterior = puntoActual
    }

    return distanciaTotal
  }

  // Algoritmo para optimizar la ruta (Nearest Neighbor - vecino más cercano)
  const optimizarRuta = () => {
    if (!repartoActual || rutaOriginal.length < 2) return

    setOptimizando(true)
    setOptimizacionCompletada(false)

    // Simular procesamiento (en producción, podría ser un cálculo más complejo o una llamada a API)
    setTimeout(() => {
      try {
        // Punto de inicio (empresa o primera parada)
        let puntoInicio = null
        if (
          repartoActual.empresas &&
          repartoActual.empresas.latitud_empresa &&
          repartoActual.empresas.longitud_empresa
        ) {
          puntoInicio = {
            lat: Number.parseFloat(repartoActual.empresas.latitud_empresa),
            lng: Number.parseFloat(repartoActual.empresas.longitud_empresa),
          }
        }

        // Calcular distancia de la ruta original
        const distOriginal = calcularDistanciaTotal(rutaOriginal, puntoInicio)
        setDistanciaOriginal(distOriginal)

        // Algoritmo del vecino más cercano
        const paradasDisponibles = [...rutaOriginal]
        const rutaOptima = []

        // Punto actual comienza en el punto de inicio (empresa o primera parada)
        let puntoActual = puntoInicio
          ? { lat: puntoInicio.lat, lng: puntoInicio.lng }
          : {
              lat: Number.parseFloat(paradasDisponibles[0].envios.clientes.latitud),
              lng: Number.parseFloat(paradasDisponibles[0].envios.clientes.longitud),
            }

        // Si comenzamos desde la empresa, todas las paradas están disponibles
        // Si no hay punto de inicio, comenzamos desde la primera parada
        if (!puntoInicio && paradasDisponibles.length > 0) {
          rutaOptima.push(paradasDisponibles.shift()!)
        }

        // Mientras queden paradas por visitar
        while (paradasDisponibles.length > 0) {
          let indiceMasCercano = -1
          let distanciaMinima = Number.POSITIVE_INFINITY

          // Encontrar la parada más cercana al punto actual
          for (let i = 0; i < paradasDisponibles.length; i++) {
            const parada = paradasDisponibles[i]
            const distancia = calcularDistancia(
              puntoActual.lat,
              puntoActual.lng,
              Number.parseFloat(parada.envios.clientes.latitud),
              Number.parseFloat(parada.envios.clientes.longitud),
            )

            if (distancia < distanciaMinima) {
              distanciaMinima = distancia
              indiceMasCercano = i
            }
          }

          // Agregar la parada más cercana a la ruta
          if (indiceMasCercano !== -1) {
            const paradaMasCercana = paradasDisponibles.splice(indiceMasCercano, 1)[0]
            rutaOptima.push(paradaMasCercana)

            // Actualizar punto actual
            puntoActual = {
              lat: Number.parseFloat(paradaMasCercana.envios.clientes.latitud),
              lng: Number.parseFloat(paradaMasCercana.envios.clientes.longitud),
            }
          }
        }

        // Calcular distancia de la ruta optimizada
        const distOptimizada = calcularDistanciaTotal(rutaOptima, puntoInicio)
        setDistanciaOptimizada(distOptimizada)

        // Actualizar la ruta optimizada
        setRutaOptimizada(rutaOptima)
        setOptimizacionCompletada(true)
      } catch (error) {
        console.error("Error al optimizar ruta:", error)
        toast({
          title: "Error al optimizar",
          description: "No se pudo calcular la ruta óptima. Intente nuevamente.",
          variant: "destructive",
        })
      } finally {
        setOptimizando(false)
      }
    }, 1500)
  }

  // Guardar la ruta optimizada
  const guardarRutaOptimizada = async () => {
    if (!repartoActual || !rutaOptimizada.length) return

    setGuardando(true)

    try {
      // Actualizar el orden de las paradas
      const actualizaciones = rutaOptimizada.map((parada, index) => ({
        id: parada.id,
        orden: index + 1,
      }))

      // Actualizar en la base de datos
      const { error } = await supabase.from("paradas_reparto").upsert(actualizaciones)

      if (error) throw error

      toast({
        title: "Ruta optimizada guardada",
        description: `Se ha actualizado el orden de las paradas para el reparto #${repartoActual.id}`,
      })

      // Actualizar la ruta original con el nuevo orden
      setRutaOriginal([...rutaOptimizada])
    } catch (error) {
      console.error("Error al guardar ruta optimizada:", error)
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la ruta optimizada. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Route className="mr-2 h-5 w-5" />
            Optimizador de Rutas
          </CardTitle>
          <CardDescription>
            Optimiza el orden de las paradas para minimizar la distancia total del recorrido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Selector de reparto */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar Reparto</label>
              <Select value={repartoSeleccionado || ""} onValueChange={setRepartoSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un reparto..." />
                </SelectTrigger>
                <SelectContent>
                  {repartos.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No hay repartos disponibles
                    </SelectItem>
                  ) : (
                    repartos.map((reparto) => (
                      <SelectItem key={reparto.id} value={reparto.id}>
                        Reparto #{reparto.id} - {new Date(reparto.fecha).toLocaleDateString()} (
                        {reparto.paradas_reparto.length} paradas)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Información del reparto seleccionado */}
            {repartoActual && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Detalles del Reparto</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500">Fecha:</div>
                        <div>{new Date(repartoActual.fecha).toLocaleDateString()}</div>
                        <div className="text-gray-500">Estado:</div>
                        <div>
                          <Badge
                            className={
                              repartoActual.estado === "pendiente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }
                          >
                            {repartoActual.estado.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-gray-500">Repartidor:</div>
                        <div>
                          {repartoActual.repartidores?.nombre} {repartoActual.repartidores?.apellido}
                        </div>
                        <div className="text-gray-500">Paradas:</div>
                        <div>{rutaOriginal.length}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Comparación de Rutas</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500">Distancia Original:</div>
                        <div>
                          {distanciaOriginal > 0 ? `${distanciaOriginal.toFixed(2)} km` : "Pendiente de cálculo"}
                        </div>
                        <div className="text-gray-500">Distancia Optimizada:</div>
                        <div>
                          {distanciaOptimizada > 0 ? (
                            <span className="font-medium text-green-600">{distanciaOptimizada.toFixed(2)} km</span>
                          ) : (
                            "Pendiente de optimización"
                          )}
                        </div>
                        {distanciaOriginal > 0 && distanciaOptimizada > 0 && (
                          <>
                            <div className="text-gray-500">Ahorro:</div>
                            <div className="font-medium text-green-600">
                              {(((distanciaOriginal - distanciaOptimizada) / distanciaOriginal) * 100).toFixed(2)}% (
                              {(distanciaOriginal - distanciaOptimizada).toFixed(2)} km)
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={optimizarRuta} disabled={optimizando || rutaOriginal.length < 2}>
                    {optimizando ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Optimizando...
                      </>
                    ) : (
                      <>
                        <Route className="mr-2 h-4 w-4" />
                        Calcular Ruta Óptima
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setRutaOptimizada([])
                      setDistanciaOptimizada(0)
                      setOptimizacionCompletada(false)
                    }}
                    disabled={!rutaOptimizada.length || optimizando}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reiniciar
                  </Button>

                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={guardarRutaOptimizada}
                    disabled={!optimizacionCompletada || guardando}
                  >
                    {guardando ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Ruta Optimizada
                      </>
                    )}
                  </Button>
                </div>

                {/* Alertas */}
                {optimizacionCompletada && distanciaOptimizada < distanciaOriginal && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">¡Optimización exitosa!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      La ruta optimizada reduce la distancia en{" "}
                      <strong>{(distanciaOriginal - distanciaOptimizada).toFixed(2)} km</strong> (
                      {(((distanciaOriginal - distanciaOptimizada) / distanciaOriginal) * 100).toFixed(2)}% de ahorro).
                      Guarde los cambios para actualizar el orden de las paradas.
                    </AlertDescription>
                  </Alert>
                )}

                {optimizacionCompletada && distanciaOptimizada >= distanciaOriginal && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Ruta ya optimizada</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      La ruta actual ya parece estar optimizada. No se encontró una secuencia más eficiente.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Mapa de comparación */}
                <MapaOptimizacion
                  rutaOriginal={rutaOriginal}
                  rutaOptimizada={rutaOptimizada}
                  puntoInicio={
                    repartoActual.empresas?.latitud_empresa && repartoActual.empresas?.longitud_empresa
                      ? {
                          lat: Number.parseFloat(repartoActual.empresas.latitud_empresa),
                          lng: Number.parseFloat(repartoActual.empresas.longitud_empresa),
                          nombre: repartoActual.empresas.nombre,
                        }
                      : undefined
                  }
                />
              </div>
            )}

            {/* Mensaje cuando no hay reparto seleccionado */}
            {!repartoActual && (
              <div className="text-center py-8 text-gray-500">
                <Route className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Seleccione un reparto para optimizar su ruta</p>
                <p className="text-sm">
                  El sistema calculará la secuencia óptima de paradas para minimizar la distancia total
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
