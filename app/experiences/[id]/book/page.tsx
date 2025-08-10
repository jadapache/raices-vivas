"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, MapPin, Clock, Users, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface Experience {
  id: string
  title: string
  description: string
  location: string
  duration_hours: number
  max_participants: number
  price_per_person: number
  included_items: string[]
  images: string[]
  profiles: {
    full_name: string
    community_name: string
  }
}

export default function BookExperiencePage({ params }: { params: { id: string } }) {
  const [experience, setExperience] = useState<Experience | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [step, setStep] = useState(1)
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [participants, setParticipants] = useState(1)
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchExperience()
    loadUser()
  }, [params.id])

  const fetchExperience = async () => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('experiences')
      .select(`
        *,
        profiles:host_id (
          full_name,
          community_name
        )
      `)
      .eq('id', params.id)
      .eq('status', 'approved')
      .single()

    if (error) {
      console.error('Error fetching experience:', error)
      router.push('/experiences')
    } else {
      setExperience(data)
    }
    setLoading(false)
  }

  const loadUser = async () => {
    const userData = await getCurrentUser()
    if (userData) {
      setUser(userData.user)
      setContactEmail(userData.user.email || '')
    }
  }

  const handleBooking = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (!selectedDate || !contactEmail) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    setBooking(true)
    const supabase = createClient()

    const totalAmount = experience!.price_per_person * participants

    const { error } = await supabase
      .from('bookings')
      .insert({
        experience_id: params.id,
        tourist_id: user.id,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        participants,
        total_amount: totalAmount,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        special_requests: specialRequests || null
      })

    if (error) {
      console.error('Error creating booking:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la reserva. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } else {
      setStep(4) // Success step
      toast({
        title: "¡Reserva creada!",
        description: "Tu reserva ha sido enviada y está pendiente de confirmación."
      })
    }
    
    setBooking(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Experiencia no encontrada</h1>
          <Button onClick={() => router.push('/experiences')}>
            Volver a experiencias
          </Button>
        </div>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva Enviada!</h2>
              <p className="text-gray-600 mb-6">
                Tu reserva ha sido enviada al anfitrión y está pendiente de confirmación. 
                Recibirás un email con los detalles de tu reserva.
              </p>
              <div className="space-y-2">
                <Button onClick={() => router.push('/bookings')} className="w-full">
                  Ver mis reservas
                </Button>
                <Button variant="outline" onClick={() => router.push('/experiences')} className="w-full">
                  Explorar más experiencias
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-600">
              {step === 1 ? 'Detalles de la experiencia' : 
               step === 2 ? 'Seleccionar fecha y participantes' : 
               'Información de contacto'}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Experience Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{experience.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {experience.images && experience.images.length > 0 && (
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src={experience.images[0] || "/placeholder.svg"}
                      alt={experience.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{experience.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{experience.duration_hours} hora{experience.duration_hours !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Máximo {experience.max_participants} participantes</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600">{experience.description}</p>

                {experience.included_items && experience.included_items.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Incluye:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {experience.included_items.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">
                    Anfitrión: {experience.profiles?.community_name || experience.profiles?.full_name}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Reservar Experiencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!user && (
                  <Alert>
                    <AlertDescription>
                      Necesitas iniciar sesión para hacer una reserva.{' '}
                      <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/auth')}>
                        Iniciar sesión
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {step >= 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Fecha de la experiencia</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="participants">Número de participantes</Label>
                      <Input
                        id="participants"
                        type="number"
                        min="1"
                        max={experience.max_participants}
                        value={participants}
                        onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                )}

                {step >= 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="contact-email">Email de contacto *</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact-phone">Teléfono de contacto</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="special-requests">Solicitudes especiales</Label>
                      <Textarea
                        id="special-requests"
                        placeholder="¿Tienes alguna solicitud especial o necesidad particular?"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <Separator />

                {/* Price Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>${experience.price_per_person} x {participants} participante{participants !== 1 ? 's' : ''}</span>
                    <span>${experience.price_per_person * participants}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${experience.price_per_person * participants}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {step > 1 && (
                    <Button variant="outline" onClick={() => setStep(step - 1)}>
                      Anterior
                    </Button>
                  )}
                  
                  {step < 3 ? (
                    <Button 
                      onClick={() => setStep(step + 1)}
                      disabled={!user || (step === 1 && !selectedDate)}
                      className="flex-1"
                    >
                      Continuar
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleBooking}
                      disabled={booking || !user || !selectedDate || !contactEmail}
                      className="flex-1"
                    >
                      {booking ? 'Procesando...' : 'Confirmar Reserva'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
