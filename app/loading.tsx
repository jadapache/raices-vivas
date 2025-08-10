import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-6 bg-white rounded-lg shadow-lg">
        <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Cargando...
        </h2>
        <p className="text-gray-600">
          Por favor espera un momento
        </p>
      </div>
    </div>
  )
}
