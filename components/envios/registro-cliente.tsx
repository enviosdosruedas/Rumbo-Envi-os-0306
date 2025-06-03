"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Cliente } from "@/types"

interface RegistroClienteProps {
  telefono: string
  onClienteRegistrado: (cliente: Cliente) => void
  onVolver: () => void
}

export function RegistroCliente({ telefono, onClienteRegistrado, onVolver }: RegistroClienteProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    direccion: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.direccion.trim()) {
      setError("Por favor completa todos los campos obligatorios")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { data: cliente, error: insertError } = await supabase
        .from("clientes")
        .insert({
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          telefono: telefono,
          email: formData.email.trim() || null,
          direccion: formData.direccion.trim(),
        })
        .select()
        .single()

      if (insertError) throw insertError

      onClienteRegistrado(cliente)
    } catch (err) {
      console.error("Error registrando cliente:", err)
      setError("Error al registrar el cliente. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onVolver}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Registrar Nuevo Cliente
          </CardTitle>
        </div>
        <p className="text-sm text-gray-600">
          Cliente no encontrado para el teléfono: <strong>{telefono}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Nombre del cliente"
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
                placeholder="Apellido del cliente"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="correo@ejemplo.com"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección *</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
              placeholder="Dirección completa del cliente"
              disabled={loading}
              required
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onVolver} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Registrando..." : "Registrar Cliente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
