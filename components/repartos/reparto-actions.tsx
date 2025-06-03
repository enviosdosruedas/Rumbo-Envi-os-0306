"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, CheckCircle, X, Download, Share, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface RepartoActionsProps {
  reparto: any
}

export function RepartoActions({ reparto }: RepartoActionsProps) {
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  const handleIniciarReparto = async () => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from("repartos")
        .update({
          estado: "en_progreso",
          hora_inicio: new Date().toISOString(),
        })
        .eq("id", reparto.id)

      if (error) throw error
      window.location.reload()
    } catch (error) {
      console.error("Error al iniciar reparto:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleCompletarReparto = async () => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from("repartos")
        .update({
          estado: "completado",
          hora_fin: new Date().toISOString(),
        })
        .eq("id", reparto.id)

      if (error) throw error
      window.location.reload()
    } catch (error) {
      console.error("Error al completar reparto:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelarReparto = async () => {
    if (!confirm("¿Estás seguro de que quieres cancelar este reparto?")) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from("repartos")
        .update({
          estado: "cancelado",
        })
        .eq("id", reparto.id)

      if (error) throw error
      window.location.reload()
    } catch (error) {
      console.error("Error al cancelar reparto:", error)
    } finally {
      setUpdating(false)
    }
  }

  const exportarReporte = () => {
    // En una implementación real, aquí generarías un PDF o Excel
    alert("Funcionalidad de exportación en desarrollo")
  }

  const compartirReparto = () => {
    if (navigator.share) {
      navigator.share({
        title: `Reparto del ${new Date(reparto.fecha).toLocaleDateString("es-ES")}`,
        text: `Reparto con ${reparto.paradas_reparto?.length || 0} paradas`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Enlace copiado al portapapeles")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones del Reparto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reparto.estado === "pendiente" && (
            <Button
              onClick={handleIniciarReparto}
              disabled={updating}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Play className="mr-2 h-4 w-4" />
              {updating ? "Iniciando..." : "Iniciar Reparto"}
            </Button>
          )}

          {reparto.estado === "en_progreso" && (
            <Button
              onClick={handleCompletarReparto}
              disabled={updating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {updating ? "Completando..." : "Completar Reparto"}
            </Button>
          )}

          {(reparto.estado === "pendiente" || reparto.estado === "en_progreso") && (
            <Button onClick={handleCancelarReparto} disabled={updating} variant="destructive" className="w-full">
              <X className="mr-2 h-4 w-4" />
              {updating ? "Cancelando..." : "Cancelar Reparto"}
            </Button>
          )}

          <div className="border-t pt-3 space-y-2">
            <Button onClick={exportarReporte} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Exportar Reporte
            </Button>

            <Button onClick={compartirReparto} variant="outline" className="w-full">
              <Share className="mr-2 h-4 w-4" />
              Compartir Reparto
            </Button>

            <Button variant="outline" className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              Contactar Centro
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
