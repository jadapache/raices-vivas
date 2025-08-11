"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Calendar, Users, DollarSign, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider';

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
  const { user, profile, loading: authLoading } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalExperiences: 0,
    approvedExperiences: 0,
    pendingBookings: 0,
    totalRevenue: 0
  })
  const { t } = useI18n()
  const router = useRouter()

  useEffect(() => {
    // Si no estamos cargando la autenticación y no hay usuario, redirigir
    if (!authLoading && !user) {
      router.push('/login');
    }
    
    // Si la autenticación ha terminado y el usuario está disponible, cargar los datos
    if (user && !authLoading) {
      fetchData(user.id);
    }
  }, [user, authLoading, router]);

  // Función para obtener los datos. Ahora toma el userId como argumento.
  const fetchData = async (userId: string) => {
    setLoading(true)
    const supabase = createClient()
    
    // Fetch experiences
    const { data: experiencesData, error: experiencesError } = await supabase
      .from('experiences')
      .select('*')
      .eq('host_id', userId)
      .order('created_at', { ascending: false })

    // Fetch bookings for host's experiences
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        experiences!inner(title, host_id)
      `)
      .eq('experiences.host_id', userId)
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
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">{t('dashboard.approved')}</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">{t('dashboard.pending')}</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">{t('dashboard.rejected')}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">{t('booking.confirmed')}</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">{t('booking.pending')}</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">{t('booking.cancelled')}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('dashboard.welcome')}, {profile?.full_name || 'Usuario'} 👋
        </h1>
        <p className="text-gray-600">
          {t('profile.host')}{profile?.community_name ? ` - ${t('common.community')}: ${profile.community_name}` : ''}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalExperiences')}</CardTitle>
            <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExperiences}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.approved')}</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedExperiences}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.pending')}</CardTitle>
            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Experiences */}
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>{t('dashboard.myExperiences')}</CardTitle>
                <CardDescription>{t('dashboard.manageExperiences')}</CardDescription>
              </div>
              <Button asChild>
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
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{t('dashboard.noExperiences')}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mb-4">{t('dashboard.noExperiencesDesc')}</p>
                  <Button asChild variant="outline">
                    <Link href="/dashboard/experiences/new">
                      {t('dashboard.createFirst')}
                    </Link>
                  </Button>
                </div>
              ) : (
                experiences.slice(0, 5).map((experience) => (
                  <div key={experience.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate text-gray-900 dark:text-white">{experience.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{experience.location}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ${experience.price_per_person}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getStatusBadge(experience.status)}
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/experiences/${experience.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/experiences/${experience.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
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
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>{t('dashboard.recentBookings')}</CardTitle>
            <CardDescription>{t('dashboard.manageBookings')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  {t('dashboard.noBookings')}
                </p>
              ) : (
                bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate text-gray-900 dark:text-white">{booking.experiences.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(booking.booking_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.participants} {t('common.participants')} - ${booking.total_amount}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getBookingStatusBadge(booking.status)}
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                          <Eye className="h-4 w-4" />
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
