"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Building, Loader2, Lock, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    community_name: '',
    avatar_url: ''
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    
    const loadUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          if (mounted) {
            router.push('/auth')
          }
          return
        }
        
        if (mounted) {
          setUser(user)
        }
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          console.error('Profile error:', profileError)
          return
        }
        
        if (mounted) {
          setProfile(profile)
          setFormData({
            full_name: profile?.full_name || '',
            phone: profile?.phone || '',
            community_name: profile?.community_name || '',
            avatar_url: profile?.avatar_url || ''
          })
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    loadUser()
    
    return () => {
      mounted = false
    }
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        community_name: formData.community_name,
        avatar_url: formData.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive"
      })
    } else {
      toast({
        title: "¡Éxito!",
        description: "Perfil actualizado correctamente"
      })
      
      // Reload profile data
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
    }
    
    setSaving(false)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'host':
        return <Badge className="bg-blue-100 text-blue-800">Anfitrión</Badge>
      case 'coordinator':
        return <Badge className="bg-purple-100 text-purple-800">Coordinador</Badge>
      case 'tourist':
        return <Badge className="bg-green-100 text-green-800">Visitante</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando perfil...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error de acceso</h1>
            <p className="text-gray-600 mb-4">No se pudo cargar tu perfil</p>
            <Button onClick={() => router.push('/auth')}>
              Volver al inicio de sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
        </div>

        <div className="space-y-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name} />
                  <AvatarFallback className="text-lg">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{profile?.full_name}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="mt-2">
                    {getRoleBadge(profile?.role)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{user?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile?.community_name && (
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{profile.community_name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>Miembro desde {new Date(profile?.created_at).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Editar Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Tu número de teléfono"
                  />
                </div>

                {profile?.role === 'host' && (
                  <div className="space-y-2">
                    <Label htmlFor="community_name">Nombre de la Comunidad</Label>
                    <Input
                      id="community_name"
                      value={formData.community_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, community_name: e.target.value }))}
                      placeholder="Nombre de tu comunidad"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="avatar_url">URL del Avatar</Label>
                  <Input
                    id="avatar_url"
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                    placeholder="https://ejemplo.com/tu-avatar.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cambiar Contraseña</h4>
                  <p className="text-sm text-gray-600">Actualiza tu contraseña para mantener tu cuenta segura</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/profile/change-password">
                    <Lock className="h-4 w-4 mr-2" />
                    Cambiar
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificaciones por Email</h4>
                  <p className="text-sm text-gray-600">Recibe actualizaciones sobre tus reservas y experiencias</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/profile/notifications">
                    <Bell className="h-4 w-4 mr-2" />
                    Configurar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
