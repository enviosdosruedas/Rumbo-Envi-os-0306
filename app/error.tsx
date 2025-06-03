"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log del error para debugging
    console.error("Error en la aplicación:", error)

    // Si el error es de redirección, intentar navegar manualmente
    if (error.message === "Redirect" || error.message.includes("redirect")) {
      console.log("Error de redirección detectado, intentando navegación manual...")
      setTimeout(() => {
        router.push("/welcome")
      }, 1000)
    }
  }, [error, router])

  // Si es un error de redirección, mostrar un mensaje específico
  if (error.message === "Redirect" || error.message.includes("redirect")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Redirigiendo...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Estamos redirigiendo tu sesión. Por favor espera un momento.</p>

            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => router.push("/welcome")} className="bg-blue-600 hover:bg-blue-700">
                <Home className="mr-2 h-4 w-4" />
                Continuar al Sistema
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">¡Oops! Algo salió mal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Ha ocurrido un error inesperado. Por favor, intenta recargar la página o contacta al soporte técnico.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="text-left bg-gray-100 p-3 rounded text-sm text-gray-700">
              <strong>Error:</strong> {error.message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={reset} variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar de Nuevo
            </Button>
            <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Link href="/welcome">
                <Home className="mr-2 h-4 w-4" />
                Ir al Sistema
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
