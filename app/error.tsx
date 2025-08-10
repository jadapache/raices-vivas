'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">¡Algo salió mal!</h1>
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error inesperado. Por favor intenta de nuevo.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500 mb-4">
            ID del error: {error.digest}
          </p>
        )}
        <div className="space-y-3">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar de nuevo
          </Button>
          <Button 
            onClick={() => window.location.href = '/'} 
            variant="outline" 
            className="w-full"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
