"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Calendar, Users, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/context'
import Link from 'next/link'
import { useRouter } from 'next/navigation' // Importamos useRouter para la redirección

// Interfaz para la experiencia
interface Experience {
  id: string
  title: string
  location: string
  price_per_person: number
  max_participants: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

// Interfaz para la reserva
interface Booking {
  id: string
  booking_date: string
  participants: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'cancelled'
  contact_email: string
  experiences: {
    title: string
  }
}

export default function HostDashboard() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalExperiences: 0,
    approvedExperiences: 0,
    pendingBookings: 0,
    totalRevenue: 0
  })
  const [user, setUser] = useState<any>(null) // Nuevo estado para el usuario
  const [profile, setProfile] = useState<any>(null) // Nuevo estado para el perfil
  const { t } = useI18n()
  const router = useRouter() // Inicializa el router

  // Este useEffect es la clave para manejar la sesión correctamente
  useEffect(() => {
    const supabase = createClient()
    
    // Escucha los cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Si no hay sesión, redirige al usuario.
      if (!session) {
        setUser(null)
        setProfile(null)
        router.push('/login') 
      } else {
        // Si hay una sesión, establece el usuario y procede a cargar el perfil y los datos
        setUser(session.user)
        fetchProfile(session.user.id)
        fetchData(session.user.id)
      }
    })

    // Limpia el listener cuando el componente se desmonta
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Función para obtener el perfil del usuario
  const fetchProfile = async (userId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error("Error fetching profile:", error)
    } else {
      setProfile(data)
    }
  }

  // Función para obtener los datos. Ahora toma el userId como argumento.
  const fetchData = async (userId: string) => {
    setLoading(true)
    const supabase = createClient()
    
    // Fetch experiences
    const { data: experiencesData, error: experiencesError } = await supabase
      .from('experiences')
      .select('*')
      .eq('host_id', userId) // Usamos el userId del listener
      .order('created_at', { ascending: false })

    // Fetch bookings for host's experiences
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        experiences!inner(title, host_id)
      `)
      .eq('experiences.host_id', userId) // Usamos el userId del listener
      .order('created_at', { ascending: false })

    if (experiencesError) {
      console.error('Error fetching experiences:', experiencesError)
    } else if (experiencesData) {
      setExperiences(experiencesData)
      setStats(prev => ({
        ...prev,
        totalExperiences: experiencesData.length,
        approvedExperiences: experiencesData.filter(exp => exp.status === 'approved').length
      }))
    }

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
    } else if (bookingsData) {
      setBookings(bookingsData as Booking[])
      setStats(prev => ({
        ...prev,
        pendingBookings: bookingsData.filter(booking => booking.status === 'pending').length,
        totalRevenue: bookingsData
          .filter(booking => booking.status === 'confirmed')
          .reduce((sum, booking) => sum + booking.total_amount, 0)
      }))
    }

    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getBookingStatusBadge = (status: string) => {
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

  if (loading || !user || !profile) {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {t('dashboard.welcome')}, {profile?.full_name || 'Usuario'}
        </h1>
        <p className="text-gray-600">
          {t('dashboard.hostPanel')}{profile?.community_name ? ` - ${profile.community_name}` : ''}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalExperiences')}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExperiences}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.approved')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedExperiences}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.pendingBookings')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Experiences */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>{t('dashboard.myExperiences')}</CardTitle>
                <CardDescription>{t('dashboard.manageExperiences')}</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/experiences/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('dashboard.newExperience')}
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {experiences.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {t('dashboard.noExperiences')}
                </p>
              ) : (
                experiences.slice(0, 5).map((experience) => (
                  <div key={experience.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{experience.title}</h4>
                      <p className="text-sm text-gray-500 truncate">{experience.location}</p>
                      <p className="text-sm text-gray-500">${experience.price_per_person}/{t('common.perPerson')}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getStatusBadge(experience.status)}
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/experiences/${experience.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/experiences/${experience.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {experiences.length > 5 && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/experiences">{t('dashboard.viewAll')}</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentBookings')}</CardTitle>
            <CardDescription>{t('dashboard.manageBookings')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {t('dashboard.noBookings')}
                </p>
              ) : (
                bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{booking.experiences.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.booking_date).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.participants} {t('common.participants')} - ${booking.total_amount}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getBookingStatusBadge(booking.status)}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                          {t('common.view')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
              {bookings.length > 5 && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/bookings">{t('dashboard.viewAll')}</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
