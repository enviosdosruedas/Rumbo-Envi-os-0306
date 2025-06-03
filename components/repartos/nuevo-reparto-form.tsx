"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Plus, X, MapPin, Package, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Empresa, Cliente } from "@/types"

interface NuevoRepartoFormProps {
  empresas: Empresa[]
  clientes: Cliente[]
}

interface ParadaSeleccionada {
  cliente: Cliente
  orden: number
  notas?: string
}

export function NuevoRepartoForm({ empresas, clientes }: NuevoRepartoFormProps) {
  const [fecha, setFecha] = useState<Date>(new Date())
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string>("")
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("")
  const [paradasSeleccionadas, setParadasSeleccionadas] = useState<ParadaSeleccionada[]>([])
  const [notas, setNotas] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const clientesFiltrados = clientes.filter((c) => (empresaSeleccionada ? c.empresa_id === empresaSeleccionada : true))

  const agregarParada = () => {
    if (!clienteSeleccionado) return

    const cliente = clientes.find((c) => c.id === clienteSeleccionado)
    if (!cliente) return

    // Verificar que no esté ya agregado
    if (paradasSeleccionadas.some((p) => p.cliente.id === cliente.id)) {
      alert("Este cliente ya está agregado al reparto")
      return
    }

    const nuevaParada: ParadaSeleccionada = {
      cliente,
      orden: paradasSeleccionadas.length + 1,
    }

    setParadasSeleccionadas([...paradasSeleccionadas, nuevaParada])
    setClienteSeleccionado("")
  }

  const removerParada = (clienteId: string) => {
    const nuevasParadas = paradasSeleccionadas
      .filter((p) => p.cliente.id !== clienteId)
      .map((p, index) => ({ ...p, orden: index + 1 }))

    setParadasSeleccionadas(nuevasParadas)
  }

  const moverParada = (index: number, direccion: "up" | "down") => {
    const nuevasParadas = [...paradasSeleccionadas]
    const newIndex = direccion === "up" ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= nuevasParadas.length) return // Intercambiar posiciones
    ;[nuevasParadas[index], nuevasParadas[newIndex]] = [nuevasParadas[newIndex], nuevasParadas[index]]

    // Actualizar órdenes
    nuevasParadas.forEach((parada, i) => {
      parada.orden = i + 1
    })

    setParadasSeleccionadas(nuevasParadas)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (paradasSeleccionadas.length === 0) {
      alert("Debes agregar al menos una parada")
      return
    }

    setLoading(true)

    try {
      // Obtener ID del repartidor actual
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuario no autenticado")

      const { data: repartidor } = await supabase.from("repartidores").select("id").eq("user_auth_id", user.id).single()

      if (!repartidor) throw new Error("Repartidor no encontrado")

      // Crear el reparto
      const { data: reparto, error: repartoError } = await supabase
        .from("repartos")
        .insert({
          repartidor_id: repartidor.id,
          fecha: fecha.toISOString().split("T")[0],
          estado: "pendiente",
          notas,
        })
        .select()
        .single()

      if (repartoError) throw repartoError

      // Crear los envíos y paradas
      for (const parada of paradasSeleccionadas) {
        // Crear envío
        const { data: envio, error: envioError } = await supabase
          .from("envios")
          .insert({
            cliente_id: parada.cliente.id,
            repartidor_id: repartidor.id,
            reparto_id: reparto.id,
            direccion_origen: empresas.find((e) => e.id === empresaSeleccionada)?.direccion || "",
            latitud_origen: empresas.find((e) => e.id === empresaSeleccionada)?.latitud_empresa || 0,
            longitud_origen: empresas.find((e) => e.id === empresaSeleccionada)?.longitud_empresa || 0,
            direccion_destino: parada.cliente.direccion || "",
            latitud_destino: parada.cliente.latitud || 0,
            longitud_destino: parada.cliente.longitud || 0,
            estado: "asignado",
            descripcion: `Entrega a ${parada.cliente.nombre} ${parada.cliente.apellido || ""}`,
            fecha_estimada: fecha.toISOString().split("T")[0],
            orden_parada: parada.orden,
          })
          .select()
          .single()

        if (envioError) throw envioError

        // Crear parada de reparto
        const { error: paradaError } = await supabase.from("paradas_reparto").insert({
          reparto_id: reparto.id,
          envio_id: envio.id,
          orden: parada.orden,
          estado: "asignado",
          notas_parada: parada.notas || `Entrega a ${parada.cliente.nombre} ${parada.cliente.apellido || ""}`,
        })

        if (paradaError) throw paradaError
      }

      // Redirigir al detalle del reparto creado
      router.push(`/repartos/${reparto.id}`)
    } catch (error) {
      console.error("Error al crear reparto:", error)
      alert("Error al crear el reparto. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario principal */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Reparto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fecha">Fecha del Reparto</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !fecha && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={fecha} onSelect={(date) => date && setFecha(date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="empresa">Empresa Cliente</Label>
                <Select value={empresaSeleccionada} onValueChange={setEmpresaSeleccionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notas">Notas del Reparto</Label>
                <Textarea
                  id="notas"
                  placeholder="Notas adicionales para el reparto..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agregar Paradas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Select value={clienteSeleccionado} onValueChange={setClienteSeleccionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientesFiltrados.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido} - {cliente.direccion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="button" onClick={agregarParada} disabled={!clienteSeleccionado} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Parada
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lista de paradas */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Paradas Programadas ({paradasSeleccionadas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paradasSeleccionadas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No hay paradas agregadas</p>
                  <p className="text-sm">Selecciona clientes para crear el reparto</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paradasSeleccionadas.map((parada, index) => (
                    <div key={parada.cliente.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{parada.orden}</Badge>
                        <div>
                          <p className="font-medium">
                            {parada.cliente.nombre} {parada.cliente.apellido}
                          </p>
                          <p className="text-sm text-gray-600">{parada.cliente.direccion}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => moverParada(index, "up")}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => moverParada(index, "down")}
                          disabled={index === paradasSeleccionadas.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removerParada(parada.cliente.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || paradasSeleccionadas.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando Reparto...
            </>
          ) : (
            <>
              <Package className="mr-2 h-4 w-4" />
              Crear Reparto
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
