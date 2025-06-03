import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft, Truck } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Página No Encontrada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-6xl font-bold text-blue-600 mb-4">404</div>
          <p className="text-gray-600">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild variant="outline" className="flex-1">
              <Link href="javascript:history.back()">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver Atrás
              </Link>
            </Button>
            <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Link href="/panel">
                <Home className="mr-2 h-4 w-4" />
                Ir al Panel
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
