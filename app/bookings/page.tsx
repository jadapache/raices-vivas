"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'

interface Booking {
  id: string
  booking_date: string
  participants: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'cancelled'
  contact_email: string
  special_requests: string
  created_at: string
  experiences: {
    id: string
    title: string
    location: string
    duration_hours: number
    images: string[]
    profiles: {
      full_name: string
      community_name: string
    }
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const loadUserAndBookings = async () => {
      const userData = await getCurrentUser()
      if (!userData) {
        router.push('/auth')
        return
      }
      
      setUser(userData.user)
      await fetchBookings(userData.user.id)
    }
    
    loadUserAndBookings()
  }, [router])

  const fetchBookings = async (userId: string) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        experiences (
          id,
          title,
          location,
          duration_hours,
          images,
          profiles:host_id (
            full_name,
            community_name
          )
        )
      `)
      .eq('tourist_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
    } else {
      setBookings(data || [])
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Reservas</h1>
        <p className="text-gray-600">Gestiona todas tus reservas de experiencias</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes reservas aún</h3>
            <p className="text-gray-600 mb-6">¡Explora nuestras experiencias y haz tu primera reserva!</p>
            <Button asChild>
              <Link href="/experiences">Explorar Experiencias</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Experience Image */}
                  <div className="lg:w-48 h-32 relative rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={booking.experiences.images?.[0] || `/placeholder.svg?height=128&width=192&query=${booking.experiences.title}`}
                      alt={booking.experiences.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {booking.experiences.title}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-1">
                          <MapPin className="h-4 w-4 mr-2" />
                          {booking.experiences.location}
                        </div>
                        <p className="text-sm text-gray-500">
                          Anfitrión: {booking.experiences.profiles?.community_name || booking.experiences.profiles?.full_name}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Fecha</p>
                          <p>{new Date(booking.booking_date).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Participantes</p>
                          <p>{booking.participants} persona{booking.participants !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Total</p>
                          <p>${booking.total_amount}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Reservado</p>
                        <p>{new Date(booking.created_at).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>

                    {booking.special_requests && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Solicitudes especiales:</p>
                        <p className="text-sm text-gray-600">{booking.special_requests}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Contacto: {booking.contact_email}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/experiences/${booking.experiences.id}`}>
                            Ver experiencia
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/bookings/${booking.id}`}>
                            Ver detalles
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
