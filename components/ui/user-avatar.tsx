"use client"

import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar" // Asume que tus componentes están aquí
import { cn } from "@/lib/utils"

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string | null; // avatar_url puede ser opcional
  role: 'host' | 'coordinator' | 'tourist' | 'unknown';
}

/**
 * Componente que muestra el avatar del usuario con una imagen si está disponible,
 * o la inicial del nombre como fallback.
 */
function UserAvatar({
  profile,
  className,
  ...props
}: {
  profile: Profile | null;
  className?: string;
} & React.ComponentProps<typeof Avatar>) {

  // Función auxiliar para obtener la inicial del nombre
  const getInitial = (name: string | null | undefined): string => {
    if (!name || typeof name !== 'string') return '?';
    return name.charAt(0).toUpperCase();
  };

  if (!profile) {
    // Manejar el caso en que el perfil es nulo
    return (
      <Avatar className={cn("bg-gray-200", className)} {...props}>
        <AvatarFallback>
          <span className="text-gray-500">?</span>
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className={className} {...props}>
      {/* Si hay una URL de avatar, renderizamos la imagen. */}
      {profile.avatar_url ? (
        <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User Avatar"} />
      ) : null}

      {/* Siempre renderizamos el fallback. Radix lo oculta si la imagen está visible. */}
      <AvatarFallback>
        {profile.full_name ? (
          <span className="font-medium">
            {getInitial(profile.full_name)}
          </span>
        ) : (
          // Si no hay nombre, se puede mostrar un ícono por defecto.
          <span className="text-gray-500">?</span>
        )}
      </AvatarFallback>
    </Avatar>
  );
}

// Puedes exportar los componentes primitivos junto con el nuevo componente
export { Avatar, AvatarImage, AvatarFallback, UserAvatar }
