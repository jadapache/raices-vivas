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
import { X, Plus, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Experience {
  id: string
  title: string
  description: string
  short_description: string
  location: string
  duration_hours: number
  max_participants: number
  price_per_person: number
  included_items: string[]
  requirements: string
  images: string[]
  status: string
}

export default function EditExperiencePage({ params }: { params: { id: string } }) {
  const { id } = params; // Extract the ID here

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [experience, setExperience] = useState<Experience | null>(null)
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
    const loadData = async () => {
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

        // Load experience
        const supabase = createClient()
        const { data: experienceData, error: experienceError } = await supabase
          .from('experiences')
          .select('*')
          .eq('id', id) // Use the destructured 'id' here
          .eq('host_id', userData.user.id)
          .single()

        if (experienceError || !experienceData) { 
          console.error('Experience not found or access denied:', experienceError);
          setError('Experiencia no encontrada o no tienes permisos para editarla.');
          setLoading(false); 
          return;
        }

        setExperience(experienceData)
        setFormData({
          title: experienceData.title,
          description: experienceData.description,
          short_description: experienceData.short_description || '',
          location: experienceData.location,
          duration_hours: experienceData.duration_hours,
          max_participants: experienceData.max_participants,
          price_per_person: experienceData.price_per_person,
          requirements: experienceData.requirements || ''
        });
        setIncludedItems(experienceData.included_items || [''])
        setImages(experienceData.images || [''])

      } catch (error) {
        console.error('Error loading data:', error)
        setError('Error al cargar la experiencia')
      } finally {
        setLoading(false);
      }
    };
    
    if (id) { // Use the destructured 'id' here
        loadData();
    } else {
      setLoading(false);
      setError("No se proporcionó un ID de experiencia.");
    }

  }, [router, id]); // Use 'id' in the dependency array

  const validateForm = () => {
    // ... (rest of the function is unchanged)
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

    if (!validateForm()) {
      setSaving(false)
      return
    }

    try {
      const supabase = createClient()
      
      const filteredItems = includedItems.filter(item => item.trim() !== '')
      const filteredImages = images.filter(img => img.trim() !== '')

      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        short_description: formData.short_description.trim() || null,
        location: formData.location.trim(),
        duration_hours: formData.duration_hours,
        max_participants: formData.max_participants,
        price_per_person: formData.price_per_person,
        requirements: formData.requirements.trim() || null,
        included_items: filteredItems.length > 0 ? filteredItems : null,
        images: filteredImages.length > 0 ? filteredImages : null,
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('experiences')
        .update(updateData)
        .eq('id', id) // Use the destructured 'id' here
        .eq('host_id', user.id)

      if (updateError) {
        throw updateError
      }

      toast({
        title: "¡Éxito!",
        description: "Experiencia actualizada correctamente."
      })
      
      router.push('/dashboard/experiences')

    } catch (error: any) {
      console.error('Error updating experience:', error)
      
      let errorMessage = 'Error al actualizar la experiencia'
      if (error.message) {
        errorMessage = `Error: ${error.message}`
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
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando experiencia...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !experience) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard/experiences')}>
            Volver a Mis Experiencias
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
              <Link href="/dashboard/experiences">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Mis Experiencias
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Editar Experiencia</h1>
          <p className="text-gray-600">
            Actualiza la información de tu experiencia.
          </p>
          {experience?.status === 'approved' && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta experiencia está aprobada. Los cambios requerirán una nueva revisión.
              </AlertDescription>
            </Alert>
          )}
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
                    placeholder="Describe detalladamente tu experiencia..."
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
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos o Recomendaciones</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="Ej: Ropa cómoda, edad mínima 12 años..."
                  rows={3}
                  disabled={saving}
                />
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" asChild disabled={saving} className="w-full sm:w-auto">
                  <Link href="/dashboard/experiences">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? 'Actualizando...' : 'Actualizar Experiencia'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}