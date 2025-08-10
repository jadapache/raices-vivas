"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Usamos useRouter para la redirección

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
  const [user, setUser] = useState<any>(null); // Nuevo estado para el usuario
  const [profile, setProfile] = useState<any>(null); // Nuevo estado para el perfil
  const { toast } = useToast();
  const router = useRouter(); // Inicializa el router

  // Este useEffect es el que soluciona los problemas de sesión
  useEffect(() => {
    const supabase = createClient();
    
    // Escucha los cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Si la sesión es nula, significa que el usuario ha cerrado sesión.
      if (!session) {
        setUser(null);
        setProfile(null);
        // Redirecciona al usuario a la página de inicio de sesión o a la home
        router.push('/login'); 
      } else {
        // Si hay una sesión, establece el usuario y carga las experiencias
        setUser(session.user);
        // Aquí podrías cargar el perfil del usuario si es necesario, por ejemplo:
        fetchProfile(session.user.id);
        fetchExperiences(session.user.id);
      }
    });

    // Limpia el listener cuando el componente se desmonta
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Función para obtener el perfil del usuario
  const fetchProfile = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }
  };

  // Función para obtener las experiencias. Ahora recibe el user_id
  const fetchExperiences = async (userId: string) => {
    setLoading(true);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('experiences')
      .select(`
        *,
        profiles:host_id (
          full_name,
          community_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching experiences:', error);
      setExperiences([]); // Limpia las experiencias en caso de error
    } else if (data) {
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
    if (!user) { // Asegúrate de que el usuario esté autenticado antes de actualizar
      toast({
        title: "Error de autenticación",
        description: "Necesitas iniciar sesión para realizar esta acción.",
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
        title: "Error",
        description: "No se pudo actualizar el estado de la experiencia",
        variant: "destructive"
      });
    } else {
      toast({
        title: "¡Éxito!",
        description: `Experiencia ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`
      });
      // Volvemos a cargar las experiencias, pero ahora usando el user.id
      fetchExperiences(user.id);
      setReviewNotes('');
    }
    setReviewingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Muestra un estado de carga mientras se obtienen los datos
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
    );
  }

  // Muestra un mensaje si no hay usuario o perfil
  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Acceso Denegado</h1>
        <p className="text-lg text-gray-600">
          No tienes permiso para ver este panel o tu sesión ha expirado.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Resto del componente de renderizado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel de Coordinador
        </h1>
        <p className="text-gray-600">
          Bienvenido, {profile.full_name} - Revisa y gestiona experiencias
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Experiencias para Revisar</CardTitle>
          <CardDescription>Revisa y aprueba experiencias enviadas por anfitriones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {experiences.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay experiencias para revisar
              </p>
            ) : (
              experiences
                .sort((a, b) => {
                  if (a.status === 'pending' && b.status !== 'pending') return -1;
                  if (b.status === 'pending' && a.status !== 'pending') return 1;
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                })
                .map((experience) => (
                  <div key={experience.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{experience.title}</h3>
                        <p className="text-gray-600 mb-2">{experience.location}</p>
                        <p className="text-sm text-gray-500 mb-2">
                          Por: {experience.profiles?.community_name || experience.profiles?.full_name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>${experience.price_per_person}/persona</span>
                          <span>{experience.duration_hours}h</span>
                          <span>Máx. {experience.max_participants} personas</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(experience.status)}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-3">{experience.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Creada: {new Date(experience.created_at).toLocaleDateString('es-ES')}
                      </span>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </Button>
                          </DialogTrigger>
                          <ExperienceDetailDialog experience={experience} />
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
                              Aprobar
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={reviewingId === experience.id}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Rechazar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Rechazar Experiencia</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p>¿Estás seguro de que quieres rechazar esta experiencia?</p>
                                  <div>
                                    <label className="text-sm font-medium">Notas de revisión:</label>
                                    <Textarea
                                      placeholder="Explica por qué se rechaza esta experiencia..."
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline">Cancelar</Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleReview(experience.id, 'rejected')}
                                      disabled={reviewingId === experience.id}
                                    >
                                      Confirmar Rechazo
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para mostrar los detalles de la experiencia en un diálogo
function ExperienceDetailDialog({ experience }: { experience: Experience }) {
  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{experience.title}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {experience.images && experience.images.length > 0 && (
          <div className="relative h-64 rounded-lg overflow-hidden">
            <Image
              src={experience.images[0] || "/placeholder.svg"}
              alt={experience.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Ubicación:</span>
            <p>{experience.location}</p>
          </div>
          <div>
            <span className="font-medium">Duración:</span>
            <p>{experience.duration_hours} hora{experience.duration_hours !== 1 ? 's' : ''}</p>
          </div>
          <div>
            <span className="font-medium">Participantes:</span>
            <p>Máximo {experience.max_participants}</p>
          </div>
          <div>
            <span className="font-medium">Precio:</span>
            <p>${experience.price_per_person} por persona</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Descripción</h3>
          <p className="text-gray-600 whitespace-pre-line">{experience.description}</p>
        </div>
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Anfitrión</h3>
          <p className="text-gray-600">
            {experience.profiles?.community_name || experience.profiles?.full_name}
          </p>
        </div>
      </div>
    </DialogContent>
  );
}
