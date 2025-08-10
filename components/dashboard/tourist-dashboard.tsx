"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, DollarSign, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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

export default function TouristDashboard({ user, profile }: { user: any, profile: any }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalSpent: 0
  })

  useEffect(() => {
    fetchBookings()
  }, [user.id])

  const fetchBookings = async () => {
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
      .eq('tourist_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
    } else if (data) {
      setBookings(data)
      setStats({
        totalBookings: data.length,
        confirmedBookings: data.filter(booking => booking.status === 'confirmed').length,
        pendingBookings: data.filter(booking => booking.status === 'pending').length,
        totalSpent: data
          .filter(booking => booking.status === 'confirmed')
          .reduce((sum, booking) => sum + booking.total_amount, 0)
      })
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
          <div className="grid md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mi Panel de Visitante
        </h1>
        <p className="text-gray-600">
          Bienvenido, {profile.full_name} - Gestiona tus reservas y descubre nuevas experiencias
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* My Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mis Reservas</CardTitle>
                  <CardDescription>Gestiona tus reservas de experiencias</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/bookings">Ver todas</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No tienes reservas aún</p>
                    <Button asChild>
                      <Link href="/experiences">
                        <Search className="h-4 w-4 mr-2" />
                        Explorar Experiencias
                      </Link>
                    </Button>
                  </div>
                ) : (
                  bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold">{booking.experiences.title}</h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {booking.experiences.location}
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Fecha:</span>
                          <p>{new Date(booking.booking_date).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div>
                          <span className="font-medium">Participantes:</span>
                          <p>{booking.participants} persona{booking.participants !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <span className="font-medium">Total:</span>
                          <p>${booking.total_amount}</p>
                        </div>
                        <div>
                          <span className="font-medium">Anfitrión:</span>
                          <p>{booking.experiences.profiles?.community_name || booking.experiences.profiles?.full_name}</p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/bookings/${booking.id}`}>Ver detalles</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/experiences">
                  <Search className="h-4 w-4 mr-2" />
                  Explorar Experiencias
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/bookings">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Mis Reservas
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/profile">
                  <Users className="h-4 w-4 mr-2" />
                  Mi Perfil
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="text-sm">
                      <p className="font-medium">{booking.experiences.title}</p>
                      <p className="text-gray-500">
                        Reservado el {new Date(booking.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay actividad reciente</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
