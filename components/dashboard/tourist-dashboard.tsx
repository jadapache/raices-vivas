"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, DollarSign, Search, Clock, PersonStanding, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context'
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-provider';

// Interfaz para la reserva
interface Booking {
  id: string;
  booking_date: string;
  participants: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  contact_email: string;
  special_requests: string;
  created_at: string;
  experiences: {
    id: string;
    title: string;
    location: string;
    duration_hours: number;
    images: string[];
    profiles: {
      full_name: string;
      community_name: string;
    };
  };
}

export default function TouristDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalSpent: 0
  });
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    // Si la autenticación ha terminado y no hay usuario, redirigir
    if (!authLoading && !user) {
      router.push('/login');
    }
    
    // Si la autenticación ha terminado y el usuario está disponible, cargar los datos
    if (user && !authLoading) {
      fetchData(user.id);
    }
  }, [user, authLoading, router]);

  // Función combinada para obtener el perfil y las reservas del usuario
  const fetchData = async (userId: string) => {
    setLoading(true);
    const supabase = createClient();

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else {
      // Nota: El hook useAuth ya proporciona el perfil, esta llamada podría ser redundante
      // dependiendo de la implementación de useAuth. Para este ejemplo, la mantenemos para
      // asegurar que el estado local se actualiza.
      // setProfile(profileData); 
    }

    const { data: bookingsData, error: bookingsError } = await supabase
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
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      setBookings([]);
    } else if (bookingsData) {
      setBookings(bookingsData as Booking[]);
      setStats({
        totalBookings: bookingsData.length,
        confirmedBookings: bookingsData.filter(booking => booking.status === 'confirmed').length,
        pendingBookings: bookingsData.filter(booking => booking.status === 'pending').length,
        totalSpent: bookingsData
          .filter(booking => booking.status === 'confirmed')
          .reduce((sum, booking) => sum + booking.total_amount, 0)
      });
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700">{t('dashboard_tourist.status.confirmed')}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">{t('dashboard_tourist.status.pending')}</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">{t('dashboard_tourist.status.cancelled')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 font-sans">
        <div className="animate-pulse space-y-6 w-full max-w-7xl">
          <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto md:mx-0"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="h-96 bg-gray-200 rounded-xl lg:col-span-2"></div>
            <div className="h-96 bg-gray-200 rounded-xl hidden lg:block"></div>
          </div>
        </div>
      </div>
    );
  }

  // Redirigir si no hay usuario después de la carga
  if (!user || !profile) {
    return null; 
  }

  return (
    <div className="flex min-h-screen items-start justify-center p-4 md:p-8 bg-gray-50 font-sans">
      <div className="w-full max-w-7xl space-y-8">
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('dashboard.welcome')}, {profile?.full_name} 👋
          </h1>
          <p className="text-gray-600">
            {t('profile.tourist')}{profile?.community_name}: {t('dashboard.touriSubtitle')}
          </p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-xl shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalBookings')}</CardTitle>
              <Calendar className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.confirmedBookings')}</CardTitle>
              <CheckCircle className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.confirmedBookings}</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.pending')}</CardTitle>
              <Clock className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingBookings}</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalSpent')}</CardTitle>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.totalSpent}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Contenido principal: Reservas y Acciones */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mis Reservas */}
          <div className="lg:col-span-2">
            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('dashboard.my_bookings_title')}</CardTitle>
                    <CardDescription>{t('dashboard.my_bookings_subtitle')}</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/bookings">{t('dashboard.my_bookings_viewall')}</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">{t('dashboard.my_bookings_empty')}</p>
                      <Button asChild>
                        <Link href="/experiences">
                          <Search className="h-4 w-4 mr-2" />
                          {t('dashboard.my_bookings_explore')}
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="border rounded-xl p-4 flex flex-col sm:flex-row items-start gap-4 transition-all duration-300 hover:shadow-lg">
                        <div className="relative w-full sm:w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={booking.experiences?.images?.[0] || `https://placehold.co/112x112/e2e8f0/000000?text=${booking.experiences.title.substring(0, 1)}`}
                            alt={booking.experiences.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold">{booking.experiences.title}</h4>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {booking.experiences.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(booking.booking_date).toLocaleDateString('es-ES')}
                              </span>
                              <span className="flex items-center gap-1">
                                <PersonStanding className="h-4 w-4" />
                                {t('common.by')}: {booking.experiences.profiles?.community_name || booking.experiences.profiles?.full_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm mt-2 text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {booking.participants} {t('common.participants')}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {t('common.total')}: ${booking.total_amount}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-end mt-4">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/bookings/${booking.id}`}>{t('common.details')}</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex flex-col gap-6">
            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <CardTitle>{t('dashboard.quick_actions_title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <Link href="/experiences">
                    <Search className="h-4 w-4 mr-2" />
                    {t('dashboard.quick_actions_explore')}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/bookings">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('dashboard.quick_actions_manage_bookings')}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/profile">
                    <Users className="h-4 w-4 mr-2" />
                    {t('dashboard.quick_actions_view_profile')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <CardTitle>{t('dashboard.tour_recent_actions')}</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="text-sm flex items-center justify-between">
                        <div>
                          <p className="font-medium">{booking.experiences.title}</p>
                          <p className="text-gray-500">
                            {t('dashboard.tour_recent_booked', { date: new Date(booking.created_at).toLocaleDateString('es-ES') })}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">{t('dashboard.tour_recent_no_actions')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
