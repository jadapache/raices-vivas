"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Eye, CheckCircle, XCircle, Clock, Users, DollarSign, Calendar, MapPin, PersonStanding } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-provider';
import { useI18n } from '@/lib/i18n/context';

// Interfaz para la experiencia
interface Experience {
  id: string;
  title: string;
  description: string;
  location: string;
  price_per_person: number;
  max_participants: number;
  duration_hours: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  images: string[];
  profiles: {
    full_name: string;
    community_name: string;
  };
}

export default function CoordinatorDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  
  const { toast } = useToast();
   const { t } = useI18n();

  // Efecto para obtener las experiencias cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      fetchExperiences();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Función para obtener las experiencias
  const fetchExperiences = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('experiences')
      .select(`
        *,
        profiles!host_id (
          full_name,
          community_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching experiences:', error);
      toast({
        title: "Error al cargar experiencias",
        description: error.message,
        variant: "destructive"
      });
      setExperiences([]);
    } else if (data) {
      // Ahora la conversión de tipo es segura ya que `data` no es un error de ParserError
      setExperiences(data as Experience[]);
      setStats({
        pending: data.filter(exp => exp.status === 'pending').length,
        approved: data.filter(exp => exp.status === 'approved').length,
        rejected: data.filter(exp => exp.status === 'rejected').length,
        total: data.length
      });
    }
    setLoading(false);
  };

  // Función para manejar la aprobación o rechazo de una experiencia
  const handleReview = async (experienceId: string, status: 'approved' | 'rejected') => {
    if (!user) {
      toast({
        title: t("common.auth_error_title"),
        description: t("common.auth_error_description"),
        variant: "destructive"
      });
      return;
    }

    setReviewingId(experienceId);
    const supabase = createClient();

    const { error } = await supabase
      .from('experiences')
      .update({
        status,
        coordinator_notes: reviewNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', experienceId);

    if (error) {
      toast({
        title: t("common.error_title"),
        description: t("dashboard.update_error"),
        variant: "destructive"
      });
    } else {
      toast({
        title: t("common.success_title"),
        description: t(`dashboard.review_${status}_success`),
      });
      fetchExperiences();
      setReviewNotes('');
    }
    setReviewingId(null);
  };

  // Función para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">{t('dashboard.onlyApproved')}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">{t('dashboard.onlyPending')}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">{t('dashboard.onlyRejected')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Muestra un estado de carga mientras se obtienen los datos o la autenticación
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 font-sans">
        <div className="animate-pulse space-y-6 w-full max-w-4xl">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null; // No renderizamos nada si el usuario no está autenticado
  }

  return (
    <div className="flex min-h-screen items-start justify-center p-4 md:p-8 bg-gray-50 font-sans">
      <div className="w-full max-w-7xl space-y-8">
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('dashboard.welcome')}, {profile?.full_name} 👋
          </h1>
          <p className="text-gray-600">
            {t('profile.coordinator')}{profile?.community_name}: {t('dashboard.coordSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="rounded-xl shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.pending')}</CardTitle>
              <Clock className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.approved')}</CardTitle>
              <CheckCircle className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.rejected')}</CardTitle>
              <XCircle className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.total')}</CardTitle>
              <Users className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle>{t('dashboard.experience_list_title')}</CardTitle>
            <CardDescription>{t('dashboard.experience_list_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {experiences.length === 0 ? (
                <p className="text-gray-500 text-center py-8 col-span-full">
                  {t('dashboard.no_experiences')}
                </p>
              ) : (
                experiences
                  .sort((a, b) => {
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (b.status === 'pending' && a.status !== 'pending') return 1;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  })
                  .map((experience) => (
                    <div 
                      key={experience.id} 
                      className="border rounded-xl p-4 flex flex-col sm:flex-row gap-4 transition-all duration-300 hover:shadow-lg bg-white"
                    >
                      <div className="relative w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={experience.images?.[0] || `https://placehold.co/128x128/e2e8f0/000000?text=${experience.title.substring(0, 1)}`}
                          alt={experience.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-semibold">{experience.title}</h3>
                            {getStatusBadge(experience.status)}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {t('common.by')}: {experience.profiles?.full_name} - {t('common.community')}: {experience.profiles?.community_name}
                          </p>
                          <p className="text-gray-700 text-sm line-clamp-2">{experience.description}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${experience.price_per_person}/{t('common.perPerson')}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{experience.duration_hours}h</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t('common.max')} {experience.max_participants}</span>
                          </div>
                          <div className="flex space-x-2 mt-4 sm:mt-0">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  {t('common.view')}
                                </Button>
                              </DialogTrigger>
                              <ExperienceDetailDialog experience={experience} t={t} />
                            </Dialog>
                            {experience.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleReview(experience.id, 'approved')}
                                  disabled={reviewingId === experience.id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {t('common.approve')}
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      disabled={reviewingId === experience.id}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      {t('common.reject')}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>{t('dashboard.reject_dialog.title')}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <p>{t('dashboard.reject_dialog.confirmation_message')}</p>
                                      <div>
                                        <label className="text-sm font-medium">{t('dashboard.reject_dialog.notes_label')}</label>
                                        <Textarea
                                          placeholder={t('dashboard.reject_dialog.notes_placeholder')}
                                          value={reviewNotes}
                                          onChange={(e) => setReviewNotes(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button variant="outline">{t('common.cancel')}</Button>
                                      </DialogClose>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleReview(experience.id, 'rejected')}
                                        disabled={reviewingId === experience.id}
                                      >
                                        {t('dashboard.reject_dialog.confirm_button')}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente para mostrar los detalles de la experiencia en un diálogo
function ExperienceDetailDialog({ experience, t }: { experience: Experience, t: any }) {
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">{experience.title}</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {experience.images && experience.images.length > 0 && (
          <div className="relative h-64 rounded-xl overflow-hidden shadow-md">
            <Image
              src={experience.images[0] || "/placeholder.svg"}
              alt={experience.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <p className="font-medium text-gray-800">{experience.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <p className="font-medium text-gray-800">{experience.duration_hours} {t('common.duration')}</p>
          </div>
          <div className="flex items-center gap-2">
            <PersonStanding className="h-4 w-4 text-gray-500" />
            <p className="font-medium text-gray-800">{t('common.max')}. {experience.max_participants}</p>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <p className="font-medium text-gray-800">${experience.price_per_person}/{t('common.perPerson')}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{t('common.description')}</h3>
          <p className="text-gray-600 whitespace-pre-line leading-relaxed">{experience.description}</p>
        </div>
        <div className="border-t pt-4">
          <h3 className="font-semibold text-lg mb-2">{t('common.host')}</h3>
          <p className="text-gray-600">
            {experience.profiles?.community_name || experience.profiles?.full_name}
          </p>
        </div>
      </div>
    </DialogContent>
  );
}
