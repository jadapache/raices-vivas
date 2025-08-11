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
import { CheckCircle, XCircle, AlertCircle, Loader2, Eye, EyeOff, ClipboardCopy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/context'

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('tourist')
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [locale, setLocale] = useState('es');
  const router = useRouter()
  const { toast } = useToast()
  
  const { t } = useI18n()

  
  const demoUsers = [
    { roleKey: 'auth.hostRole', email: 'anfitrion@instmail.uk', password: 'R41c35@.' },
    { roleKey: 'auth.coordinatorRole', email: 'coordinador@instmail.uk', password: 'R41c35@.' },
    { roleKey: 'auth.touristRole', email: 'turista@instmail.uk', password: 'R41c35@.' },
  ];

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: t('auth.copiedToastTitle'),
        description: t('auth.copiedToastDescription'),
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: t('auth.copyErrorToastTitle'),
        description: t('auth.copyErrorToastDescription'),
        variant: 'destructive',
      });
    });
  };
  
  const loadCredentials = (email: string, password_val: string) => {
    setSignInEmail(email);
    setSignInPassword(password_val);
    toast({
      title: t('auth.loadedCredentialsToastTitle'),
      description: t('auth.loadedCredentialsToastDescription'),
    });
  };

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

    if (!email || !password || !full_name || !selectedRole) {
      setNotification({
        type: 'error',
        message: t('auth.allFieldsRequiredError')
      });
      toast({
        title: 'Error',
        description: t('auth.allFieldsRequiredError')
      });
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setNotification({
        type: 'error',
        message: t('auth.passwordValidationError')
      });
      toast({
        title: 'Error',
        description: t('auth.passwordValidationError')
      });
      setIsLoading(false);
      return;
    }

    if (selectedRole === 'host' && !community_name?.trim()) {
      setNotification({
        type: 'error',
        message: t('auth.hostCommunityNameRequiredError')
      });
      toast({
        title: 'Error',
        description: t('auth.hostCommunityNameRequiredError')
      });
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

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

      if (error) {
        console.error('Signup error:', error);
        let errorMessage = t('auth.accountCreationError');
        if (error.message.includes('already registered')) {
          errorMessage = t('auth.emailAlreadyRegisteredError');
        } else if (error.message.includes('invalid email')) {
          errorMessage = t('auth.invalidEmailError');
        } else if (error.message.includes('weak password')) {
          errorMessage = t('auth.weakPasswordError');
        } else if (error.message.includes('Database error')) {
          errorMessage = t('auth.databaseError');
        } else {
          errorMessage = `Error: ${error.message}`;
        }
        
        setNotification({ type: 'error', message: errorMessage });
        toast({ title: 'Error', description: errorMessage });
        return;
      }

      if (data.user) {
        if (!data.session) {
          setNotification({
            type: 'info',
            message: t('auth.accountCreatedInfo')
          });
          toast({
            title: 'Información',
            description: t('auth.accountCreatedInfo')
          });
        } else {
          setNotification({
            type: 'success',
            message: t('auth.accountCreatedSuccess')
          });
          toast({
            title: '¡Éxito!',
            description: t('auth.accountCreatedSuccess')
          });
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1500);
        }
      }
    } catch (unexpectedError: any) {
      console.error('Unexpected signup error:', unexpectedError);
      const errorMessage = t('auth.unexpectedSignupError');
      setNotification({ type: 'error', message: errorMessage });
      toast({ title: 'Error', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true);
    setNotification(null);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      const errorMessage = t('auth.allFieldsRequiredError');
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

      if (error) {
        console.error('Signin error:', error);
        let errorMessage = t('auth.signInError');

        if (error.message.includes('Invalid login credentials')) {
          errorMessage = t('auth.invalidCredentialsError');
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = t('auth.emailNotConfirmedError');
        } else if (error.message.includes('Too many requests')) {
          errorMessage = t('auth.tooManyRequestsError');
        } else {
          errorMessage = `Error: ${error.message}`;
        }

        setNotification({ type: 'error', message: errorMessage });
        toast({
          title: 'Error',
          description: errorMessage,
        });
        return;
      }

      if (data.user) {
        const successMessage = t('auth.welcomeSuccess');
        setNotification({ type: 'success', message: successMessage });
        toast({
          title: '¡Bienvenido!',
          description: t('auth.welcomeSuccess')
        });

        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1500);
      }
    } catch (unexpectedError: any) {
      console.error('Unexpected signin error:', unexpectedError);
      const errorMessage = t('auth.unexpectedSignInError');
      setNotification({ type: 'error', message: errorMessage });
      toast({
        title: 'Error',
        description: errorMessage
      });
    } finally {
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
    <div className="flex flex-col sm:flex-row items-center justify-center min-h-screen bg-gray-50 p-4 gap-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center justify-center">
            <CardTitle>{t('auth.welcomeTitle')}</CardTitle>
          </div>
          <div className="flex justify-between items-center justify-center">
          <CardDescription>{t('auth.welcomeDescription')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {notification && <NotificationAlert notification={notification} />}
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" disabled={isLoading}>{t('auth.signInTab')}</TabsTrigger>
              <TabsTrigger value="signup" disabled={isLoading}>{t('auth.signUpTab')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form action={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t('auth.emailLabel')}</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder={t('auth.emailLabel')}
                    required
                    disabled={isLoading}
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">{t('auth.passwordLabel')}</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.passwordLabel')}
                      required
                      disabled={isLoading}
                      className="pr-10"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? t('auth.signInLoading') : t('auth.signInButton')}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => setShowDemoCredentials(!showDemoCredentials)}>
                  {showDemoCredentials ? t('auth.hideDemoCredentialsButton') : t('auth.showDemoCredentialsButton')}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <SignUpForm 
                onSubmit={handleSignUp} 
                isLoading={isLoading}
                password={password}
                setPassword={setPassword}
                role={role}
                setRole={setRole}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                t={t}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {showDemoCredentials && (
        <Card 
          className="w-full max-w-sm sm:max-w-md"
        >
          <CardHeader>
            <CardTitle className="text-base">{t('auth.demoCredentialsTitle')}</CardTitle>
            <CardDescription className="text-sm">{t('auth.demoCredentialsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {demoUsers.map((user, index) => (
                <li key={index} className="flex flex-col items-start p-2 bg-gray-50 rounded-md shadow-sm">
                  <div className="flex-1 w-full">
                    <span className="font-medium mr-2">{t(user.roleKey)}:</span>
                    <div className="flex justify-between items-center w-full">
                      <span className="block text-xs truncate">{user.email}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="px-2 py-1 text-gray-500 hover:text-gray-700"
                        onClick={() => handleCopy(user.email)}
                      >
                        <ClipboardCopy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center w-full mt-1">
                      <span className="block text-xs">{t('auth.passwordLabel')}: {user.password}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="px-2 py-1 text-gray-500 hover:text-gray-700"
                        onClick={() => handleCopy(user.password)}
                      >
                        <ClipboardCopy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => loadCredentials(user.email, user.password)}
                  >
                    {t('auth.loadCredentialsButton')}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SignUpForm({ 
  onSubmit, 
  isLoading, 
  password, 
  setPassword, 
  role, 
  setRole,
  showPassword,
  setShowPassword,
  t
}: { 
  onSubmit: (formData: FormData) => void
  isLoading: boolean
  password: string
  setPassword: (password: string) => void
  role: string
  setRole: (role: string) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  t: (key: string) => string
}) {
  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">{t('auth.fullNameLabel')}</Label>
        <Input
          id="full_name"
          name="full_name"
          placeholder={t('auth.fullNameLabel')}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t('auth.emailLabel')}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t('auth.emailLabel')}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.passwordLabel')}</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.passwordLabel')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <PasswordStrength password={password} />
      </div>
      
      <SimpleRoleSelector
        value={role}
        onValueChange={setRole}
        name="role"
      />
      
      {role === 'host' && (
        <div className="space-y-2">
          <Label htmlFor="community_name">{t('auth.communityNameLabel')}</Label>
          <Input
            id="community_name"
            name="community_name"
            placeholder={t('auth.communityNameLabel')}
            required
            disabled={isLoading}
          />
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? t('auth.signUpLoading') : t('auth.signUpButton')}
      </Button>
    </form>
  )
}
