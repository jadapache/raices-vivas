import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/navbar'
import { Toaster } from '@/components/ui/toaster'
import { I18nProvider } from '@/lib/i18n/context'
import { AuthProvider } from '@/components/auth/auth-provider'; 
import Footer from '../components/layout/footer'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Raíces Vivas: Explora, Conecta y Transforma',
  description: 'Turismo comunitario sostenible en el corazón del piedemonte amazónico',
  keywords: 'turismo comunitario, amazonia, colombia, experiencias auténticas, sostenible',
  authors: [{ name: 'Raíces Vivas' }],
  openGraph: {
    title: 'Raíces Vivas: Explora, Conecta y Transforma',
    description: 'Turismo comunitario sostenible en el corazón del piedemonte amazónico',
    type: 'website',
    locale: 'es_ES',
    siteName: 'Raíces Vivas'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 min-h-screen`}>
        <div className="flex min-h-screen flex-col">
          <I18nProvider>
            <AuthProvider>
              <Toaster />
              <Navbar />
              <main>
                <div className="min-h-[calc(100vh-4rem)]">
                  {children}
                </div>
              </main>
              <Footer />
            </AuthProvider>
          </I18nProvider>
        </div>
      </body>
    </html>
  )
}
