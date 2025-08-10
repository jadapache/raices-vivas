"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, Bell, Mail, Calendar, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface NotificationSettings {
  booking_confirmations: boolean
  booking_reminders: boolean
  experience_updates: boolean
  marketing_emails: boolean
  review_requests: boolean
}

export default function NotificationSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    booking_confirmations: true,
    booking_reminders: true,
    experience_updates: true,
    marketing_emails: false,
    review_requests: true
  })
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadUserAndSettings = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          router.push('/auth')
          return
        }
        
        setUser(user)
        
        // Load notification settings from user metadata or database
        // For now, we'll use default settings, but you could store these in a separate table
        const userMetadata = user.user_metadata || {}
        setSettings({
          booking_confirmations: userMetadata.booking_confirmations ?? true,
          booking_reminders: userMetadata.booking_reminders ?? true,
          experience_updates: userMetadata.experience_updates ?? true,
          marketing_emails: userMetadata.marketing_emails ?? false,
          review_requests: userMetadata.review_requests ?? true
        })
        
      } catch (error) {
        console.error('Error loading settings:', error)
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }
    
    loadUserAndSettings()
  }, [router])

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setNotification(null)

    try {
      const supabase = createClient()
      
      // Update user metadata with notification settings
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          ...settings
        }
      })

      if (error) {
        throw error
      }

      setNotification({
        type: 'success',
        message: '¡Configuración de notificaciones actualizada exitosamente!'
      })
      
      toast({
        title: "¡Éxito!",
        description: "Tus preferencias de notificación han sido guardadas"
      })

    } catch (error: any) {
      console.error('Settings save error:', error)
      
      setNotification({
        type: 'error',
        message: 'Error al guardar la configuración'
      })
      
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración de Notificaciones</h1>
          <p className="text-gray-600">Personaliza qué notificaciones quieres recibir por email</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Preferencias de Notificación</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {notification && (
              <Alert className={`${
                notification.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <CheckCircle className={`h-4 w-4 ${
                  notification.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`} />
                <AlertDescription className={
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }>
                  {notification.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Booking Notifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Reservas</span>
              </h3>
              
              <div className="space-y-4 pl-7">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking-confirmations">Confirmaciones de Reserva</Label>
                    <p className="text-sm text-gray-500">
                      Recibe emails cuando tus reservas sean confirmadas o canceladas
                    </p>
                  </div>
                  <Switch
                    id="booking-confirmations"
                    checked={settings.booking_confirmations}
                    onCheckedChange={(value) => handleSettingChange('booking_confirmations', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking-reminders">Recordatorios de Reserva</Label>
                    <p className="text-sm text-gray-500">
                      Recibe recordatorios 24 horas antes de tu experiencia
                    </p>
                  </div>
                  <Switch
                    id="booking-reminders"
                    checked={settings.booking_reminders}
                    onCheckedChange={(value) => handleSettingChange('booking_reminders', value)}
                  />
                </div>
              </div>
            </div>

            {/* Experience Notifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Experiencias</span>
              </h3>
              
              <div className="space-y-4 pl-7">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="experience-updates">Actualizaciones de Experiencias</Label>
                    <p className="text-sm text-gray-500">
                      Recibe notificaciones sobre cambios en experiencias que has reservado
                    </p>
                  </div>
                  <Switch
                    id="experience-updates"
                    checked={settings.experience_updates}
                    onCheckedChange={(value) => handleSettingChange('experience_updates', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="review-requests">Solicitudes de Reseña</Label>
                    <p className="text-sm text-gray-500">
                      Recibe invitaciones para reseñar experiencias después de completarlas
                    </p>
                  </div>
                  <Switch
                    id="review-requests"
                    checked={settings.review_requests}
                    onCheckedChange={(value) => handleSettingChange('review_requests', value)}
                  />
                </div>
              </div>
            </div>

            {/* Marketing Notifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Marketing</span>
              </h3>
              
              <div className="space-y-4 pl-7">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Emails Promocionales</Label>
                    <p className="text-sm text-gray-500">
                      Recibe información sobre nuevas experiencias y ofertas especiales
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={settings.marketing_emails}
                    onCheckedChange={(value) => handleSettingChange('marketing_emails', value)}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button variant="outline" asChild>
                <Link href="/profile">Cancelar</Link>
              </Button>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
