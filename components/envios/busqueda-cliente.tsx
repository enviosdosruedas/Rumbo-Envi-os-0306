"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Phone } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Cliente } from "@/types"

interface BusquedaClienteProps {
  onClienteEncontrado: (cliente: Cliente) => void
  onClienteNoEncontrado: (telefono: string) => void
}

export function BusquedaCliente({ onClienteEncontrado, onClienteNoEncontrado }: BusquedaClienteProps) {
  const [telefono, setTelefono] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  const handleBuscar = async () => {
    if (!telefono.trim()) {
      setError("Por favor ingresa un número de teléfono")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { data: cliente, error: searchError } = await supabase
        .from("clientes")
        .select("*")
        .eq("telefono", telefono.trim())
        .single()

      if (searchError && searchError.code !== "PGRST116") {
        throw searchError
      }

      if (cliente) {
        onClienteEncontrado(cliente)
      } else {
        onClienteNoEncontrado(telefono.trim())
      }
    } catch (err) {
      console.error("Error buscando cliente:", err)
      setError("Error al buscar el cliente. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBuscar()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Phone className="h-5 w-5" />
          Buscar Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="telefono">Número de Teléfono</Label>
          <Input
            id="telefono"
            type="tel"
            placeholder="Ej: +1234567890"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

        <Button onClick={handleBuscar} disabled={loading || !telefono.trim()} className="w-full">
          {loading ? (
            "Buscando..."
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          Si el cliente no existe, podrás registrarlo después de la búsqueda
        </div>
      </CardContent>
    </Card>
  )
}
