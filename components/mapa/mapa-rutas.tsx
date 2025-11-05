"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Loader2 } from "lucide-react"

interface MapaRutasProps {
  repartos: any[]
  empresas: any[]
  filtros: {
    estado: string[]
    fecha: string | null
    repartidor: string | null
  }
}

declare global {
  interface Window {
    google: any
  }
}

export function MapaRutas({
  repartos = [],
  empresas = [],
  filtros = { estado: [], fecha: null, repartidor: null },
}: MapaRutasProps) {
  const [repartoSeleccionado, setRepartoSeleccionado] = useState<string | null>(null)
  const [vistaActual, setVistaActual] = useState<"mapa" | "lista">("mapa")
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowsRef = useRef<any[]>([])

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

  // Inicializar mapa cuando se cargan las APIs
  useEffect(() => {
    if (mapsLoaded && mapRef.current) {
      initializeMap()
    }
  }, [mapsLoaded])

  // Actualizar marcadores cuando cambian los repartos o filtros
  useEffect(() => {
    if (mapsLoaded && mapInstanceRef.current) {
      actualizarMarcadores()
    }
  }, [mapsLoaded, repartos, filtros])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    // Crear mapa centrado en Mar del Plata, Argentina
    const defaultCenter = { lat: -38.01088591264159, lng: -57.59909874310361 }

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: defaultCenter,
      mapTypeControl: false,
      streetViewControl: false,
      mapId: "DEMO_MAP_ID", // Required for Advanced Markers
    })

    // Inicializar marcadores
    actualizarMarcadores()
  }

  const actualizarMarcadores = () => {
    if (!mapInstanceRef.current) return

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => {
      if (marker && marker.setMap) {
        marker.setMap(null)
      }
    })
    markersRef.current = []

    // Limpiar infowindows anteriores
    infoWindowsRef.current.forEach((infoWindow) => {
      if (infoWindow && infoWindow.close) {
        infoWindow.close()
      }
    })
    infoWindowsRef.current = []

    // Filtrar repartos según los filtros aplicados
    const repartosFiltrados = repartos.filter((reparto) => {
      if (!reparto) return false

      let cumpleFiltros = true

      // Filtro por estado
      if (filtros?.estado && filtros.estado.length > 0) {
        cumpleFiltros = cumpleFiltros && filtros.estado.includes(reparto.estado)
      }

      // Filtro por fecha
      if (filtros?.fecha) {
        const fechaFiltro = new Date(filtros.fecha)
        const fechaReparto = new Date(reparto.fecha)
        cumpleFiltros =
          cumpleFiltros &&
          fechaFiltro.getFullYear() === fechaReparto.getFullYear() &&
          fechaFiltro.getMonth() === fechaReparto.getMonth() &&
          fechaFiltro.getDate() === fechaReparto.getDate()
      }

      // Filtro por repartidor
      if (filtros?.repartidor) {
        cumpleFiltros = cumpleFiltros && reparto.repartidor_id === filtros.repartidor
      }

      return cumpleFiltros
    })

    // Si no hay repartos filtrados, no hacer nada más
    if (repartosFiltrados.length === 0) return

    // Crear marcadores para cada reparto
    const bounds = new window.google.maps.LatLngBounds()

    // Primero, agregar marcadores para las empresas (centros de distribución)
    const empresasMap = new Map()

    repartosFiltrados.forEach((reparto) => {
      if (reparto.empresas && reparto.empresas.latitud_empresa && reparto.empresas.longitud_empresa) {
        const empresaId = reparto.empresa_id
        if (!empresasMap.has(empresaId)) {
          const lat = Number.parseFloat(reparto.empresas.latitud_empresa)
          const lng = Number.parseFloat(reparto.empresas.longitud_empresa)

          if (!isNaN(lat) && !isNaN(lng)) {
            empresasMap.set(empresaId, {
              id: empresaId,
              nombre: reparto.empresas.nombre,
              lat,
              lng,
            })
            bounds.extend({ lat, lng })
          }
        }
      }
    })

    // Crear marcadores para las empresas
    empresasMap.forEach((empresa) => {
      // Usar AdvancedMarkerElement si está disponible
      if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        const markerPosition = { lat: empresa.lat, lng: empresa.lng }

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
          map: mapInstanceRef.current,
          position: markerPosition,
          content: markerContent,
          title: `Centro: ${empresa.nombre}`,
        })

        // Crear info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">🏢 ${empresa.nombre}</h3>
              <p class="text-sm text-gray-600">Centro de distribución</p>
            </div>
          `,
        })

        // Agregar evento click
        marker.addListener("click", () => {
          infoWindow.open(mapInstanceRef.current, marker)
        })

        // Guardar referencias
        markersRef.current.push(marker)
        infoWindowsRef.current.push(infoWindow)
      } else {
        // Fallback a marcador tradicional
        const marker = new window.google.maps.Marker({
          position: { lat: empresa.lat, lng: empresa.lng },
          map: mapInstanceRef.current,
          title: `Centro: ${empresa.nombre}`,
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
              <h3 class="font-semibold">🏢 ${empresa.nombre}</h3>
              <p class="text-sm text-gray-600">Centro de distribución</p>
            </div>
          `,
        })

        // Agregar evento click
        marker.addListener("click", () => {
          infoWindow.open(mapInstanceRef.current, marker)
        })

        // Guardar referencias
        markersRef.current.push(marker)
        infoWindowsRef.current.push(infoWindow)
      }
    })

    // Luego, agregar marcadores para cada parada de cada reparto
    repartosFiltrados.forEach((reparto) => {
      if (reparto.paradas_reparto && reparto.paradas_reparto.length > 0) {
        reparto.paradas_reparto.forEach((parada: any) => {
          if (
            parada.envios &&
            parada.envios.clientes &&
            parada.envios.clientes.latitud &&
            parada.envios.clientes.longitud
          ) {
            const lat = Number.parseFloat(parada.envios.clientes.latitud)
            const lng = Number.parseFloat(parada.envios.clientes.longitud)

            if (!isNaN(lat) && !isNaN(lng)) {
              bounds.extend({ lat, lng })

              // Determinar color según estado
              let color = "#3b82f6" // Azul por defecto (en progreso)
              if (reparto.estado === "pendiente") {
                color = "#eab308" // Amarillo
              } else if (reparto.estado === "completado") {
                color = "#10b981" // Verde
              } else if (reparto.estado === "cancelado") {
                color = "#ef4444" // Rojo
              }

              // Usar AdvancedMarkerElement si está disponible
              if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
                const markerPosition = { lat, lng }

                // Crear elemento para el contenido del marcador
                const markerContent = document.createElement("div")
                markerContent.className = "marker-content"
                markerContent.innerHTML = `
                  <div style="
                    background-color: ${color};
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
                    ${parada.orden || "•"}
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
                      <h3 class="font-semibold">${parada.envios.clientes.nombre}</h3>
                      <p class="text-sm text-gray-600">${parada.envios.direccion_destino}</p>
                      <p class="text-sm">Reparto #${reparto.id} - ${new Date(reparto.fecha).toLocaleDateString()}</p>
                      <p class="text-sm">
                        Estado: <span style="color:${color};font-weight:bold;">
                          ${reparto.estado.toUpperCase()}
                        </span>
                      </p>
                      ${
                        reparto.repartidores
                          ? `<p class="text-sm">Repartidor: ${reparto.repartidores.nombre} ${reparto.repartidores.apellido}</p>`
                          : ""
                      }
                    </div>
                  `,
                })

                // Agregar evento click
                marker.addListener("click", () => {
                  infoWindow.open(mapInstanceRef.current, marker)
                })

                // Guardar referencias
                markersRef.current.push(marker)
                infoWindowsRef.current.push(infoWindow)
              } else {
                // Fallback a marcador tradicional
                const marker = new window.google.maps.Marker({
                  position: { lat, lng },
                  map: mapInstanceRef.current,
                  title: `${parada.envios.clientes.nombre} - ${parada.envios.direccion_destino}`,
                  label: parada.orden ? parada.orden.toString() : "",
                  icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 15,
                    fillColor: color,
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                  },
                })

                // Crear info window
                const infoWindow = new window.google.maps.InfoWindow({
                  content: `
                    <div class="p-2">
                      <h3 class="font-semibold">${parada.envios.clientes.nombre}</h3>
                      <p class="text-sm text-gray-600">${parada.envios.direccion_destino}</p>
                      <p class="text-sm">Reparto #${reparto.id} - ${new Date(reparto.fecha).toLocaleDateString()}</p>
                      <p class="text-sm">
                        Estado: <span style="color:${color};font-weight:bold;">
                          ${reparto.estado.toUpperCase()}
                        </span>
                      </p>
                      ${
                        reparto.repartidores
                          ? `<p class="text-sm">Repartidor: ${reparto.repartidores.nombre} ${reparto.repartidores.apellido}</p>`
                          : ""
                      }
                    </div>
                  `,
                })

                // Agregar evento click
                marker.addListener("click", () => {
                  infoWindow.open(mapInstanceRef.current, marker)
                })

                // Guardar referencias
                markersRef.current.push(marker)
                infoWindowsRef.current.push(infoWindow)
              }
            }
          }
        })
      }
    })

    // Ajustar zoom para mostrar todos los marcadores
    if (markersRef.current.length > 0) {
      mapInstanceRef.current.fitBounds(bounds)
    }
  }

  const getColorByEstado = (estado: string) => {
    const colors = {
      pendiente: "#eab308",
      en_progreso: "#3b82f6",
      completado: "#10b981",
      cancelado: "#ef4444",
    } as const

    return colors[estado as keyof typeof colors] || "#6b7280"
  }

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
    <Card className="col-span-3">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Mapa de Rutas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {!mapsLoaded ? (
            <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 mb-2 animate-spin" />
                <p>Cargando mapa...</p>
              </div>
            </div>
          ) : (
            <div ref={mapRef} className="w-full h-[600px] rounded-lg border" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
