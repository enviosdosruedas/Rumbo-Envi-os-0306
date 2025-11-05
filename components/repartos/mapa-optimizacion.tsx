"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, MapPin } from "lucide-react"

interface PuntoInicio {
  lat: number
  lng: number
  nombre: string
}

interface MapaOptimizacionProps {
  rutaOriginal: any[]
  rutaOptimizada: any[]
  puntoInicio?: PuntoInicio
}

declare global {
  interface Window {
    google: any
  }
}

export function MapaOptimizacion({ rutaOriginal, rutaOptimizada, puntoInicio }: MapaOptimizacionProps) {
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("original")
  const mapOriginalRef = useRef<HTMLDivElement>(null)
  const mapOptimizadoRef = useRef<HTMLDivElement>(null)
  const mapOriginalInstanceRef = useRef<any>(null)
  const mapOptimizadoInstanceRef = useRef<any>(null)
  const directionsServiceRef = useRef<any>(null)
  const directionsRendererOriginalRef = useRef<any>(null)
  const directionsRendererOptimizadoRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      // Fetch the script URL from the server
      fetch("/api/maps-config")
        .then((res) => res.json())
        .then((data) => {
          if (data.scriptUrl) {
            const script = document.createElement("script")
            script.src = data.scriptUrl
            script.async = true
            script.defer = true
            script.onload = () => {
              setMapsLoaded(true)
            }
            document.head.appendChild(script)
          }
        })
        .catch((error) => {
          console.error("Error loading Google Maps:", error)
        })
    } else if (window.google) {
      setMapsLoaded(true)
    }
  }, [])

  // Inicializar mapas cuando se cargan las APIs
  useEffect(() => {
    if (mapsLoaded) {
      initializeMaps()
    }
  }, [mapsLoaded])

  // Actualizar rutas cuando cambian los datos
  useEffect(() => {
    if (mapsLoaded && mapOriginalInstanceRef.current && mapOptimizadoInstanceRef.current) {
      if (rutaOriginal.length > 0) {
        mostrarRuta(rutaOriginal, "original")
      }
      if (rutaOptimizada.length > 0) {
        mostrarRuta(rutaOptimizada, "optimizada")
      }
    }
  }, [mapsLoaded, rutaOriginal, rutaOptimizada])

  const initializeMaps = () => {
    if (!window.google) return

    // Coordenadas por defecto (Mar del Plata, Argentina)
    const defaultCenter = { lat: -38.01088591264159, lng: -57.59909874310361 }

    // Inicializar servicios de direcciones
    directionsServiceRef.current = new window.google.maps.DirectionsService()
    directionsRendererOriginalRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#3b82f6", // Azul para ruta original
        strokeWeight: 4,
      },
    })
    directionsRendererOptimizadoRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#10b981", // Verde para ruta optimizada
        strokeWeight: 4,
      },
    })

    // Inicializar mapa original
    if (mapOriginalRef.current) {
      mapOriginalInstanceRef.current = new window.google.maps.Map(mapOriginalRef.current, {
        zoom: 12,
        center: defaultCenter,
        mapTypeControl: false,
        streetViewControl: false,
        mapId: "DEMO_MAP_ID", // Required for Advanced Markers
      })
      directionsRendererOriginalRef.current.setMap(mapOriginalInstanceRef.current)
    }

    // Inicializar mapa optimizado
    if (mapOptimizadoRef.current) {
      mapOptimizadoInstanceRef.current = new window.google.maps.Map(mapOptimizadoRef.current, {
        zoom: 12,
        center: defaultCenter,
        mapTypeControl: false,
        streetViewControl: false,
        mapId: "DEMO_MAP_ID_2", // Different ID for second map
      })
      directionsRendererOptimizadoRef.current.setMap(mapOptimizadoInstanceRef.current)
    }
  }

  const mostrarRuta = (ruta: any[], tipo: "original" | "optimizada") => {
    if (!directionsServiceRef.current || ruta.length === 0) return

    const map = tipo === "original" ? mapOriginalInstanceRef.current : mapOptimizadoInstanceRef.current
    const directionsRenderer =
      tipo === "original" ? directionsRendererOriginalRef.current : directionsRendererOptimizadoRef.current

    if (!map || !directionsRenderer) return

    // Limpiar marcadores anteriores
    directionsRenderer.setDirections({ routes: [] })

    // Crear marcadores para cada parada
    ruta.forEach((parada, index) => {
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
              background-color: ${tipo === "original" ? "#3b82f6" : "#10b981"};
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
            map,
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
              </div>
            `,
          })

          // Agregar evento click
          marker.addListener("click", () => {
            infoWindow.open(map, marker)
          })
        } else {
          // Fallback a marcador tradicional
          const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            title: `${parada.envios.clientes.nombre} - ${parada.envios.direccion_destino}`,
            label: {
              text: (index + 1).toString(),
              color: "white",
              fontWeight: "bold",
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 15,
              fillColor: tipo === "original" ? "#3b82f6" : "#10b981",
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
              </div>
            `,
          })

          // Agregar evento click
          marker.addListener("click", () => {
            infoWindow.open(map, marker)
          })
        }
      }
    })

    // Agregar marcador para el punto de inicio (empresa)
    if (puntoInicio) {
      // Usar AdvancedMarkerElement si está disponible
      if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        const markerPosition = { lat: puntoInicio.lat, lng: puntoInicio.lng }

        // Crear elemento para el contenido del marcador
        const markerContent = document.createElement("div")
        markerContent.className = "marker-content"
        markerContent.innerHTML = `
          <div style="
            background-color: #10b981;
            color: white;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
              <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path>
            </svg>
          </div>
        `

        // Crear marcador avanzado
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: markerPosition,
          content: markerContent,
          title: `Centro: ${puntoInicio.nombre}`,
        })

        // Crear info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">🏢 ${puntoInicio.nombre}</h3>
              <p class="text-sm text-gray-600">Punto de inicio</p>
            </div>
          `,
        })

        // Agregar evento click
        marker.addListener("click", () => {
          infoWindow.open(map, marker)
        })
      } else {
        // Fallback a marcador tradicional
        const marker = new window.google.maps.Marker({
          position: { lat: puntoInicio.lat, lng: puntoInicio.lng },
          map,
          title: `Centro: ${puntoInicio.nombre}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 18,
            fillColor: "#10b981",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 3,
          },
        })

        // Crear info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">🏢 ${puntoInicio.nombre}</h3>
              <p class="text-sm text-gray-600">Punto de inicio</p>
            </div>
          `,
        })

        // Agregar evento click
        marker.addListener("click", () => {
          infoWindow.open(map, marker)
        })
      }
    }

    // Calcular y mostrar ruta si hay múltiples paradas
    if (ruta.length > 1) {
      calcularRuta(ruta, tipo)
    }
  }

  const calcularRuta = (ruta: any[], tipo: "original" | "optimizada") => {
    if (!directionsServiceRef.current || ruta.length < 2) return

    const validStops = ruta.filter((parada) => {
      const lat = Number.parseFloat(parada.envios.clientes.latitud)
      const lng = Number.parseFloat(parada.envios.clientes.longitud)
      return !isNaN(lat) && !isNaN(lng)
    })

    if (validStops.length < 2) return

    let origin, destination
    let waypoints = []

    // Si hay punto de inicio (empresa), usarlo como origen
    if (puntoInicio) {
      origin = { lat: puntoInicio.lat, lng: puntoInicio.lng }

      // Todas las paradas son waypoints
      waypoints = validStops.map((parada) => ({
        location: {
          lat: Number.parseFloat(parada.envios.clientes.latitud),
          lng: Number.parseFloat(parada.envios.clientes.longitud),
        },
        stopover: true,
      }))

      // La última parada es también el destino
      destination = {
        lat: Number.parseFloat(validStops[validStops.length - 1].envios.clientes.latitud),
        lng: Number.parseFloat(validStops[validStops.length - 1].envios.clientes.longitud),
      }
    } else {
      // Sin punto de inicio, la primera parada es el origen
      origin = {
        lat: Number.parseFloat(validStops[0].envios.clientes.latitud),
        lng: Number.parseFloat(validStops[0].envios.clientes.longitud),
      }

      // La última parada es el destino
      destination = {
        lat: Number.parseFloat(validStops[validStops.length - 1].envios.clientes.latitud),
        lng: Number.parseFloat(validStops[validStops.length - 1].envios.clientes.longitud),
      }

      // Las paradas intermedias son waypoints
      waypoints = validStops.slice(1, -1).map((parada) => ({
        location: {
          lat: Number.parseFloat(parada.envios.clientes.latitud),
          lng: Number.parseFloat(parada.envios.clientes.longitud),
        },
        stopover: true,
      }))
    }

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
          const directionsRenderer =
            tipo === "original" ? directionsRendererOriginalRef.current : directionsRendererOptimizadoRef.current
          directionsRenderer.setDirections(result)

          // Centrar y ajustar zoom
          const map = tipo === "original" ? mapOriginalInstanceRef.current : mapOptimizadoInstanceRef.current
          const bounds = new window.google.maps.LatLngBounds()

          // Incluir punto de inicio si existe
          if (puntoInicio) {
            bounds.extend({ lat: puntoInicio.lat, lng: puntoInicio.lng })
          }

          // Incluir todas las paradas
          validStops.forEach((parada) => {
            bounds.extend({
              lat: Number.parseFloat(parada.envios.clientes.latitud),
              lng: Number.parseFloat(parada.envios.clientes.longitud),
            })
          })

          map.fitBounds(bounds)
        } else {
          console.error("Error calculando ruta:", status)
        }
      },
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="original">Ruta Original</TabsTrigger>
          <TabsTrigger value="optimizada" disabled={rutaOptimizada.length === 0}>
            Ruta Optimizada
          </TabsTrigger>
        </TabsList>
        <TabsContent value="original" className="mt-2">
          <div className="relative">
            {!mapsLoaded ? (
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 mb-2 animate-spin" />
                  <p>Cargando mapa...</p>
                </div>
              </div>
            ) : rutaOriginal.length === 0 ? (
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="mx-auto h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">Sin paradas</p>
                  <p className="text-sm">No hay paradas para mostrar en el mapa</p>
                </div>
              </div>
            ) : (
              <div ref={mapOriginalRef} className="w-full h-96 rounded-lg border" />
            )}
          </div>
          {rutaOriginal.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Secuencia de paradas original:</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {rutaOriginal.map((parada, index) => (
                  <div key={parada.id} className="flex items-center text-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="truncate">
                      {parada.envios.clientes.nombre} - {parada.envios.direccion_destino}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="optimizada" className="mt-2">
          <div className="relative">
            {!mapsLoaded ? (
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 mb-2 animate-spin" />
                  <p>Cargando mapa...</p>
                </div>
              </div>
            ) : rutaOptimizada.length === 0 ? (
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="mx-auto h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">Ruta no optimizada</p>
                  <p className="text-sm">Haga clic en "Calcular Ruta Óptima" para generar una secuencia optimizada</p>
                </div>
              </div>
            ) : (
              <div ref={mapOptimizadoRef} className="w-full h-96 rounded-lg border" />
            )}
          </div>
          {rutaOptimizada.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Secuencia de paradas optimizada:</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {rutaOptimizada.map((parada, index) => (
                  <div key={parada.id} className="flex items-center text-sm">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="truncate">
                      {parada.envios.clientes.nombre} - {parada.envios.direccion_destino}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
