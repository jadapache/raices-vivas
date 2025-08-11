"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ExperienceDetail from '@/components/experiences/experience-detail'
import { Loader2 } from 'lucide-react'

interface Experience {
  id: string
  title: string
  description: string
  short_description?: string
  location: string
  duration_hours: number
  max_participants: number
  price_per_person: number
  included_items?: string[]
  requirements?: string
  images?: string[]
  status: string
  created_at: string
  profiles: {
    full_name: string
    community_name?: string
    avatar_url?: string
  }
}

export default function ExperienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [experience, setExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchExperience = async () => {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('experiences')
        .select(`
          *,
          profiles:host_id (
            full_name,
            community_name,
            avatar_url
          )
        `)
        .eq('id', resolvedParams.id)
        .eq('status', 'approved')
        .single()

      if (error) {
        console.error('Error fetching experience:', error)
        router.push('/experiences')
      } else {
        setExperience(data)
      }
      setLoading(false)
    }

    fetchExperience()
  }, [resolvedParams.id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando experiencia...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Experiencia no encontrada</h1>
            <button onClick={() => router.push('/experiences')} className="text-blue-600 hover:underline">
              Volver a experiencias
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <ExperienceDetail experience={experience} />
}   
