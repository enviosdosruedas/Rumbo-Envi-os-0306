"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Package, MapPin, User } from "lucide-react"
import { SelectorUbicacion } from "./selector-ubicacion"
import { CalculadoraPrecio } from "./calculadora-precio"
import { createClient } from "@/lib/supabase/client"
import type { Cliente } from "@/types"

interface FormularioEnvioProps {
  cliente: Cliente
  repartidorId: string
  onVolver: () => void
}

interface Coordenadas {
  lat: number
  lng: number
}

interface ConfiguracionEmpresa {
  id: string
  nombre_punto_recogida?: string
  telefono_punto_recogida?: string
  direccion_punto_recogida?: string
  latitud_punto_recogida?: number
  longitud_punto_recogida?: number
}

interface CalculoPrecio {
  precio_base: number
  precio_km_extra: number
  precio_total: number
  tarifa_aplicada: string
  tipo_servicio_id: number
  distancia_km: number
}

export function FormularioEnvio({ cliente, repartidorId, onVolver }: FormularioEnvioProps) {
  const [formData, setFormData] = useState({
    // Recogida - se precarga desde último envío o configuración empresa
    puntoRecogida: "",
    telefonoRecogida: "",
    direccionRecogida: "",
    horaRecogida: "17:12",
    recordarRecogida: false,

    // Entrega - se precarga desde datos del cliente
    nombreDestinatario: `${cliente.nombre} ${cliente.apellido || ""}`.trim(),
    telefonoDestinatario: cliente.telefono || "",
    emailDestinatario: cliente.email || "",
    direccionEntrega: cliente.direccion || "",
    fechaEntrega: new Date().toISOString().split("T")[0],
    horaEntrega: "18:12",
    notaEntrega: "",
    propinaEntrega: false,
  })

  const [coordenadasRecogida, setCoordenadasRecogida] = useState<Coordenadas | null>(null)
  const [coordenadasEntrega, setCoordenadasEntrega] = useState<Coordenadas | null>(null)
  const [calculoPrecio, setCalculoPrecio] = useState<CalculoPrecio | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [configuracionEmpresa, setConfiguracionEmpresa] = useState<ConfiguracionEmpresa | null>(null)

  const supabase = createClient()

  // Cargar configuración de recogida desde base de datos
  useEffect(() => {
    const loadPickupConfiguration = async () => {
      setLoadingConfig(true)
      try {
        // 1. Intentar cargar desde configuración de empresa
        const { data: empresaConfig } = await supabase
          .from("configuracion_empresa")
          .select("*")
          .eq("es_configuracion_principal", true)
          .single()

        if (empresaConfig) {
          setConfiguracionEmpresa(empresaConfig)

          // Precargar datos de recogida desde configuración de empresa
          setFormData((prev) => ({
            ...prev,
            puntoRecogida: empresaConfig.nombre_punto_recogida || "Punto de Recogida Principal",
            telefonoRecogida: empresaConfig.telefono_punto_recogida || "",
            direccionRecogida: empresaConfig.direccion_punto_recogida || "",
          }))

          // Establecer coordenadas de recogida si están disponibles
          if (empresaConfig.latitud_punto_recogida && empresaConfig.longitud_punto_recogida) {
            setCoordenadasRecogida({
              lat: empresaConfig.latitud_punto_recogida,
              lng: empresaConfig.longitud_punto_recogida,
            })
          }
        } else {
          // 2. Fallback: cargar desde último envío del repartidor
          const { data: ultimoEnvio } = await supabase
            .from("envios")
            .select("direccion_origen, coordenadas_origen, telefono_origen")
            .eq("repartidor_id", repartidorId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (ultimoEnvio) {
            setFormData((prev) => ({
              ...prev,
              telefonoRecogida: ultimoEnvio.telefono_origen || "",
              direccionRecogida: ultimoEnvio.direccion_origen || "",
            }))

            // Parsear coordenadas del último envío
            if (ultimoEnvio.coordenadas_origen) {
              const [lat, lng] = ultimoEnvio.coordenadas_origen.split(",").map(Number)
              if (!isNaN(lat) && !isNaN(lng)) {
                setCoordenadasRecogida({ lat, lng })
              }
            }
          }
        }

        // 3. Precargar coordenadas de entrega desde datos del cliente
        if (cliente.latitud && cliente.longitud) {
          setCoordenadasEntrega({
            lat: Number(cliente.latitud),
            lng: Number(cliente.longitud),
          })
        }
      } catch (err) {
        console.error("Error cargando configuración:", err)
      } finally {
        setLoadingConfig(false)
      }
    }

    loadPickupConfiguration()
  }, [repartidorId, cliente, supabase])

  const notasEntrega = [
    "Entregar en recepción",
    "Llamar antes de entregar",
    "Dejar en puerta si no hay nadie",
    "Solo entregar al destinatario",
    "Entregar en horario laboral",
    "Requiere identificación",
  ]

  const handlePrecioCalculado = (precio: CalculoPrecio) => {
    setCalculoPrecio(precio)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.telefonoRecogida ||
      !formData.direccionRecogida ||
      !formData.nombreDestinatario ||
      !formData.telefonoDestinatario ||
      !formData.direccionEntrega ||
      !coordenadasEntrega ||
      !calculoPrecio
    ) {
      setError("Por favor completa todos los campos obligatorios, selecciona las ubicaciones y calcula el precio")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Guardar configuración de recogida si "recordar" está marcado
      if (formData.recordarRecogida && configuracionEmpresa) {
        await supabase
          .from("configuracion_empresa")
          .update({
            nombre_punto_recogida: formData.puntoRecogida,
            telefono_punto_recogida: formData.telefonoRecogida,
            direccion_punto_recogida: formData.direccionRecogida,
            latitud_punto_recogida: coordenadasRecogida?.lat,
            longitud_punto_recogida: coordenadasRecogida?.lng,
          })
          .eq("id", configuracionEmpresa.id)
      }

      // Crear el envío con información de precio
      const { data: envio, error: envioError } = await supabase
        .from("envios")
        .insert({
          cliente_id: cliente.id,
          repartidor_id: repartidorId,
          // Usar campos existentes para coordenadas principales
          direccion_origen: formData.direccionRecogida,
          latitud_origen: coordenadasRecogida?.lat || 0,
          longitud_origen: coordenadasRecogida?.lng || 0,
          direccion_destino: formData.direccionEntrega,
          latitud_destino: coordenadasEntrega.lat,
          longitud_destino: coordenadasEntrega.lng,
          // Usar nuevos campos para información adicional
          coordenadas_origen: coordenadasRecogida ? `${coordenadasRecogida.lat},${coordenadasRecogida.lng}` : null,
          coordenadas_destino: `${coordenadasEntrega.lat},${coordenadasEntrega.lng}`,
          telefono_origen: formData.telefonoRecogida,
          telefono_destino: formData.telefonoDestinatario,
          nombre_destinatario: formData.nombreDestinatario,
          email_destinatario: formData.emailDestinatario || null,
          fecha_programada: formData.fechaEntrega,
          hora_programada: formData.horaEntrega,
          notas: formData.notaEntrega || null,
          propina_requerida: formData.propinaEntrega,
          // Información de precio
          tipo_servicio_id: calculoPrecio.tipo_servicio_id,
          distancia_calculada_km: calculoPrecio.distancia_km,
          precio_base: calculoPrecio.precio_base,
          precio_km_extra: calculoPrecio.precio_km_extra,
          precio_total: calculoPrecio.precio_total,
          precio: calculoPrecio.precio_total, // Campo legacy
          estado: "pendiente",
          descripcion: `Envío desde ${formData.puntoRecogida} para ${formData.nombreDestinatario}`,
        })
        .select()
        .single()

      if (envioError) throw envioError

      setSuccess(true)

      // Reset form after 2 seconds
      setTimeout(() => {
        onVolver()
      }, 2000)
    } catch (err) {
      console.error("Error creando envío:", err)
      setError("Error al crear el envío. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-600 mb-2">¡Envío Creado Exitosamente!</h3>
          <p className="text-gray-600">
            El envío ha sido registrado con un costo de{" "}
            <strong>
              {calculoPrecio &&
                new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumFractionDigits: 0,
                }).format(calculoPrecio.precio_total)}
            </strong>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onVolver}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>
              Crear Envío para {cliente.nombre} {cliente.apellido}
            </CardTitle>
          </div>
          <p className="text-sm text-gray-600">Teléfono: {cliente.telefono}</p>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección Recogida */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Recogida Desde
            </CardTitle>
            <p className="text-sm text-blue-600">
              {loadingConfig
                ? "Cargando configuración..."
                : configuracionEmpresa
                  ? "📍 Datos precargados desde configuración de empresa"
                  : "📍 Datos precargados desde último envío"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="puntoRecogida">Punto de Recogida</Label>
              <Input
                id="puntoRecogida"
                value={formData.puntoRecogida}
                onChange={(e) => handleChange("puntoRecogida", e.target.value)}
                disabled={loading || loadingConfig}
                placeholder="Nombre del punto de recogida"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefonoRecogida">Teléfono del Punto de Recogida *</Label>
              <Input
                id="telefonoRecogida"
                type="tel"
                value={formData.telefonoRecogida}
                onChange={(e) => handleChange("telefonoRecogida", e.target.value)}
                placeholder="Número de contacto"
                disabled={loading || loadingConfig}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccionRecogida">Dirección de Recogida *</Label>
              <div className="flex gap-2">
                <Input
                  id="direccionRecogida"
                  value={formData.direccionRecogida}
                  onChange={(e) => handleChange("direccionRecogida", e.target.value)}
                  placeholder="Dirección completa"
                  disabled={loading || loadingConfig}
                  required
                />
                <SelectorUbicacion
                  onUbicacionSeleccionada={(direccion, coordenadas) => {
                    handleChange("direccionRecogida", direccion)
                    setCoordenadasRecogida(coordenadas)
                  }}
                />
              </div>
              {coordenadasRecogida && (
                <p className="text-xs text-green-600">
                  ✓ Ubicación seleccionada: {coordenadasRecogida.lat.toFixed(6)}, {coordenadasRecogida.lng.toFixed(6)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaRecogida">Hora de Recogida</Label>
              <Input
                id="horaRecogida"
                type="time"
                value={formData.horaRecogida}
                onChange={(e) => handleChange("horaRecogida", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recordarRecogida"
                checked={formData.recordarRecogida}
                onCheckedChange={(checked) => handleChange("recordarRecogida", checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="recordarRecogida">Recordar información de lugar de recogida</Label>
            </div>
          </CardContent>
        </Card>

        {/* Sección Entrega */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Entregar A
            </CardTitle>
            <p className="text-sm text-green-600">👤 Datos precargados desde información del cliente</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombreDestinatario">Nombre Completo del Destinatario *</Label>
              <Input
                id="nombreDestinatario"
                value={formData.nombreDestinatario}
                onChange={(e) => handleChange("nombreDestinatario", e.target.value)}
                placeholder="Nombre completo"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefonoDestinatario">Teléfono del Destinatario *</Label>
              <Input
                id="telefonoDestinatario"
                type="tel"
                value={formData.telefonoDestinatario}
                onChange={(e) => handleChange("telefonoDestinatario", e.target.value)}
                placeholder="Número de contacto"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailDestinatario">Email del Destinatario (Opcional)</Label>
              <Input
                id="emailDestinatario"
                type="email"
                value={formData.emailDestinatario}
                onChange={(e) => handleChange("emailDestinatario", e.target.value)}
                placeholder="correo@ejemplo.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccionEntrega">Dirección Postal del Destinatario *</Label>
              <div className="flex gap-2">
                <Input
                  id="direccionEntrega"
                  value={formData.direccionEntrega}
                  onChange={(e) => handleChange("direccionEntrega", e.target.value)}
                  placeholder="Dirección completa de entrega"
                  disabled={loading}
                  required
                />
                <SelectorUbicacion
                  onUbicacionSeleccionada={(direccion, coordenadas) => {
                    handleChange("direccionEntrega", direccion)
                    setCoordenadasEntrega(coordenadas)
                  }}
                />
              </div>
              {coordenadasEntrega && (
                <p className="text-xs text-green-600">
                  ✓ Ubicación seleccionada: {coordenadasEntrega.lat.toFixed(6)}, {coordenadasEntrega.lng.toFixed(6)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaEntrega">Fecha de Entrega</Label>
                <Input
                  id="fechaEntrega"
                  type="date"
                  value={formData.fechaEntrega}
                  onChange={(e) => handleChange("fechaEntrega", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaEntrega">Hora de Entrega</Label>
                <Input
                  id="horaEntrega"
                  type="time"
                  value={formData.horaEntrega}
                  onChange={(e) => handleChange("horaEntrega", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notaEntrega">Nota de Entrega</Label>
              <Select value={formData.notaEntrega} onValueChange={(value) => handleChange("notaEntrega", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una nota de entrega" />
                </SelectTrigger>
                <SelectContent>
                  {notasEntrega.map((nota) => (
                    <SelectItem key={nota} value={nota}>
                      {nota}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="propinaEntrega"
                checked={formData.propinaEntrega}
                onCheckedChange={(checked) => handleChange("propinaEntrega", checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="propinaEntrega">Propina de entrega</Label>
            </div>
          </CardContent>
        </Card>

        {/* Calculadora de Precio */}
        <CalculadoraPrecio
          coordenadasOrigen={coordenadasRecogida}
          coordenadasDestino={coordenadasEntrega}
          onPrecioCalculado={handlePrecioCalculado}
        />

        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onVolver} disabled={loading}>
            Volver
          </Button>
          <Button type="submit" disabled={loading || loadingConfig || !calculoPrecio} className="flex-1">
            {loading
              ? "Creando Envío..."
              : `Crear Envío ${calculoPrecio ? `(${new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(calculoPrecio.precio_total)})` : ""}`}
          </Button>
        </div>
      </form>
    </div>
  )
}
