"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Eye, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'
import NoSSR from '@/components/ui/no-ssr'

interface Experience {
  id: string
  title: string
  description: string
  location: string
  price_per_person: number
  max_participants: number
  duration_hours: number
  status: 'pending' | 'approved' | 'rejected'
  coordinator_notes: string
  created_at: string
  images: string[]
}

export default function HostExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const loadUserAndExperiences = async () => {
      const userData = await getCurrentUser()
      if (!userData) {
        router.push('/auth')
        return
      }
      
      if (userData.profile?.role !== 'host') {
        router.push('/dashboard')
        return
      }
      
      setUser(userData.user)
      await fetchExperiences(userData.user.id)
    }
    
    loadUserAndExperiences()
  }, [router])

  useEffect(() => {
    filterExperiences()
  }, [experiences, searchTerm, statusFilter])

  const fetchExperiences = async (userId: string) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('host_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching experiences:', error)
    } else {
      setExperiences(data || [])
    }
    setLoading(false)
  }

  const filterExperiences = () => {
    let filtered = [...experiences]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(exp => exp.status === statusFilter)
    }

    setFilteredExperiences(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Experiencias</h1>
            <p className="text-gray-600">Gestiona todas tus experiencias publicadas</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/experiences/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Experiencia
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar experiencias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="approved">Aprobadas</SelectItem>
            <SelectItem value="rejected">Rechazadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {filteredExperiences.length} experiencia{filteredExperiences.length !== 1 ? 's' : ''} encontrada{filteredExperiences.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Experiences List */}
      {filteredExperiences.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {experiences.length === 0 ? 'No tienes experiencias aún' : 'No se encontraron experiencias'}
            </h3>
            <p className="text-gray-600 mb-6">
              {experiences.length === 0 
                ? '¡Crea tu primera experiencia y compártela con visitantes!'
                : 'Intenta cambiar los filtros de búsqueda'
              }
            </p>
            {experiences.length === 0 && (
              <Button asChild>
                <Link href="/dashboard/experiences/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Experiencia
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredExperiences.map((experience) => (
            <Card key={experience.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Experience Image */}
                  <div className="lg:w-48 h-32 relative rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={experience.images?.[0] || `/placeholder.svg?height=128&width=192&query=${experience.title}`}
                      alt={experience.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Experience Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {experience.title}
                        </h3>
                        <p className="text-gray-600 mb-2">{experience.location}</p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {experience.description}
                        </p>
                      </div>
                      {getStatusBadge(experience.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Precio</p>
                        <p>${experience.price_per_person}/persona</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Duración</p>
                        <p>{experience.duration_hours}h</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Participantes</p>
                        <p>Máx. {experience.max_participants}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Creada</p>
                        <NoSSR>
                          <p>{new Date(experience.created_at).toLocaleDateString('es-ES')}</p>
                        </NoSSR>
                      </div>
                    </div>

                    {experience.status === 'rejected' && experience.coordinator_notes && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-800 mb-1">Notas del coordinador:</p>
                        <p className="text-sm text-red-700">{experience.coordinator_notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Estado: {experience.status === 'pending' ? 'En revisión' : 
                                experience.status === 'approved' ? 'Publicada' : 'Rechazada'}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/experiences/${experience.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Link>
                        </Button>
                        {experience.status !== 'approved' && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/experiences/${experience.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </Button>
                        )}
                        {experience.status === 'approved' && (
                          <Button size="sm" asChild>
                            <Link href={`/experiences/${experience.id}`}>
                              Ver Público
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
