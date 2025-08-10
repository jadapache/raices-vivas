import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/navbar'
import { Toaster } from '@/components/ui/toaster'
import { I18nProvider } from '@/lib/i18n/context'
import { AuthProvider } from '@/components/auth/auth-provider'; 

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Raíces Vivas: Explora, Conecta y Transforma',
  description: 'Turismo comunitario sostenible en el corazón del piedemonte amazónico',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
         <I18nProvider>
          <AuthProvider>
            <Navbar />
              <main>{children}</main>
          </AuthProvider>
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  )
}
