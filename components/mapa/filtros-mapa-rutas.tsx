"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Filter, RefreshCw } from "lucide-react"

export function FiltrosMapaRutas() {
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroFecha, setFiltroFecha] = useState("hoy")
  const [mostrarCompletadas, setMostrarCompletadas] = useState(true)
  const [mostrarPendientes, setMostrarPendientes] = useState(true)
  const [mostrarEnProgreso, setMostrarEnProgreso] = useState(true)

  const limpiarFiltros = () => {
    setFiltroEstado("todos")
    setFiltroFecha("hoy")
    setMostrarCompletadas(true)
    setMostrarPendientes(true)
    setMostrarEnProgreso(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="mr-2 h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="estado">Estado del Reparto</Label>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="en_progreso">En Progreso</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="fecha">Período</Label>
          <Select value={filtroFecha} onValueChange={setFiltroFecha}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="ayer">Ayer</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Mostrar Paradas</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="completadas" checked={mostrarCompletadas} onCheckedChange={setMostrarCompletadas} />
              <Label htmlFor="completadas" className="text-sm">
                Completadas
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="pendientes" checked={mostrarPendientes} onCheckedChange={setMostrarPendientes} />
              <Label htmlFor="pendientes" className="text-sm">
                Pendientes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="en-progreso" checked={mostrarEnProgreso} onCheckedChange={setMostrarEnProgreso} />
              <Label htmlFor="en-progreso" className="text-sm">
                En Progreso
              </Label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={limpiarFiltros} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpiar Filtros
          </Button>
        </div>

        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Repartos visibles:</span>
            <span className="font-medium">3</span>
          </div>
          <div className="flex justify-between">
            <span>Paradas totales:</span>
            <span className="font-medium">15</span>
          </div>
          <div className="flex justify-between">
            <span>Última actualización:</span>
            <span className="font-medium">Hace 2 min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
