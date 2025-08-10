"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { PasswordStrength } from "@/components/ui/password-strength"
import { validatePassword } from '@/lib/password-validation'
import Link from 'next/link'

export default function ChangePasswordPage() {
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth')
      }
    }
    
    checkAuth()
  }, [router])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setNotification(null)

    // Validate password strength
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      setNotification({
        type: 'error',
        message: 'La nueva contraseña no cumple con los requisitos mínimos de seguridad'
      })
      setLoading(false)
      return
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setNotification({
        type: 'error',
        message: 'Las contraseñas no coinciden'
      })
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      setNotification({
        type: 'success',
        message: '¡Contraseña actualizada exitosamente!'
      })
      
      toast({
        title: "¡Éxito!",
        description: "Tu contraseña ha sido actualizada correctamente"
      })

      // Clear form
      setNewPassword('')
      setConfirmPassword('')

      // Redirect after success
      setTimeout(() => {
        router.push('/profile')
      }, 2000)

    } catch (error: any) {
      console.error('Password change error:', error)
      
      let errorMessage = 'Error al cambiar la contraseña'
      if (error.message.includes('same as the old password')) {
        errorMessage = 'La nueva contraseña debe ser diferente a la actual'
      }

      setNotification({
        type: 'error',
        message: errorMessage
      })
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Perfil
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cambiar Contraseña</h1>
          <p className="text-gray-600">Actualiza tu contraseña para mantener tu cuenta segura</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nueva Contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            {notification && (
              <Alert className={`mb-4 ${
                notification.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                {notification.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }>
                  {notification.message}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa tu nueva contraseña"
                  required
                />
                <PasswordStrength password={newPassword} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-red-600">Las contraseñas no coinciden</p>
                )}
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href="/profile">Cancelar</Link>
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="flex-1"
                >
                  {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
