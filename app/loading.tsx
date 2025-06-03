import { Loader2, Truck } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 animate-pulse">
          <Truck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Rumbo Envíos</h1>
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Cargando sistema...</span>
        </div>
        <div className="mt-4 w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: "60%" }}></div>
        </div>
      </div>
    </div>
  )
}
