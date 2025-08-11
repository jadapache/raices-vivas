"use client"

import React, { createContext, useContext, useState } from 'react'
import { translations } from './translations'

type Language = 'es' | 'en'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es')

  const t = (key: string, params?: Record<string, string>): string => {
    try {
      // Verificar que las traducciones están disponibles
      if (!translations || !translations[language]) {
        console.error(`Translations not available for language: ${language}`)
        return key
      }

      const keys = key.split('.')
      let value: any = translations[language]
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          console.warn(`Translation key not found: ${key} for language: ${language}`)
          
          // Intentar fallback a inglés si no estamos ya en inglés
          if (language !== 'en' && translations['en']) {
            let fallbackValue: any = translations['en']
            for (const fallbackK of keys) {
              if (fallbackValue && typeof fallbackValue === 'object' && fallbackK in fallbackValue) {
                fallbackValue = fallbackValue[fallbackK]
              } else {
                return key // Si no existe ni en español ni en inglés, devolver la clave
              }
            }
            if (typeof fallbackValue === 'string') {
              console.info(`Using English fallback for: ${key}`)
              return fallbackValue
            }
          }
          
          return key
        }
      }
      
      if (typeof value !== 'string') {
        console.warn(`Translation value is not a string for key: ${key}, got:`, typeof value)
        return key
      }
      
      // Replace parameters
      if (params) {
        return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
          return str.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue)
        }, value)
      }
      
      return value
    } catch (error) {
      console.error(`Error translating key: ${key}`, error)
      return key
    }
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export function interpolate(template: string, params: Record<string, string>): string {
  return Object.entries(params).reduce((str, [key, value]) => {
    return str.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }, template)
}

