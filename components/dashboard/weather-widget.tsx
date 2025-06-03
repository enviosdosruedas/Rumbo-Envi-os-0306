"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Sun, CloudRain, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { ConfiguracionEmpresa } from "@/types"

export function WeatherWidget() {
  const [loading, setLoading] = useState(true)
  const [configuracion, setConfiguracion] = useState<ConfiguracionEmpresa | null>(null)
  const [weatherData, setWeatherData] = useState({
    temperature: 22,
    condition: "Soleado",
    humidity: 65,
    windSpeed: 12,
  })

  useEffect(() => {
    async function fetchConfiguracion() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("configuracion_empresa")
          .select("*")
          .eq("es_configuracion_principal", true)
          .single()

        setConfiguracion(data)

        // Simular datos de clima basados en la ubicación
        if (data) {
          // Determinar estación del año en el hemisferio sur
          const month = new Date().getMonth()
          const isWinter = month >= 5 && month <= 8 // Junio a Septiembre

          if (isWinter) {
            setWeatherData({
              temperature: Math.floor(Math.random() * 10) + 8, // 8-18°C en invierno
              condition: ["Nublado", "Lluvia ligera", "Parcialmente nublado", "Despejado"][
                Math.floor(Math.random() * 4)
              ],
              humidity: Math.floor(Math.random() * 20) + 70, // 70-90% humedad
              windSpeed: Math.floor(Math.random() * 15) + 10, // 10-25 km/h viento
            })
          } else {
            setWeatherData({
              temperature: Math.floor(Math.random() * 12) + 18, // 18-30°C en verano
              condition: ["Soleado", "Parcialmente nublado", "Despejado", "Caluroso"][Math.floor(Math.random() * 4)],
              humidity: Math.floor(Math.random() * 20) + 50, // 50-70% humedad
              windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 km/h viento
            })
          }
        }
      } catch (error) {
        console.error("Error al obtener configuración:", error)
        // Usar datos por defecto para Mar del Plata
        setConfiguracion({
          id: "",
          nombre_empresa: "Rumbo Envíos",
          ciudad: "Mar del Plata",
          provincia: "Buenos Aires",
          pais: "Argentina",
          codigo_postal: "7600",
          direccion_completa: "Mar del Plata, Buenos Aires, Argentina",
          latitud: -38.0171811,
          longitud: -57.765342,
          zona_horaria: "America/Argentina/Buenos_Aires",
          telefono_principal: null,
          email_principal: null,
          sitio_web: null,
          es_configuracion_principal: true,
          moneda: "ARS",
          idioma: "es",
          created_at: "",
          updated_at: "",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchConfiguracion()
  }, [])

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "soleado":
      case "despejado":
      case "caluroso":
        return <Sun className="h-8 w-8 text-yellow-500" />
      case "nublado":
      case "parcialmente nublado":
        return <Cloud className="h-8 w-8 text-gray-500" />
      case "lluvia":
      case "lluvia ligera":
        return <CloudRain className="h-8 w-8 text-blue-500" />
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />
    }
  }

  const getWeatherAdvice = () => {
    if (weatherData.temperature > 28) {
      return "🔥 Temperatura elevada, hidratarse bien y usar protector solar"
    } else if (weatherData.temperature < 10) {
      return "❄️ Temperatura baja, abrigarse bien y conducir con precaución"
    } else if (weatherData.condition.toLowerCase().includes("lluvia")) {
      return "🌧️ Lluvia presente, conducir con precaución y usar equipo impermeable"
    } else if (weatherData.windSpeed > 20) {
      return "💨 Viento fuerte, tener precaución al conducir"
    } else {
      return "☀️ Condiciones ideales para repartos"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clima Actual</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Clima en {configuracion?.ciudad || "Mar del Plata"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              {getWeatherIcon(weatherData.condition)}
              <span className="text-2xl font-bold">{weatherData.temperature}°C</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{weatherData.condition}</p>
            {configuracion && (
              <p className="text-xs text-gray-500 mt-1">
                {configuracion.provincia}, {configuracion.pais}
              </p>
            )}
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Humedad: {weatherData.humidity}%</p>
            <p>Viento: {weatherData.windSpeed} km/h</p>
            {configuracion && (
              <p className="text-xs mt-1">
                {configuracion.latitud.toFixed(4)}, {configuracion.longitud.toFixed(4)}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">{getWeatherAdvice()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
