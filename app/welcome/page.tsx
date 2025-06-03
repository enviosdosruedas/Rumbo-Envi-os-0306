"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Truck, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated" | "error">("loading")
  const [message, setMessage] = useState("Verificando autenticación...")
  const router = useRouter()

  useEffect(() => {
    // Usamos una función asíncrona autoejecutable para manejar la autenticación
    const checkAuth = async () => {
      try {
        setMessage("Inicializando sistema...")

        // Creamos el cliente Supabase dentro del efecto para asegurar que estamos en el cliente
        const supabase = createClient()

        // Primero verificamos si hay una sesión activa
        const { data: sessionData } = await supabase.auth.getSession()

        if (!sessionData.session) {
          console.log("No hay sesión activa")
          setStatus("unauthenticated")
          setMessage("No hay sesión activa. Redirigiendo al login...")
          setTimeout(() => router.push("/login"), 1500)
          return
        }

        setMessage("Verificando usuario...")
        // Si hay sesión, obtenemos el usuario
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          console.error("Error de autenticación o usuario no encontrado:", authError)
          setStatus("unauthenticated")
          setMessage("Sesión no válida. Redirigiendo al login...")
          setTimeout(() => router.push("/login"), 1500)
          return
        }

        setMessage("Verificando permisos de repartidor...")
        const { data: repartidor, error: repartidorError } = await supabase
          .from("repartidores")
          .select("id, activo, nombre, apellido")
          .eq("user_auth_id", user.id)
          .single()

        if (repartidorError || !repartidor) {
          console.error("Error al obtener repartidor:", repartidorError)
          setStatus("error")
          setMessage("Usuario no autorizado como repartidor")
          setTimeout(() => router.push("/login"), 2000)
          return
        }

        if (!repartidor.activo) {
          setStatus("error")
          setMessage("Cuenta de repartidor inactiva")
          setTimeout(() => router.push("/login"), 2000)
          return
        }

        setStatus("authenticated")
        setMessage(`¡Bienvenido, ${repartidor.nombre}! Redirigiendo al panel...`)
        setTimeout(() => router.push("/panel"), 1500)
      } catch (error) {
        console.error("Error inesperado:", error)
        setStatus("error")
        setMessage("Error inesperado. Por favor, inicia sesión nuevamente.")
      }
    }

    checkAuth()
  }, [router])

  const getIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      case "authenticated":
        return <CheckCircle className="w-8 h-8 text-green-600" />
      case "error":
      case "unauthenticated":
        return <AlertCircle className="w-8 h-8 text-red-600" />
      default:
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "authenticated":
        return "text-green-600"
      case "error":
      case "unauthenticated":
        return "text-red-600"
      default:
        return "text-blue-600"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Truck className="w-8 h-8 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Rumbo Envíos</h1>
              <p className="text-gray-600">Sistema de Gestión de Repartos</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              {getIcon()}
              <p className={`text-sm font-medium ${getStatusColor()}`}>{message}</p>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  status === "loading"
                    ? "bg-blue-600 animate-pulse"
                    : status === "authenticated"
                      ? "bg-green-600"
                      : "bg-red-600"
                }`}
                style={{
                  width:
                    status === "loading"
                      ? "60%"
                      : status === "authenticated"
                        ? "100%"
                        : status === "error"
                          ? "100%"
                          : "30%",
                }}
              />
            </div>

            {(status === "error" || status === "unauthenticated") && (
              <Button onClick={() => router.push("/login")} className="bg-blue-600 hover:bg-blue-700">
                Ir al Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
