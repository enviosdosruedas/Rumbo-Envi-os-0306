"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, MapPin, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface TipoServicio {
  id: number
  nombre: string
  descripcion: string
  precio_extra_km_default: number
}

interface CalculoPrecio {
  precio_base: number
  precio_km_extra: number
  precio_total: number
  tarifa_aplicada: string
}

interface CalculadoraPrecioProps {
  coordenadasOrigen: { lat: number; lng: number } | null
  coordenadasDestino: { lat: number; lng: number } | null
  onPrecioCalculado: (precio: CalculoPrecio & { tipo_servicio_id: number; distancia_km: number }) => void
}

export function CalculadoraPrecio({
  coordenadasOrigen,
  coordenadasDestino,
  onPrecioCalculado,
}: CalculadoraPrecioProps) {
  const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([])
  const [tipoServicioSeleccionado, setTipoServicioSeleccionado] = useState<number | null>(null)
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null)
  const [calculoPrecio, setCalculoPrecio] = useState<CalculoPrecio | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  // Cargar tipos de servicio
  useEffect(() => {
    const loadTiposServicio = async () => {
      try {
        const { data, error } = await supabase.from("tipos_servicio").select("*").eq("activo", true).order("nombre")

        if (error) throw error
        setTiposServicio(data || [])
      } catch (err) {
        console.error("Error cargando tipos de servicio:", err)
      }
    }

    loadTiposServicio()
  }, [supabase])

  // Calcular distancia cuando cambien las coordenadas
  useEffect(() => {
    if (coordenadasOrigen && coordenadasDestino) {
      const distancia = calcularDistanciaHaversine(
        coordenadasOrigen.lat,
        coordenadasOrigen.lng,
        coordenadasDestino.lat,
        coordenadasDestino.lng,
      )
      setDistanciaKm(distancia)
    } else {
      setDistanciaKm(null)
    }
  }, [coordenadasOrigen, coordenadasDestino])

  // Calcular precio automáticamente cuando cambien distancia o tipo de servicio
  useEffect(() => {
    if (tipoServicioSeleccionado && distanciaKm !== null) {
      calcularPrecio()
    }
  }, [tipoServicioSeleccionado, distanciaKm])

  const calcularDistanciaHaversine = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const calcularPrecio = async () => {
    if (!tipoServicioSeleccionado || distanciaKm === null) return

    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.rpc("calcular_precio_envio", {
        p_tipo_servicio_id: tipoServicioSeleccionado,
        p_distancia_km: distanciaKm,
      })

      if (error) throw error

      if (data && data.length > 0) {
        const resultado = data[0]
        setCalculoPrecio(resultado)
        onPrecioCalculado({
          ...resultado,
          tipo_servicio_id: tipoServicioSeleccionado,
          distancia_km: distanciaKm,
        })
      }
    } catch (err) {
      console.error("Error calculando precio:", err)
      setError("Error al calcular el precio. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(precio)
  }

  const servicioSeleccionado = tiposServicio.find((s) => s.id === tipoServicioSeleccionado)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculadora de Precio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Información de distancia */}
        {distanciaKm !== null && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Distancia calculada: <strong>{distanciaKm.toFixed(2)} km</strong>
            </span>
          </div>
        )}

        {!coordenadasOrigen || !coordenadasDestino ? (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Selecciona las ubicaciones de origen y destino para calcular el precio
            </p>
          </div>
        ) : (
          <>
            {/* Selector de tipo de servicio */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Servicio</label>
              <Select
                value={tipoServicioSeleccionado?.toString() || ""}
                onValueChange={(value) => setTipoServicioSeleccionado(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  {tiposServicio.map((servicio) => (
                    <SelectItem key={servicio.id} value={servicio.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{servicio.nombre}</span>
                        <span className="text-xs text-gray-500">{servicio.descripcion}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Información del servicio seleccionado */}
            {servicioSeleccionado && (
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800">{servicioSeleccionado.nombre}</h4>
                <p className="text-sm text-green-700 mt-1">{servicioSeleccionado.descripcion}</p>
                {servicioSeleccionado.precio_extra_km_default > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    Precio por km extra: {formatearPrecio(servicioSeleccionado.precio_extra_km_default)}
                  </p>
                )}
              </div>
            )}

            {/* Resultado del cálculo */}
            {calculoPrecio && (
              <div className="space-y-3">
                <div className="border-t pt-3">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Desglose de Precio
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Precio base:</span>
                      <span>{formatearPrecio(calculoPrecio.precio_base)}</span>
                    </div>

                    {calculoPrecio.precio_km_extra > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Kilómetros extra:</span>
                        <span>{formatearPrecio(calculoPrecio.precio_km_extra)}</span>
                      </div>
                    )}

                    <div className="border-t pt-2">
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total:</span>
                        <span className="text-green-600">{formatearPrecio(calculoPrecio.precio_total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      {calculoPrecio.tarifa_aplicada}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

            {loading && (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Calculando precio...</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
