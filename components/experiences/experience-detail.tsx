"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  Shield,
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import Image from 'next/image'
import Link from 'next/link'
import NoSSR from '@/components/ui/no-ssr'

interface Experience {
  id: string
  title: string
  description: string
  short_description?: string
  location: string
  duration_hours: number
  max_participants: number
  price_per_person: number
  included_items?: string[]
  requirements?: string
  images?: string[]
  status: string
  created_at: string
  profiles: {
    full_name: string
    community_name?: string
    avatar_url?: string
  }
}

interface ExperienceDetailProps {
  experience: Experience
}

export default function ExperienceDetail({ experience }: ExperienceDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const { t, language } = useI18n()

  // Helper de fallback: experienceDetail.key -> (si no) experiences.key
  const exp = (suffix: string) => {
    const k1 = `experienceDetail.${suffix}`
    const v1 = t(k1)
    if (v1 && v1 !== k1) return v1
    const k2 = `experiences.${suffix}`
    const v2 = t(k2)
    if (v2 && v2 !== k2) return v2
    return suffix
  }

  const images = experience.images && experience.images.length > 0 
    ? experience.images 
    : [`/placeholder.svg?height=400&width=600&query=${experience.title}`]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: experience.title,
          text: experience.short_description || experience.description,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Textos quemados (hardcoded) para evitar búsquedas i18n de las claves problemáticas
  const labels = {
    topRated: language === 'es' ? '⭐ Experiencia mejor valorada' : '⭐ Top-rated experience',
    superhost: language === 'es' ? '🏆 Anfitrión Superhost' : '🏆 Superhost',
    noChargeYet: language === 'es' ? 'No se te cobrará por el momento' : "You won't be charged yet",
    yourHost: language === 'es' ? 'Tu anfitrión' : 'Your host',
    verifiedHost: language === 'es' ? 'Anfitrión verificado' : 'Verified host',
    hostDescription: language === 'es'
      ? 'Compartiendo las tradiciones y cultura de nuestra comunidad con visitantes de todo el mundo. Cada experiencia es una oportunidad de conexión auténtica.'
      : 'Sharing the traditions and culture of our community with visitors from around the world. Each experience is an opportunity for authentic connection.',
    perPerson: language === 'es' ? 'por persona' : 'per person',
    bookNow: language === 'es' ? 'Reservar ahora' : 'Book now',
    serviceFee: language === 'es' ? 'Tarifa de servicio' : 'Service fee',
    total: language === 'es' ? 'Total' : 'Total',
    // NUEVOS (antes fallaban vía i18n)
    about: language === 'es' ? 'Acerca de esta experiencia' : 'About this experience',
    included: language === 'es' ? 'Qué incluye' : "What's included",
    requirements: language === 'es' ? 'Requisitos y recomendaciones' : 'Requirements and recommendations',
    cancellation: language === 'es' ? 'Cancelación' : 'Cancellation',
    free: language === 'es' ? 'Gratis' : 'Free',
    availability: language === 'es' ? 'Disponibilidad' : 'Availability',
    daily: language === 'es' ? 'Diaria' : 'Daily'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                  {experience.title}
                </h1>
                <div className="flex items-center space-x-6 text-slate-600 mb-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-lg">4.8</span>
                    <span className="text-sm">(24 {language === 'es' ? 'reseñas' : 'reviews'})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">{experience.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? exp('saved') : exp('save')}
                </Button>
                <NoSSR>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleShare}
                    className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {exp('share')}
                  </Button>
                </NoSSR>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <div className="relative h-72 md:h-96 lg:h-[500px]">
              <Image
                src={images[currentImageIndex]}
                alt={`${experience.title} - ${language === 'es' ? 'Imagen' : 'Image'} ${currentImageIndex + 1}`}
                fill
                className="object-cover"
              />
              
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full w-12 h-12"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full w-12 h-12"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
              
              <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium">
                <Camera className="h-4 w-4 inline mr-2" />
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
            
            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="p-6 bg-slate-50">
                <div className="flex space-x-3 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        index === currentImageIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <Clock className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <p className="text-sm font-medium text-slate-600">{t('experiences.duration')}</p>
                  <p className="text-xl font-bold text-slate-900">
                    {experience.duration_hours} {experience.duration_hours === 1 ? t('experiences.hour') : t('experiences.hours')}
                  </p>
                </Card>
                
                <Card className="text-center p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <Users className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                  <p className="text-sm font-medium text-slate-600">{t('experiences.participants')}</p>
                  <p className="text-xl font-bold text-slate-900">
                    {language === 'es' ? 'Máx.' : 'Max'} {experience.max_participants}
                  </p>
                </Card>
                
                <Card className="text-center p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <Shield className="h-8 w-8 mx-auto mb-3 text-emerald-600" />
                  <p className="text-sm font-medium text-slate-600">{labels.cancellation}</p>
                  <p className="text-xl font-bold text-slate-900">{labels.free}</p>
                </Card>
                
                <Card className="text-center p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <Calendar className="h-8 w-8 mx-auto mb-3 text-amber-600" />
                  <p className="text-sm font-medium text-slate-600">{labels.availability}</p>
                  <p className="text-xl font-bold text-slate-900">{labels.daily}</p>
                </Card>
              </div>

              {/* Description */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900">{labels.about}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line text-lg">
                    {experience.description}
                  </p>
                </CardContent>
              </Card>

              {/* What's Included */}
              {experience.included_items && experience.included_items.length > 0 && (
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">{labels.included}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {experience.included_items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-xl">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0"></div>
                          <span className="text-slate-800 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {experience.requirements && (
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">{labels.requirements}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed text-lg">{experience.requirements}</p>
                  </CardContent>
                </Card>
              )}

              {/* Host Info */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900">{labels.yourHost}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-6">
                    <Avatar className="h-20 w-20 ring-4 ring-blue-100">
                      <AvatarImage src={experience.profiles?.avatar_url} />
                      <AvatarFallback className="text-xl font-bold">
                        {experience.profiles?.full_name?.charAt(0) || 'H'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {experience.profiles?.community_name || experience.profiles?.full_name}
                      </h3>
                      <p className="text-blue-600 font-semibold mb-4">{labels.verifiedHost}</p>
                      <p className="text-slate-700 leading-relaxed">
                        {labels.hostDescription}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="text-4xl font-bold text-slate-900">
                      ${experience.price_per_person}
                    </div>
                    <div className="text-slate-600 text-lg">{labels.perPerson}</div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <Badge variant="outline" className="w-full justify-center py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800 font-semibold">
                      {labels.topRated}
                    </Badge>
                    <Badge variant="outline" className="w-full justify-center py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-800 font-semibold">
                      {labels.superhost}
                    </Badge>
                  </div>

                  <Button asChild className="w-full mb-6 h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" size="lg">
                    <Link href={`/experiences/${experience.id}/book`}>
                      {labels.bookNow}
                    </Link>
                  </Button>

                  <p className="text-center text-sm text-slate-500 mb-6">
                    {labels.noChargeYet}
                  </p>

                  <Separator className="my-6" />

                  <div className="space-y-3 text-base">
                    <div className="flex justify-between">
                      <span>${experience.price_per_person} x 1 {language === 'es' ? 'persona' : 'person'}</span>
                      <span>${experience.price_per_person}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{labels.serviceFee}</span>
                      <span>$0</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>{labels.total}</span>
                      <span>${experience.price_per_person}</span>
                    </div>
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
