"use client"

import { useState, useEffect, use } from 'react'
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
import { CalendarIcon, MapPin, Clock, Users, CheckCircle, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import NoSSR from '@/components/ui/no-ssr'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/lib/i18n/context'
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

export default function BookExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
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
  const { t, language } = useI18n()

  // Helper fallback: si la traducción devuelve la clave literal, usa fallback según idioma
  const tt = (key: string, fallbackEs: string, fallbackEn: string) => {
    const val = t(key)
    if (val && val !== key) return val
    return language === 'es' ? fallbackEs : fallbackEn
  }

  useEffect(() => {
    fetchExperience()
    loadUser()
  }, [resolvedParams.id])

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
      .eq('id', resolvedParams.id)
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
        title: language === 'es' ? "Error" : "Error",
        description: t('booking.errorRequired'),
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
        experience_id: resolvedParams.id,
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
        title: language === 'es' ? "Error" : "Error",
        description: t('booking.errorBooking'),
        variant: "destructive"
      })
    } else {
      setStep(4) // Success step
      toast({
        title: t('booking.bookingCreated'),
        description: t('booking.bookingDescription')
      })
    }
    
    setBooking(false)
  }

  const getStepText = (stepNumber: number) => {
    switch(stepNumber) {
      case 1: return t('booking.stepDetails')
      case 2: return t('booking.stepDateParticipants')
      case 3: return t('booking.stepContact')
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-slate-200 rounded w-1/2 mx-auto"></div>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="h-96 bg-slate-200 rounded-xl"></div>
                <div className="h-96 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="pt-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('booking.notFound')}</h1>
                <Button onClick={() => router.push('/experiences')} className="rounded-xl">
                  {t('booking.backToExperiences')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">{t('booking.bookingSent')}</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  {t('booking.bookingDescription')}
                </p>
                <div className="space-y-3">
                  <Button onClick={() => router.push('/bookings')} className="w-full h-12 rounded-xl font-semibold">
                    {t('booking.viewBookings')}
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/experiences')} className="w-full h-12 rounded-xl font-semibold">
                    {t('booking.exploreMore')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-50 text-blue-600 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">{language === 'es' ? 'Reserva tu Experiencia' : 'Book Your Experience'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              {t('booking.title')}
            </h1>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-6">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      step >= stepNumber 
                        ? 'bg-blue-600 text-white shadow-lg scale-110' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`w-20 h-1 mx-4 transition-all duration-300 ${
                        step > stepNumber ? 'bg-blue-600' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold text-slate-700">
                  {getStepText(step)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Experience Details */}
            <div>
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900">{experience.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {experience.images && experience.images.length > 0 && (
                    <div className="relative h-56 rounded-xl overflow-hidden">
                      <Image
                        src={experience.images[0] || "/placeholder.svg"}
                        alt={experience.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <MapPin className="h-6 w-6 mx-auto mb-2 text-red-500" />
                      <p className="text-sm font-medium text-slate-600">{language === 'es' ? 'Ubicación' : 'Location'}</p>
                      <p className="text-xs text-slate-800 font-semibold">{experience.location}</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm font-medium text-slate-600">{t('experiences.duration')}</p>
                      <p className="text-xs text-slate-800 font-semibold">
                        {experience.duration_hours} {experience.duration_hours !== 1 ? t('experiences.hours') : t('experiences.hour')}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                      <p className="text-sm font-medium text-slate-600">{language === 'es' ? 'Máximo' : 'Maximum'}</p>
                      <p className="text-xs text-slate-800 font-semibold">{experience.max_participants}</p>
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{experience.description}</p>

                  {experience.included_items && experience.included_items.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-900">{t('booking.includes')}</h4>
                      <div className="space-y-2">
                        {experience.included_items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-sm text-slate-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm text-slate-600">
                      {t('booking.host')} <span className="font-semibold text-slate-900">{experience.profiles?.community_name || experience.profiles?.full_name}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div>
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900">{t('booking.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!user && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertDescription className="text-blue-800">
                        {t('booking.loginRequired')}{' '}
                        <Button variant="link" className="p-0 h-auto text-blue-700 font-semibold" onClick={() => router.push('/auth')}>
                          {t('booking.login')}
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {step >= 1 && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold text-slate-700">{t('booking.selectDate')}</Label>
                        <NoSSR>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal h-12 mt-2 rounded-xl border-slate-200"
                              >
                                <CalendarIcon className="mr-3 h-5 w-5 text-slate-400" />
                                {selectedDate
                                  ? format(selectedDate, 'PPP', { locale: language === 'es' ? es : undefined })
                                  : tt('booking.selectDatePlaceholder', 'Seleccionar fecha', 'Select date')}
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
                        </NoSSR>
                      </div>

                      <div>
                        <Label htmlFor="participants" className="text-base font-semibold text-slate-700">{t('booking.participants')}</Label>
                        <Input
                          id="participants"
                          type="number"
                          min="1"
                          max={experience.max_participants}
                          value={participants}
                          onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                          className="mt-2 h-12 rounded-xl border-slate-200"
                        />
                      </div>
                    </div>
                  )}

                  {step >= 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contact-email" className="text-base font-semibold text-slate-700">{t('booking.contactEmail')} *</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          required
                          className="mt-2 h-12 rounded-xl border-slate-200"
                        />
                      </div>

                      <div>
                        <Label htmlFor="contact-phone" className="text-base font-semibold text-slate-700">{t('booking.contactPhone')}</Label>
                        <Input
                          id="contact-phone"
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="mt-2 h-12 rounded-xl border-slate-200"
                        />
                      </div>

                      <div>
                        <Label htmlFor="special-requests" className="text-base font-semibold text-slate-700">{t('booking.specialRequests')}</Label>
                        <Textarea
                          id="special-requests"
                          placeholder={t('booking.specialRequestsPlaceholder')}
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          className="mt-2 rounded-xl border-slate-200"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Price Summary */}
                  <div className="bg-slate-50 p-6 rounded-xl">
                    <div className="space-y-3">
                      <div className="flex justify-between text-lg">
                        <span>${experience.price_per_person} x {participants} {participants !== 1 ? (language === 'es' ? 'participantes' : 'participants') : (language === 'es' ? 'participante' : 'participant')}</span>
                        <span>${experience.price_per_person * participants}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-xl">
                        <span>{t('booking.total')}</span>
                        <span>${experience.price_per_person * participants}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    {step > 1 && (
                      <Button 
                        variant="outline" 
                        onClick={() => setStep(step - 1)}
                        className="flex-1 h-12 rounded-xl font-semibold"
                      >
                        {t('booking.previous')}
                      </Button>
                    )}
                    
                    {step < 3 ? (
                      <Button 
                        onClick={() => setStep(step + 1)}
                        disabled={!user || (step === 1 && !selectedDate)}
                        className="flex-1 h-12 rounded-xl font-semibold"
                      >
                        {t('booking.continue')}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleBooking}
                        disabled={booking || !user || !selectedDate || !contactEmail}
                        className="flex-1 h-12 rounded-xl font-semibold"
                      >
                        {booking ? t('booking.processing') : t('booking.confirmBooking')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
