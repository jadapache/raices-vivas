// src/components/profile/EditProfileForm.tsx

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditProfileFormProps {
  user: any;
  profile: any;
  onSaveSuccess: (updatedProfile: any) => void;
  onCancel: () => void;
}

export default function EditProfileForm({ user, profile, onSaveSuccess, onCancel }: EditProfileFormProps) {
  // Estado local para los datos del formulario de perfil
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    community_name: '',
    avatar_url: ''
  });
  // Estado para el proceso de cambio de correo electrónico
  const [newEmail, setNewEmail] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailUpdateMessage, setEmailUpdateMessage] = useState({
    type: 'success',
    message: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        community_name: profile.community_name || '',
        avatar_url: profile.avatar_url || ''
      });
    }
    if (user) {
      setNewEmail(user.email || '');
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    
    // Actualiza la información de perfil en la tabla `profiles`
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        community_name: formData.community_name,
        avatar_url: formData.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive"
      });
    } else {
      toast({
        title: "¡Éxito!",
        description: "Perfil actualizado correctamente"
      });
      
      // Obtiene el perfil actualizado para refrescar la UI
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (updatedProfile) {
        onSaveSuccess(updatedProfile);
      }
    }
    
    setSaving(false);
  };
  
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailUpdateMessage({ type: 'success', message: '' });

    if (!newEmail || newEmail.trim() === '') {
      setEmailUpdateMessage({
        type: 'error',
        message: 'El nuevo correo no puede estar vacío.'
      });
      setEmailLoading(false);
      return;
    }
    
    if (newEmail === user.email) {
      setEmailUpdateMessage({
        type: 'error',
        message: 'La nueva dirección de correo es la misma que la actual.'
      });
      setEmailLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      toast({
        title: "Error al cambiar el correo",
        description: error.message,
        variant: "destructive"
      });
      setEmailUpdateMessage({
        type: 'error',
        message: 'Error al cambiar el correo: ' + error.message
      });
    } else {
      toast({
        title: "¡Verifica tu correo!",
        description: "Se ha enviado un correo de confirmación a tu nueva dirección. Haz clic en el enlace para completar el cambio.",
      });
      setEmailUpdateMessage({
        type: 'success',
        message: 'Se ha enviado un correo de confirmación a ' + newEmail + '. Revisa tu bandeja de entrada para completar el cambio.'
      });
      // Oculta el formulario después de un mensaje de éxito, pero mantiene el mensaje visible
      setIsChangingEmail(false); 
    }
    setEmailLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Sección de cambio de correo electrónico */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h4 className="font-medium mb-2">Correo Electrónico</h4>
          <form onSubmit={handleEmailChange} className="flex space-x-2">
            <div className="flex-grow">
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nueva.direccion@ejemplo.com"
                disabled={!isChangingEmail}
                className={isChangingEmail ? "bg-white" : "bg-gray-100 text-gray-500"}
              />
            </div>
            
            {!isChangingEmail ? (
              <Button type="button" onClick={() => setIsChangingEmail(true)} variant="outline">
                Cambiar
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsChangingEmail(false);
                  setEmailUpdateMessage({ type: 'success', message: '' });
                  setNewEmail(user?.email || '');
                }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={emailLoading || newEmail === user?.email}>
                  {emailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                </Button>
              </div>
            )}
          </form>
          {emailUpdateMessage.message && (
            <div className={`flex items-center text-sm mt-2 ${
              emailUpdateMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {emailUpdateMessage.type === 'success' ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              <span>{emailUpdateMessage.message}</span>
            </div>
          )}
        </div>

        {/* Sección de información personal */}
        <form onSubmit={handleSave} className="space-y-4">
          <h4 className="font-medium">Información Personal</h4>
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Tu número de teléfono"
            />
          </div>

          {profile?.role === 'host' && (
            <div className="space-y-2">
              <Label htmlFor="community_name">Nombre de la Comunidad</Label>
              <Input
                id="community_name"
                value={formData.community_name}
                onChange={(e) => setFormData(prev => ({ ...prev, community_name: e.target.value }))}
                placeholder="Nombre de tu comunidad"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="avatar_url">URL del Avatar</Label>
            <Input
              id="avatar_url"
              type="url"
              value={formData.avatar_url}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
              placeholder="https://ejemplo.com/tu-avatar.jpg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}