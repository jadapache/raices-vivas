"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Plus, ArrowLeft, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function NewExperiencePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [includedItems, setIncludedItems] = useState<string[]>([''])
  const [images, setImages] = useState<string[]>([''])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    location: '',
    duration_hours: 1,
    max_participants: 1,
    price_per_person: 0,
    requirements: ''
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser()
        if (!userData) {
          router.push('/auth')
          return
        }
        
        if (userData.profile?.role !== 'host') {
          router.push('/dashboard')
          return
        }
        
        setUser(userData.user)
        setProfile(userData.profile)
      } catch (error) {
        console.error('Error loading user:', error)
        setError('Error al cargar la información del usuario')
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()
  }, [router])

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('El título es requerido')
      return false
    }
    if (!formData.description.trim()) {
      setError('La descripción es requerida')
      return false
    }
    if (!formData.location.trim()) {
      setError('La ubicación es requerida')
      return false
    }
    if (formData.duration_hours < 1) {
      setError('La duración debe ser al menos 1 hora')
      return false
    }
    if (formData.max_participants < 1) {
      setError('Debe permitir al menos 1 participante')
      return false
    }
    if (formData.price_per_person < 0) {
      setError('El precio no puede ser negativo')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    console.log('Starting form submission...') // Debug log

    // Validate form
    if (!validateForm()) {
      setSaving(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Verify user is still authenticated
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !currentUser) {
        throw new Error('Usuario no autenticado')
      }

      console.log('User authenticated:', currentUser.id) // Debug log
      
      // Filter out empty items and images
      const filteredItems = includedItems.filter(item => item.trim() !== '')
      const filteredImages = images.filter(img => img.trim() !== '')

      const experienceData = {
        host_id: currentUser.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        short_description: formData.short_description.trim() || null,
        location: formData.location.trim(),
        duration_hours: formData.duration_hours,
        max_participants: formData.max_participants,
        price_per_person: formData.price_per_person,
        requirements: formData.requirements.trim() || null,
        included_items: filteredItems.length > 0 ? filteredItems : null,
        images: filteredImages.length > 0 ? filteredImages : null
      }

      console.log('Experience data to insert:', experienceData) // Debug log

      const { data, error: insertError } = await supabase
        .from('experiences')
        .insert(experienceData)
        .select()

      if (insertError) {
        console.error('Insert error:', insertError) // Debug log
        throw insertError
      }

      console.log('Experience created successfully:', data) // Debug log

      toast({
        title: "¡Éxito!",
        description: "Experiencia creada correctamente. Está pendiente de revisión."
      })
      
      router.push('/dashboard/experiences')

    } catch (error: any) {
      console.error('Error creating experience:', error)
      
      let errorMessage = 'Error al crear la experiencia'
      
      if (error.message) {
        if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          errorMessage = 'No tienes permisos para crear experiencias. Verifica tu rol de usuario.'
        } else if (error.message.includes('duplicate key')) {
          errorMessage = 'Ya existe una experiencia con estos datos'
        } else if (error.message.includes('foreign key')) {
          errorMessage = 'Error de referencia en los datos'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }

      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const addIncludedItem = () => {
    setIncludedItems([...includedItems, ''])
  }

  const removeIncludedItem = (index: number) => {
    if (includedItems.length > 1) {
      setIncludedItems(includedItems.filter((_, i) => i !== index))
    }
  }

  const updateIncludedItem = (index: number, value: string) => {
    const updated = [...includedItems]
    updated[index] = value
    setIncludedItems(updated)
  }

  const addImage = () => {
    setImages([...images, ''])
  }

  const removeImage = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index))
    }
  }

  const updateImage = (index: number, value: string) => {
    const updated = [...images]
    updated[index] = value
    setImages(updated)
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

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta página</p>
          <Button onClick={() => router.push('/dashboard')}>
            Volver al Dashboard
          </Button>
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
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nueva Experiencia</h1>
          <p className="text-gray-600">
            Crea una nueva experiencia para tu comunidad. Será revisada antes de publicarse.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Información de la Experiencia</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título de la Experiencia *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Taller de Cocina Tradicional"
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Descripción Corta</Label>
                  <Input
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                    placeholder="Breve descripción que aparecerá en las tarjetas"
                    maxLength={100}
                    disabled={saving}
                  />
                  <p className="text-xs text-gray-500">Máximo 100 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción Completa *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe detalladamente tu experiencia, qué harán los participantes, qué aprenderán..."
                    rows={5}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ej: Centro Comunitario, Pueblo San José"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_hours">Duración (horas) *</Label>
                  <Input
                    id="duration_hours"
                    type="number"
                    min="1"
                    max="24"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) || 1 }))}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_participants">Máx. Participantes *</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.max_participants}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 1 }))}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_person">Precio por Persona ($) *</Label>
                  <Input
                    id="price_per_person"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_per_person}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_per_person: parseFloat(e.target.value) || 0 }))}
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Included Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>¿Qué incluye la experiencia?</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addIncludedItem} disabled={saving}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                <div className="space-y-2">
                  {includedItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={item}
                        onChange={(e) => updateIncludedItem(index, e.target.value)}
                        placeholder="Ej: Materiales, refrigerio, certificado..."
                        disabled={saving}
                      />
                      {includedItems.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeIncludedItem(index)}
                          disabled={saving}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Imágenes (URLs)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addImage} disabled={saving}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                <div className="space-y-2">
                  {images.map((image, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="url"
                        value={image}
                        onChange={(e) => updateImage(index, e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        disabled={saving}
                      />
                      {images.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImage(index)}
                          disabled={saving}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Agrega URLs de imágenes que muestren tu experiencia
                </p>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos o Recomendaciones</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="Ej: Ropa cómoda, edad mínima 12 años, no se requiere experiencia previa..."
                  rows={3}
                  disabled={saving}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" asChild disabled={saving}>
                  <Link href="/dashboard">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creando...' : 'Crear Experiencia'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Info
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Proceso de Revisión</p>
                <p>
                  Tu experiencia será revisada por nuestro equipo de coordinadores antes de ser publicada. 
                  Este proceso puede tomar 1-3 días hábiles. Te notificaremos por email cuando sea aprobada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
