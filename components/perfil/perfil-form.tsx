"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Truck, Shield, Save, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Repartidor } from "@/types"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface PerfilFormProps {
  repartidor: Repartidor
  user: SupabaseUser
}

export function PerfilForm({ repartidor, user }: PerfilFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Estados para información personal
  const [nombre, setNombre] = useState(repartidor.nombre)
  const [apellido, setApellido] = useState(repartidor.apellido)
  const [telefono, setTelefono] = useState(repartidor.telefono || "")
  const [email, setEmail] = useState(repartidor.email || user.email || "")

  // Estados para información del vehículo
  const [vehiculo, setVehiculo] = useState(repartidor.vehiculo || "")
  const [matricula, setMatricula] = useState(repartidor.matricula || "")
  const [licenciaConducir, setLicenciaConducir] = useState(repartidor.licencia_conducir || "")

  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const supabase = createClient()

  const handleUpdatePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from("repartidores")
        .update({
          nombre,
          apellido,
          telefono,
          email,
        })
        .eq("id", repartidor.id)

      if (error) throw error

      setMessage({ type: "success", text: "Información personal actualizada correctamente" })
    } catch (error) {
      console.error("Error al actualizar información personal:", error)
      setMessage({ type: "error", text: "Error al actualizar la información personal" })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateVehicleInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from("repartidores")
        .update({
          vehiculo,
          matricula,
          licencia_conducir: licenciaConducir,
        })
        .eq("id", repartidor.id)

      if (error) throw error

      setMessage({ type: "success", text: "Información del vehículo actualizada correctamente" })
    } catch (error) {
      console.error("Error al actualizar información del vehículo:", error)
      setMessage({ type: "error", text: "Error al actualizar la información del vehículo" })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setMessage({ type: "success", text: "Contraseña actualizada correctamente" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      setMessage({ type: "error", text: "Error al cambiar la contraseña" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración del Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert
            className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">
              <User className="mr-2 h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="vehiculo">
              <Truck className="mr-2 h-4 w-4" />
              Vehículo
            </TabsTrigger>
            <TabsTrigger value="seguridad">
              <Shield className="mr-2 h-4 w-4" />
              Seguridad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <form onSubmit={handleUpdatePersonalInfo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+54 11 1234-5678"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fecha-ingreso">Fecha de Ingreso</Label>
                <Input
                  id="fecha-ingreso"
                  value={
                    repartidor.fecha_ingreso
                      ? new Date(repartidor.fecha_ingreso).toLocaleDateString("es-ES")
                      : "No especificada"
                  }
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Información Personal
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="vehiculo" className="space-y-4">
            <form onSubmit={handleUpdateVehicleInfo} className="space-y-4">
              <div>
                <Label htmlFor="vehiculo">Tipo de Vehículo</Label>
                <Input
                  id="vehiculo"
                  value={vehiculo}
                  onChange={(e) => setVehiculo(e.target.value)}
                  placeholder="Ej: Motocicleta Honda 150cc"
                />
              </div>

              <div>
                <Label htmlFor="matricula">Matrícula/Patente</Label>
                <Input
                  id="matricula"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ej: ABC123"
                />
              </div>

              <div>
                <Label htmlFor="licencia">Número de Licencia de Conducir</Label>
                <Input
                  id="licencia"
                  value={licenciaConducir}
                  onChange={(e) => setLicenciaConducir(e.target.value)}
                  placeholder="Ej: 12345678"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Información del Vehículo
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="seguridad" className="space-y-4">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="current-password">Contraseña Actual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                />
              </div>

              <div>
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Recomendaciones de Seguridad:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Usa al menos 8 caracteres</li>
                  <li>• Incluye mayúsculas y minúsculas</li>
                  <li>• Agrega números y símbolos</li>
                  <li>• No uses información personal</li>
                </ul>
              </div>

              <Button type="submit" disabled={loading || !newPassword || !confirmPassword} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cambiando Contraseña...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Cambiar Contraseña
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
