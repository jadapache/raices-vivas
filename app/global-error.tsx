'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Crítico</h1>
            <p className="text-gray-600 mb-6">
              La aplicación ha encontrado un error crítico y necesita reiniciarse.
            </p>
            {error.digest && (
              <p className="text-sm text-gray-500 mb-4">
                ID del error: {error.digest}
              </p>
            )}
            <Button onClick={reset} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reiniciar aplicación
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
