"use client"

import { useAuth } from '@/components/auth/auth-provider';
import { Loader2, AlertTriangle } from 'lucide-react';
import { redirect } from 'next/navigation';
import HostDashboard from '@/components/dashboard/host-dashboard'
import CoordinatorDashboard from '@/components/dashboard/coordinator-dashboard'
import TouristDashboard from '@/components/dashboard/tourist-dashboard'


function UnauthorizedMessage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
      <p className="text-lg text-gray-600">No tienes permisos para ver este panel.</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <span className="ml-4 text-xl text-gray-700">Cargando panel...</span>
      </div>
    );
  }

  // Si no hay usuario, redirigimos a la página de autenticación
  if (!user) {
    redirect('/auth');
    return null;
  }

  // Si no se encuentra el perfil, mostramos un mensaje de error
  if (!profile) {
     return <UnauthorizedMessage />;
  }

  // Usamos el switch/case para renderizar el componente correcto basado en el rol
  switch (profile.role) {
    case 'host':
      return <HostDashboard />;
    case 'coordinator':
      return <CoordinatorDashboard />;
    case 'tourist':
      return <TouristDashboard />;
    default:
      return <UnauthorizedMessage />;
  }
}
