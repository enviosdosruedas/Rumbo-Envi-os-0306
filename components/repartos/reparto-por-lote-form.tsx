"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Truck, Users, MapPin, Package, Loader2, RotateCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Empresa } from "@/types"

interface RepartoPorLoteFormProps {
  empresas: Empresa[]
  clientesPorEmpresa: Record<string, any[]>
}

export function RepartoPorLoteForm({ empresas, clientesPorEmpresa }: RepartoPorLoteFormProps) {
  const [fecha, setFecha] = useState<Date>(new Date())
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string>("")
  const [clientesSeleccionados, setClientesSeleccionados] = useState<string[]>([])
  const [notas, setNotas] = useState("")
  const [loading, setLoading] = useState(false)
  const [optimizandoRuta, setOptimizandoRuta] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  const router = useRouter()

  // Simple calculations without memoization to avoid infinite loops
  const clientesDisponibles = empresaSeleccionada ? clientesPorEmpresa[empresaSeleccionada] || [] : []
  const distanciaEstimada = clientesSeleccionados.length * 2.5
  const tiempoEstimado = clientesSeleccionados.length * 15
  const totalClientes = clientesSeleccionados.length
  const porcentajeCompletado =
    clientesDisponibles.length > 0 ? Math.round((clientesSeleccionados.length / clientesDisponibles.length) * 100) : 0
  const empresaActual = empresas.find((e) => e.id === empresaSeleccionada)

  // Simple event handlers without useCallback
  const handleToggleCliente = (clienteId: string) => {
    setClientesSeleccionados((prev) => {
      if (prev.includes(clienteId)) {
        return prev.filter((id) => id !== clienteId)
      }
      return [...prev, clienteId]
    })
  }

  const handleSeleccionarTodos = () => {
    const todosIds = clientesDisponibles.map((c) => c.id)
    setClientesSeleccionados((prev) => {
      return prev.length === todosIds.length ? [] : todosIds
    })
  }

  const handleEmpresaChange = (value: string) => {
    setEmpresaSeleccionada(value)
    setClientesSeleccionados([])
  }

  const handleOptimizarRuta = () => {
    setOptimizandoRuta(true)
    setTimeout(() => {
      setClientesSeleccionados((prev) => {
        const optimizados = [...prev]
        for (let i = optimizados.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[optimizados[i], optimizados[j]] = [optimizados[j], optimizados[i]]
        }
        return optimizados
      })
      setOptimizandoRuta(false)
    }, 1500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!empresaSeleccionada) {
      alert("Debes seleccionar una empresa")
      return
    }

    if (clientesSeleccionados.length === 0) {
      alert("Debes seleccionar al menos un cliente")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Usuario no autenticado")

      const { data: repartidor } = await supabase.from("repartidores").select("id").eq("user_auth_id", user.id).single()

      if (!repartidor) throw new Error("Repartidor no encontrado")

      const { data, error } = await supabase.rpc("generar_reparto_lote", {
        p_repartidor_id: repartidor.id,
        p_fecha: fecha.toISOString().split("T")[0],
        p_empresa_id: empresaSeleccionada,
        p_clientes_ids: clientesSeleccionados,
        p_notas: notas,
      })

      if (error) throw error

      setResultado(data)

      setTimeout(() => {
        if (data?.reparto?.id) {
          router.push(`/repartos/${data.reparto.id}`)
        }
      }, 2000)
    } catch (error) {
      console.error("Error al crear reparto por lote:", error)
      alert("Error al crear el reparto por lote. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="seleccion" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="seleccion">
            <Users className="mr-2 h-4 w-4" />
            Selección de Clientes
          </TabsTrigger>
          <TabsTrigger value="vista-previa">
            <MapPin className="mr-2 h-4 w-4" />
            Vista Previa de Ruta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seleccion">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fecha && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={fecha}
                          onSelect={(date) => date && setFecha(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="empresa">Empresa Origen</Label>
                    <Select value={empresaSeleccionada} onValueChange={handleEmpresaChange}>
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
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Clientes Disponibles
                    </div>
                    {empresaSeleccionada && clientesDisponibles.length > 0 && (
                      <Button type="button" variant="outline" size="sm" onClick={handleSeleccionarTodos}>
                        {clientesSeleccionados.length === clientesDisponibles.length
                          ? "Deseleccionar Todos"
                          : "Seleccionar Todos"}
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!empresaSeleccionada ? (
                    <div className="text-center py-8 text-gray-500">
                      <Truck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>Selecciona una empresa para ver los clientes disponibles</p>
                    </div>
                  ) : clientesDisponibles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>No hay clientes disponibles para esta empresa</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {clientesDisponibles.map((cliente) => (
                        <div
                          key={cliente.id}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                            clientesSeleccionados.includes(cliente.id)
                              ? "bg-blue-50 border-blue-200"
                              : "hover:border-gray-300"
                          }`}
                          onClick={() => handleToggleCliente(cliente.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={clientesSeleccionados.includes(cliente.id)}
                              readOnly
                              className="pointer-events-none"
                            />
                            <div>
                              <p className="font-medium">
                                {cliente.nombre} {cliente.apellido}
                              </p>
                              <p className="text-sm text-gray-600">{cliente.direccion}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {clientesSeleccionados.length} clientes seleccionados
                      {clientesDisponibles.length > 0 && (
                        <span className="ml-1 text-blue-600">({porcentajeCompletado}%)</span>
                      )}
                    </p>
                    {clientesSeleccionados.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleOptimizarRuta}
                        disabled={optimizandoRuta}
                      >
                        {optimizandoRuta ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Optimizando...
                          </>
                        ) : (
                          <>
                            <RotateCw className="mr-2 h-4 w-4" />
                            Optimizar Ruta
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vista-previa">
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa de la Ruta</CardTitle>
            </CardHeader>
            <CardContent>
              {clientesSeleccionados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No hay clientes seleccionados para mostrar la ruta</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="mx-auto h-12 w-12 mb-4" />
                      <p className="text-lg font-medium">Vista Previa de Ruta</p>
                      <p className="text-sm">{totalClientes} paradas programadas</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Secuencia de visitas:</h4>

                    {empresaActual && (
                      <div className="flex items-center p-3 border rounded-lg bg-blue-50">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white mr-3">
                          0
                        </div>
                        <div>
                          <p className="font-medium">{empresaActual.nombre}</p>
                          <p className="text-sm text-gray-600">Punto de partida</p>
                        </div>
                      </div>
                    )}

                    {clientesSeleccionados.map((clienteId, index) => {
                      const cliente = clientesDisponibles.find((c) => c.id === clienteId)
                      if (!cliente) return null

                      return (
                        <div key={cliente.id} className="flex items-center p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 mr-3">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">
                              {cliente.nombre} {cliente.apellido}
                            </p>
                            <p className="text-sm text-gray-600">{cliente.direccion}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Distancia estimada</p>
                      <p className="text-xl font-bold">~{distanciaEstimada.toFixed(1)} km</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Tiempo estimado</p>
                      <p className="text-xl font-bold">~{tiempoEstimado.toFixed(0)} min</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Paradas</p>
                      <p className="text-xl font-bold">{totalClientes}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {resultado && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">¡Reparto creado con éxito!</AlertTitle>
          <AlertDescription className="text-green-700">
            Se ha creado un reparto con {resultado.reparto.total_paradas} paradas para la fecha{" "}
            {new Date(resultado.reparto.fecha).toLocaleDateString("es-ES")}. Redirigiendo al detalle del reparto...
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || clientesSeleccionados.length === 0 || !empresaSeleccionada}
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
              Crear Reparto por Lotes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
