"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Loader2 } from "lucide-react"

interface Coordenadas {
  lat: number
  lng: number
}

interface SelectorUbicacionProps {
  onUbicacionSeleccionada: (direccion: string, coordenadas: Coordenadas) => void
  direccionInicial?: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function SelectorUbicacion({ onUbicacionSeleccionada, direccionInicial = "" }: SelectorUbicacionProps) {
  const [open, setOpen] = useState(false)
  const [direccionBusqueda, setDireccionBusqueda] = useState(direccionInicial)
  const [loading, setLoading] = useState(false)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)

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

  // Inicializar mapa cuando se abre el dialog
  useEffect(() => {
    if (open && mapsLoaded && mapRef.current && !mapInstanceRef.current) {
      initializeMap()
    }
  }, [open, mapsLoaded])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    // Coordenadas por defecto (Mar del Plata, Argentina)
    const defaultCenter = { lat: -38.01088591264159, lng: -57.59909874310361 }

    // Crear mapa
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: defaultCenter,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      mapId: "DEMO_MAP_ID", // Required for Advanced Markers
    })

    // Crear geocoder
    geocoderRef.current = new window.google.maps.Geocoder()

    // Crear marcador avanzado si está disponible
    if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
      // Crear elemento para el contenido del marcador
      const markerContent = document.createElement("div")
      markerContent.className = "marker-content"
      markerContent.innerHTML = `
        <div style="
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `

      // Crear marcador avanzado
      markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: defaultCenter,
        content: markerContent,
        title: "Selecciona la ubicación",
        draggable: true,
      })

      // Listener para cuando se arrastra el marcador
      markerRef.current.addListener("dragend", () => {
        const position = markerRef.current.position
        reverseGeocode(position.lat, position.lng)
      })
    } else {
      // Fallback a marcador tradicional
      markerRef.current = new window.google.maps.Marker({
        position: defaultCenter,
        map: mapInstanceRef.current,
        draggable: true,
        title: "Selecciona la ubicación",
      })

      // Listener para cuando se arrastra el marcador
      markerRef.current.addListener("dragend", () => {
        const position = markerRef.current.getPosition()
        reverseGeocode(position.lat(), position.lng())
      })
    }

    // Listener para clicks en el mapa
    mapInstanceRef.current.addListener("click", (event: any) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()

      if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        markerRef.current.position = { lat, lng }
      } else {
        markerRef.current.setPosition({ lat, lng })
      }

      reverseGeocode(lat, lng)
    })
  }

  const buscarUbicacion = async () => {
    if (!direccionBusqueda.trim() || !geocoderRef.current) return

    setLoading(true)

    geocoderRef.current.geocode({ address: direccionBusqueda }, (results: any[], status: string) => {
      setLoading(false)

      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location
        const lat = location.lat()
        const lng = location.lng()

        // Centrar mapa y mover marcador
        mapInstanceRef.current.setCenter({ lat, lng })

        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          markerRef.current.position = { lat, lng }
        } else {
          markerRef.current.setPosition({ lat, lng })
        }

        // Actualizar dirección
        setDireccionBusqueda(results[0].formatted_address)
      } else {
        alert("No se pudo encontrar la dirección. Intenta con una dirección más específica.")
      }
    })
  }

  const reverseGeocode = (lat: number, lng: number) => {
    if (!geocoderRef.current) return

    geocoderRef.current.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === "OK" && results[0]) {
        setDireccionBusqueda(results[0].formatted_address)
      }
    })
  }

  const seleccionarUbicacionActual = () => {
    if (!markerRef.current) return

    let lat, lng

    if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
      lat = markerRef.current.position.lat
      lng = markerRef.current.position.lng
    } else {
      const position = markerRef.current.getPosition()
      lat = position.lat()
      lng = position.lng()
    }

    const coordenadas = { lat, lng }

    onUbicacionSeleccionada(direccionBusqueda, coordenadas)
    setOpen(false)
  }

  const obtenerUbicacionActual = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada en este navegador")
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng })

          if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
            markerRef.current.position = { lat, lng }
          } else {
            markerRef.current.setPosition({ lat, lng })
          }

          reverseGeocode(lat, lng)
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error obteniendo ubicación:", error)
        alert("No se pudo obtener tu ubicación actual")
        setLoading(false)
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon">
          <MapPin className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Seleccionar Ubicación</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="flex gap-2">
            <Input
              value={direccionBusqueda}
              onChange={(e) => setDireccionBusqueda(e.target.value)}
              placeholder="Buscar dirección..."
              onKeyPress={(e) => e.key === "Enter" && buscarUbicacion()}
              className="flex-1"
            />
            <Button onClick={buscarUbicacion} disabled={loading || !mapsLoaded}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
            <Button onClick={obtenerUbicacionActual} variant="outline" disabled={loading || !mapsLoaded}>
              📍 Mi ubicación
            </Button>
          </div>

          {/* Mapa */}
          <div className="relative">
            {!mapsLoaded ? (
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Cargando Google Maps...</p>
                </div>
              </div>
            ) : (
              <div ref={mapRef} className="w-full h-96 rounded-lg border" style={{ minHeight: "400px" }} />
            )}
          </div>

          {/* Instrucciones */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              💡 <strong>Instrucciones:</strong>
            </p>
            <p>• Busca una dirección en el campo de arriba</p>
            <p>• Haz clic en el mapa para colocar el marcador</p>
            <p>• Arrastra el marcador para ajustar la posición exacta</p>
            <p>• Usa "Mi ubicación" para obtener tu posición actual</p>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={seleccionarUbicacionActual} disabled={!direccionBusqueda.trim() || !mapsLoaded}>
              Seleccionar esta ubicación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
