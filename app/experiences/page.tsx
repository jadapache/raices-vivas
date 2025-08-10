"use client"

import { Suspense } from 'react'
import ExperiencesContent from './experiences-content'
import { Loader2 } from 'lucide-react'

export default function ExperiencesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando experiencias...</p>
          </div>
        </div>
      </div>
    }>
      <ExperiencesContent />
    </Suspense>
  )
}
