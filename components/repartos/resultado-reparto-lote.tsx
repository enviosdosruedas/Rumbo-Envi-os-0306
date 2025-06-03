import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

interface ResultadoRepartoLoteProps {
  resultado: {
    success: boolean
    reparto: {
      id: string
      fecha: string
      repartidor_id: string
      total_paradas: number
    }
  }
}

export function ResultadoRepartoLote({ resultado }: ResultadoRepartoLoteProps) {
  if (!resultado || !resultado.success) return null

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center text-green-800">
          <CheckCircle className="mr-2 h-5 w-5" />
          Reparto Creado con Éxito
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-white border-green-200">
          <AlertTitle>Detalles del Reparto</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              <li>
                <strong>ID:</strong> {resultado.reparto.id}
              </li>
              <li>
                <strong>Fecha:</strong> {new Date(resultado.reparto.fecha).toLocaleDateString("es-ES")}
              </li>
              <li>
                <strong>Total de Paradas:</strong> {resultado.reparto.total_paradas}
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex justify-end">
          <Button asChild>
            <Link href={`/repartos/${resultado.reparto.id}`}>
              Ver Detalle del Reparto
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
