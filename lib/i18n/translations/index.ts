import { es } from './es'
import { en } from './en'

// Verificar que las traducciones se importan correctamente
console.log('Loading translations...', { es: !!es, en: !!en })

export const translations = {
  es,
  en
}

export type TranslationKey = keyof typeof es

// Verificar que las claves importantes existen
if (typeof window !== 'undefined') {
    if (!es.nav || !en.nav) {
        console.error('Missing navigation keys in translations')
    }
    if (!es.home || !en.home) {
        console.error('Missing home keys in translations')
    }
    if (!es.experiences || !en.experiences) {
        console.error('Missing experiences keys in translations')
    }
}
