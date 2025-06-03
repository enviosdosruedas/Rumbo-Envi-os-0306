"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MapPin, Calendar, Package } from "lucide-react"

interface RepartoConParadas {
  id: string
  fecha: string
  estado: string
  notas: string | null
  kilometros_recorridos: number | null
  paradas_reparto: Array<{
    id: string
    completada: boolean
    envios: {
      id: string
      direccion_destino: string
      clientes: {
        nombre: string
        apellido: string | null
      }
    }
  }>
}

interface RepartosTableProps {
  repartos: RepartoConParadas[]
}

export function RepartosTable({ repartos }: RepartosTableProps) {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

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

  const getProgreso = (paradas: RepartoConParadas["paradas_reparto"]) => {
    if (!paradas.length) return { completadas: 0, total: 0, porcentaje: 0 }
    const completadas = paradas.filter((p) => p.completada).length
    const total = paradas.length
    const porcentaje = Math.round((completadas / total) * 100)
    return { completadas, total, porcentaje }
  }

  if (viewMode === "cards") {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setViewMode("table")}>
            Vista de Tabla
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repartos.map((reparto) => {
            const progreso = getProgreso(reparto.paradas_reparto)
            return (
              <Card key={reparto.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{new Date(reparto.fecha).toLocaleDateString("es-ES")}</CardTitle>
                    {getEstadoBadge(reparto.estado)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="mr-2 h-4 w-4" />
                      {progreso.completadas}/{progreso.total} paradas completadas
                    </div>

                    {reparto.kilometros_recorridos && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="mr-2 h-4 w-4" />
                        {reparto.kilometros_recorridos} km recorridos
                      </div>
                    )}

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progreso.porcentaje}%` }}
                      />
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/repartos/${reparto.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setViewMode("cards")}>
          Vista de Cards
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Paradas</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead>Kilómetros</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repartos.map((reparto) => {
              const progreso = getProgreso(reparto.paradas_reparto)
              return (
                <TableRow key={reparto.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      {new Date(reparto.fecha).toLocaleDateString("es-ES")}
                    </div>
                  </TableCell>
                  <TableCell>{getEstadoBadge(reparto.estado)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Package className="mr-2 h-4 w-4 text-gray-400" />
                      {reparto.paradas_reparto.length}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {progreso.completadas}/{progreso.total} ({progreso.porcentaje}%)
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${progreso.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {reparto.kilometros_recorridos ? (
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                        {reparto.kilometros_recorridos} km
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm">
                      <Link href={`/repartos/${reparto.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
