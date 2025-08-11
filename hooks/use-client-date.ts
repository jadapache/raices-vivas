"use client"

import { useState, useEffect } from 'react'

export function useClientDate(date: string | Date) {
  const [formattedDate, setFormattedDate] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (date) {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      setFormattedDate(dateObj.toLocaleDateString('es-ES'))
    }
  }, [date])

  if (!mounted) {
    return '' // Return empty string during SSR
  }

  return formattedDate
}
