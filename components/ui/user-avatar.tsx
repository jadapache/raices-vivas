"use client"

import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar" 
import { cn } from "@/lib/utils"

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string | null; 
  role: 'host' | 'coordinator' | 'tourist' | 'unknown';
}

/**
 * Función que obtiene las iniciales de un nombre completo.
 * Si el nombre es 'Pepito Perez', retorna 'PP'.
 * Si el nombre es 'Pepito Jose Perez Samboni', retorna 'PP' (inicial del primer nombre y del último apellido).
 */
const getInitial = (fullName: string | null | undefined): string => {
  if (!fullName || typeof fullName !== 'string') {
    return 'U';
  }

  const parts = fullName.split(' ');
  let initials = '';

  // Si hay al menos dos palabras, tomamos la inicial de la primera y la última
  if (parts.length >= 2) {
    initials = parts[0].charAt(0) + parts[1].charAt(0);
  } 
  // Si solo hay una palabra, tomamos solo su inicial
  else if (parts.length === 1) {
    initials = parts[0].charAt(0);
  } else {
    // Si la cadena está vacía o es inválida, se usa un valor por defecto
    initials = 'U';
  }

  return initials.toUpperCase();
};


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
        <span className="font-medium">
          {getInitial(profile.full_name)}
        </span>
      </AvatarFallback>
    </Avatar>
  );
}

// Exporta los componentes primitivos junto con el nuevo componente
export { Avatar, AvatarImage, AvatarFallback, UserAvatar }
