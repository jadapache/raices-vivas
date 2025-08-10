"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SimpleRoleSelector } from "@/components/ui/simple-role-selector"
import { PasswordStrength } from "@/components/ui/password-strength"
import { validatePassword } from '@/lib/password-validation'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('tourist')
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('User already authenticated, redirecting...')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Auth check error:', error)
      }
    }
    
    checkAuth()
  }, [router])

  const handleSignUp = async (formData: FormData) => {
  setIsLoading(true);
  setNotification(null);

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const full_name = formData.get('full_name') as string;
  const selectedRole = formData.get('role') as 'host' | 'tourist' | 'coordinator';
  const community_name = formData.get('community_name') as string;

  // --- Validación consolidada del lado del cliente ---
  if (!email || !password || !full_name || !selectedRole) {
    setNotification({
      type: 'error',
      message: 'Por favor, completa todos los campos requeridos.'
    });
    toast({
      title: 'error',
      description: 'Por favor, completa todos los campos requeridos.'
    });
    setIsLoading(false);
    return;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    setNotification({
      type: 'error',
      message: 'La contraseña no cumple con los requisitos de seguridad.'
    });
    toast({
      title: 'error',
      description: 'La contraseña no cumple con los requisitos de seguridad.'
    });
    setIsLoading(false);
    return;
  }

  if (selectedRole === 'host' && !community_name?.trim()) {
    setNotification({
      type: 'error',
      message: 'Los anfitriones deben proporcionar el nombre de su comunidad.'
    });
    toast({
      title: 'error',
      description: 'Los anfitriones deben proporcionar el nombre de su comunidad.'
    });
    setIsLoading(false);
    return;
  }
  // --- Fin de la validación ---

  try {
    const supabase = createClient();

    // --- Mejora en la construcción del objeto de metadatos ---
    // Se asegura de que `community_name` siempre se envíe, usando `null` si no aplica.
    const userData = {
      full_name: full_name.trim(),
      role: selectedRole,
      community_name: selectedRole === 'host' ? community_name.trim() : null
    };

    console.log('User data being sent:', userData);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: userData }
    });

    // --- El resto de la lógica de manejo de errores y éxito es la misma ---
    if (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Error al crear la cuenta.';
      if (error.message.includes('already registered')) {
        errorMessage = 'Este email ya está registrado.';
      } else if (error.message.includes('invalid email')) {
        errorMessage = 'Email inválido.';
      } else if (error.message.includes('weak password')) {
        errorMessage = 'La contraseña es muy débil.';
      } else if (error.message.includes('Database error')) {
        errorMessage = 'Error de base de datos. Por favor, intenta de nuevo.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setNotification({ type: 'error', message: errorMessage });
      toast({ title: 'error', description: errorMessage });
      return;
    }

    if (data.user) {
      if (!data.session) {
        setNotification({
          type: 'info',
          message: '¡Cuenta creada! Por favor, verifica tu email para activarla.'
        });
        toast({
          title: '¡Cuenta creada!',
          description: 'Revisa tu email para verificar tu cuenta.'
        });
      } else {
        setNotification({
          type: 'success',
          message: '¡Cuenta creada exitosamente! Redirigiendo...'
        });
        toast({
          title: '¡Éxito!',
          description: 'Cuenta creada correctamente.'
        });
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1500);
      }
    }
  } catch (unexpectedError: any) {
    console.error('Unexpected signup error:', unexpectedError);
    const errorMessage = 'Error inesperado al crear la cuenta. Por favor, intenta de nuevo.';
    setNotification({ type: 'error', message: errorMessage });
    toast({ title: 'error', description: errorMessage });
  } finally {
    setIsLoading(false);
  }
};

  const handleSignIn = async (formData: FormData) => {
  setIsLoading(true);
  setNotification(null);

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // --- Validación del lado del cliente ---
  if (!email || !password) {
    const errorMessage = 'Por favor ingresa tu email y contraseña.';
    setNotification({ type: 'error', message: errorMessage });
    toast({
      title: 'Error',
      description: errorMessage
    });
    setIsLoading(false);
    return;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    // --- Manejo de errores de Supabase ---
    if (error) {
      console.error('Signin error:', error);
      let errorMessage = 'Error al iniciar sesión.';

      // Mapea los errores comunes de Supabase a mensajes amigables
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email o contraseña incorrectos.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Por favor verifica tu email antes de iniciar sesión.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Demasiados intentos. Espera un momento antes de intentar de nuevo.';
      } else {
        // Mensaje genérico para otros errores inesperados
        errorMessage = `Error: ${error.message}`;
      }

      setNotification({ type: 'error', message: errorMessage });
      toast({
        title: 'error',
        description: errorMessage,
      });
      return;
    }

    // --- Manejo de éxito ---
    if (data.user) {
      const successMessage = '¡Bienvenido! Redirigiendo al panel de control...';
      setNotification({ type: 'success', message: successMessage });
      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente.'
      });

      // Redirección con un pequeño retraso
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    }
  } catch (unexpectedError: any) {
    // --- Manejo de errores inesperados (p. ej. error de red) ---
    console.error('Unexpected signin error:', unexpectedError);
    const errorMessage = 'Error inesperado al iniciar sesión. Por favor intenta de nuevo.';
    setNotification({ type: 'error', message: errorMessage });
    toast({
      title: 'error',
      description: errorMessage
    });
  } finally {
    // Siempre desactiva el estado de carga
    setIsLoading(false);
  }
};

  const NotificationAlert = ({ notification }: { notification: { type: 'success' | 'error' | 'info', message: string } }) => {
    const Icon = notification.type === 'success' ? CheckCircle : 
                 notification.type === 'error' ? XCircle : AlertCircle
    
    return (
      <Alert className={`mb-4 ${
        notification.type === 'success' ? 'border-green-200 bg-green-50' :
        notification.type === 'error' ? 'border-red-200 bg-red-50' :
        'border-blue-200 bg-blue-50'
      }`}>
        <Icon className={`h-4 w-4 ${
          notification.type === 'success' ? 'text-green-600' :
          notification.type === 'error' ? 'text-red-600' :
          'text-blue-600'
        }`} />
        <AlertDescription className={
          notification.type === 'success' ? 'text-green-800' :
          notification.type === 'error' ? 'text-red-800' :
          'text-blue-800'
        }>
          {notification.message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bienvenido a Raíces Vivas</CardTitle>
          <CardDescription>Inicia sesión en tu cuenta o crea una nueva</CardDescription>
        </CardHeader>
        <CardContent>
          {notification && <NotificationAlert notification={notification} />}
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" disabled={isLoading}>Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup" disabled={isLoading}>Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form action={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="Ingresa tu email"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Contraseña</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <SignUpForm 
                onSubmit={handleSignUp} 
                isLoading={isLoading}
                password={password}
                setPassword={setPassword}
                role={role}
                setRole={setRole}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function SignUpForm({ 
  onSubmit, 
  isLoading, 
  password, 
  setPassword, 
  role, 
  setRole 
}: { 
  onSubmit: (formData: FormData) => void
  isLoading: boolean
  password: string
  setPassword: (password: string) => void
  role: string
  setRole: (role: string) => void
}) {
  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nombre Completo *</Label>
        <Input
          id="full_name"
          name="full_name"
          placeholder="Ingresa tu nombre completo"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Ingresa tu email"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña *</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Crea una contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <PasswordStrength password={password} />
      </div>
      
      <SimpleRoleSelector
        value={role}
        onValueChange={setRole}
        name="role"
      />
      
      {role === 'host' && (
        <div className="space-y-2">
          <Label htmlFor="community_name">Nombre de la Comunidad *</Label>
          <Input
            id="community_name"
            name="community_name"
            placeholder="Ingresa el nombre de tu comunidad"
            required
            disabled={isLoading}
          />
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
      </Button>
    </form>
  )
}
