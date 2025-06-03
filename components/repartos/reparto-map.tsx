"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Loader2 } from "lucide-react"

interface RepartoMapProps {
  paradas: any[]
}

declare global {
  interface Window {
    google: any
  }
}

export function RepartoMap({ paradas }: RepartoMapProps) {
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const directionsServiceRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)

  // Cargar Google Maps API
  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&map_ids=DEMO_MAP_ID`
      script.async = true
      script.defer = true
      script.onload = () => {
        setMapsLoaded(true)
      }
      document.head.appendChild(script)
    } else if (window.google) {
      setMapsLoaded(true)
    }
  }, [])

  // Inicializar mapa cuando se cargan las APIs
  useEffect(() => {
    if (mapsLoaded && mapRef.current && paradas.length > 0) {
      initializeMap()
    }
  }, [mapsLoaded, paradas])

  const initializeMap = () => {
    if (!mapRef.current || !window.google || paradas.length === 0) return

    // Crear mapa centrado en Mar del Plata, Argentina
    const defaultCenter = { lat: -38.01088591264159, lng: -57.59909874310361 }

    // Si hay paradas, centrar en la primera
    const firstStop = paradas[0]
    const center =
      firstStop && firstStop.envios.clientes.latitud && firstStop.envios.clientes.longitud
        ? {
            lat: Number.parseFloat(firstStop.envios.clientes.latitud),
            lng: Number.parseFloat(firstStop.envios.clientes.longitud),
          }
        : defaultCenter

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: center,
      mapTypeControl: false,
      streetViewControl: false,
      mapId: "DEMO_MAP_ID", // Required for Advanced Markers
    })

    // Crear servicios de direcciones
    directionsServiceRef.current = new window.google.maps.DirectionsService()
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#2563eb",
        strokeWeight: 4,
      },
    })

    directionsRendererRef.current.setMap(mapInstanceRef.current)

    // Crear marcadores para cada parada
    paradas.forEach((parada, index) => {
      const lat = Number.parseFloat(parada.envios.clientes.latitud)
      const lng = Number.parseFloat(parada.envios.clientes.longitud)

      if (!isNaN(lat) && !isNaN(lng)) {
        // Usar AdvancedMarkerElement si está disponible
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          const markerPosition = { lat, lng }

          // Crear elemento para el contenido del marcador
          const markerContent = document.createElement("div")
          markerContent.className = "marker-content"
          markerContent.innerHTML = `
            <div style="
              background-color: ${parada.completada ? "#10b981" : "#3b82f6"};
              color: white;
              border-radius: 50%;
              width: 30px;
              height: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${index + 1}
            </div>
          `

          // Crear marcador avanzado
          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position: markerPosition,
            content: markerContent,
            title: `${parada.envios.clientes.nombre} - ${parada.envios.direccion_destino}`,
          })

          // Crear info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold">${index + 1}. ${parada.envios.clientes.nombre}</h3>
                <p class="text-sm text-gray-600">${parada.envios.direccion_destino}</p>
                <p class="text-sm ${parada.completada ? "text-green-600" : "text-blue-600"}">
                  ${parada.completada ? "✅ Completada" : "🔄 Pendiente"}
                </p>
              </div>
            `,
          })

          // Agregar evento click
          marker.addListener("click", () => {
            infoWindow.open(mapInstanceRef.current, marker)
          })
        } else {
          // Fallback a marcador tradicional
          const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map: mapInstanceRef.current,
            title: `${parada.envios.clientes.nombre} - ${parada.envios.direccion_destino}`,
            label: {
              text: (index + 1).toString(),
              color: "white",
              fontWeight: "bold",
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 15,
              fillColor: parada.completada ? "#10b981" : "#3b82f6",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            },
          })

          // Crear info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold">${index + 1}. ${parada.envios.clientes.nombre}</h3>
                <p class="text-sm text-gray-600">${parada.envios.direccion_destino}</p>
                <p class="text-sm ${parada.completada ? "text-green-600" : "text-blue-600"}">
                  ${parada.completada ? "✅ Completada" : "🔄 Pendiente"}
                </p>
              </div>
            `,
          })

          // Agregar evento click
          marker.addListener("click", () => {
            infoWindow.open(mapInstanceRef.current, marker)
          })
        }
      }
    })

    // Calcular y mostrar ruta si hay múltiples paradas
    if (paradas.length > 1) {
      calcularRuta()
    }

    // Ajustar zoom para mostrar todas las paradas
    const bounds = new window.google.maps.LatLngBounds()
    paradas.forEach((parada) => {
      const lat = Number.parseFloat(parada.envios.clientes.latitud)
      const lng = Number.parseFloat(parada.envios.clientes.longitud)
      if (!isNaN(lat) && !isNaN(lng)) {
        bounds.extend({ lat, lng })
      }
    })
    mapInstanceRef.current.fitBounds(bounds)
  }

  const calcularRuta = () => {
    if (!directionsServiceRef.current || paradas.length < 2) return

    const validStops = paradas.filter((parada) => {
      const lat = Number.parseFloat(parada.envios.clientes.latitud)
      const lng = Number.parseFloat(parada.envios.clientes.longitud)
      return !isNaN(lat) && !isNaN(lng)
    })

    if (validStops.length < 2) return

    const origin = {
      lat: Number.parseFloat(validStops[0].envios.clientes.latitud),
      lng: Number.parseFloat(validStops[0].envios.clientes.longitud),
    }

    const destination = {
      lat: Number.parseFloat(validStops[validStops.length - 1].envios.clientes.latitud),
      lng: Number.parseFloat(validStops[validStops.length - 1].envios.clientes.longitud),
    }

    const waypoints = validStops.slice(1, -1).map((parada) => ({
      location: {
        lat: Number.parseFloat(parada.envios.clientes.latitud),
        lng: Number.parseFloat(parada.envios.clientes.longitud),
      },
      stopover: true,
    }))

    directionsServiceRef.current.route(
      {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        optimizeWaypoints: false, // No optimizar, usar el orden dado
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result: any, status: string) => {
        if (status === "OK") {
          directionsRendererRef.current.setDirections(result)
        } else {
          console.error("Error calculando ruta:", status)
        }
      },
    )
  }

  const abrirEnGoogleMaps = () => {
    if (paradas.length === 0) return

    const waypoints = paradas
      .map((parada) => {
        const lat = Number.parseFloat(parada.envios.clientes.latitud)
        const lng = Number.parseFloat(parada.envios.clientes.longitud)
        return !isNaN(lat) && !isNaN(lng) ? `${lat},${lng}` : null
      })
      .filter(Boolean)

    if (waypoints.length === 0) return

    // Formato: https://www.google.com/maps/dir/?api=1&origin=ORIGEN&destination=DESTINO&waypoints=PUNTO1|PUNTO2
    const origin = waypoints[0]
    const destination = waypoints[waypoints.length - 1]
    const waypointsStr = waypoints.slice(1, -1).join("|")

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${
      waypointsStr ? `&waypoints=${waypointsStr}` : ""
    }&travelmode=driving`

    window.open(url, "_blank")
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Mapa de Ruta
          </div>
          <Button variant="outline" size="sm" onClick={abrirEnGoogleMaps} disabled={paradas.length < 1}>
            <Navigation className="mr-2 h-4 w-4" />
            Abrir en Google Maps
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {!mapsLoaded ? (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 mb-2 animate-spin" />
                <p>Cargando mapa...</p>
              </div>
            </div>
          ) : paradas.length === 0 ? (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Sin paradas</p>
                <p className="text-sm">No hay paradas para mostrar en el mapa</p>
              </div>
            </div>
          ) : (
            <div ref={mapRef} className="w-full h-96 rounded-lg border" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
