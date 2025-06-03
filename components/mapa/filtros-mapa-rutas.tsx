"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface FiltrosMapaRutasProps {
  onFiltrosChange?: (filtros: {
    estado: string[]
    fecha: string | null
    repartidor: string | null
  }) => void
}

export function FiltrosMapaRutas({ onFiltrosChange }: FiltrosMapaRutasProps) {
  const [estadosSeleccionados, setEstadosSeleccionados] = useState<string[]>([])
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)
  const [repartidorSeleccionado, setRepartidorSeleccionado] = useState<string | null>(null)

  const estados = [
    { value: "pendiente", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    { value: "en_progreso", label: "En Progreso", color: "bg-blue-100 text-blue-800" },
    { value: "completado", label: "Completado", color: "bg-green-100 text-green-800" },
    { value: "cancelado", label: "Cancelado", color: "bg-red-100 text-red-800" },
  ]

  const toggleEstado = (estado: string) => {
    const nuevosEstados = estadosSeleccionados.includes(estado)
      ? estadosSeleccionados.filter((e) => e !== estado)
      : [...estadosSeleccionados, estado]

    setEstadosSeleccionados(nuevosEstados)

    if (onFiltrosChange) {
      onFiltrosChange({
        estado: nuevosEstados,
        fecha: fechaSeleccionada ? fechaSeleccionada.toISOString() : null,
        repartidor: repartidorSeleccionado,
      })
    }
  }

  const limpiarFiltros = () => {
    setEstadosSeleccionados([])
    setFechaSeleccionada(null)
    setRepartidorSeleccionado(null)

    if (onFiltrosChange) {
      onFiltrosChange({
        estado: [],
        fecha: null,
        repartidor: null,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtro por Estado */}
        <div>
          <h4 className="text-sm font-medium mb-2">Estado del Reparto</h4>
          <div className="space-y-2">
            {estados.map((estado) => (
              <div
                key={estado.value}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  estadosSeleccionados.includes(estado.value) ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                }`}
                onClick={() => toggleEstado(estado.value)}
              >
                <Badge className={estado.color}>{estado.label}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Filtro por Fecha */}
        <div>
          <h4 className="text-sm font-medium mb-2">Fecha</h4>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fechaSeleccionada ? format(fechaSeleccionada, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={fechaSeleccionada || undefined}
                onSelect={(date) => {
                  setFechaSeleccionada(date || null)
                  if (onFiltrosChange) {
                    onFiltrosChange({
                      estado: estadosSeleccionados,
                      fecha: date ? date.toISOString() : null,
                      repartidor: repartidorSeleccionado,
                    })
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Botón para limpiar filtros */}
        {(estadosSeleccionados.length > 0 || fechaSeleccionada || repartidorSeleccionado) && (
          <Button variant="outline" onClick={limpiarFiltros} className="w-full">
            <X className="mr-2 h-4 w-4" />
            Limpiar Filtros
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
