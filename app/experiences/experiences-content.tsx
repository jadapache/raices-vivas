"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Users, Clock, Search, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n, interpolate } from '@/lib/i18n/context'
import Image from 'next/image'
import Link from 'next/link'

interface Experience {
  id: string
  title: string
  description: string
  short_description: string
  location: string
  duration_hours: number
  max_participants: number
  price_per_person: number
  included_items: string[]
  requirements: string
  images: string[]
  status: string
  created_at: string
  profiles: {
    full_name: string
    community_name: string
  }
}

export default function ExperiencesContent() {
  const searchParams = useSearchParams()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '')
  const [sortBy, setSortBy] = useState('created_at')
  const [filterByPrice, setFilterByPrice] = useState('all')
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)
  const { t } = useI18n()

  useEffect(() => {
    fetchExperiences()
  }, [])

  useEffect(() => {
    filterAndSortExperiences()
  }, [experiences, searchTerm, sortBy, filterByPrice])

  const fetchExperiences = async () => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('experiences')
      .select(`
        *,
        profiles:host_id (
          full_name,
          community_name
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching experiences:', error)
    } else {
      setExperiences(data || [])
    }
    setLoading(false)
  }

  const filterAndSortExperiences = () => {
    let filtered = [...experiences]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Price filter
    if (filterByPrice !== 'all') {
      switch (filterByPrice) {
        case 'low':
          filtered = filtered.filter(exp => exp.price_per_person < 50)
          break
        case 'medium':
          filtered = filtered.filter(exp => exp.price_per_person >= 50 && exp.price_per_person < 100)
          break
        case 'high':
          filtered = filtered.filter(exp => exp.price_per_person >= 100)
          break
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price_per_person - b.price_per_person
        case 'price_high':
          return b.price_per_person - a.price_per_person
        case 'duration':
          return a.duration_hours - b.duration_hours
        case 'participants':
          return b.max_participants - a.max_participants
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredExperiences(filtered)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('experiences.title')}</h1>
        <p className="text-gray-600">{t('experiences.subtitle')}</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('experiences.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder={t('experiences.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">{t('experiences.mostRecent')}</SelectItem>
            <SelectItem value="price_low">{t('experiences.priceLowHigh')}</SelectItem>
            <SelectItem value="price_high">{t('experiences.priceHighLow')}</SelectItem>
            <SelectItem value="duration">{t('experiences.duration')}</SelectItem>
            <SelectItem value="participants">{t('experiences.participants')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterByPrice} onValueChange={setFilterByPrice}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t('experiences.filterByPrice')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('experiences.allPrices')}</SelectItem>
            <SelectItem value="low">{t('experiences.under50')}</SelectItem>
            <SelectItem value="medium">{t('experiences.between50100')}</SelectItem>
            <SelectItem value="high">{t('experiences.over100')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {filteredExperiences.length} {filteredExperiences.length === 1 ? t('experiences.experience') : t('experiences.experiencePlural')} {filteredExperiences.length === 1 ? t('experiences.found') : t('experiences.foundPlural')}
        </p>
      </div>

      {/* Experiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperiences.map((experience) => (
          <Card key={experience.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <Image
                src={experience.images?.[0] || `/placeholder.svg?height=200&width=400&query=experience ${experience.title}`}
                alt={experience.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90">
                  ${experience.price_per_person}
                </Badge>
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="line-clamp-2">{experience.title}</CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">
                {experience.short_description || experience.description}
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {experience.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {experience.duration_hours} {experience.duration_hours === 1 ? t('experiences.hour') : t('experiences.hours')}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {interpolate(t('experiences.maxParticipants'), { count: experience.max_participants.toString() })}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-sm text-gray-600">
                  {t('experiences.by')} {experience.profiles?.community_name || experience.profiles?.full_name}
                </div>
                <div className="flex space-x-2 w-full sm:w-auto">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedExperience(experience)}
                        className="flex-1 sm:flex-none"
                      >
                        {t('experiences.viewDetails')}
                      </Button>
                    </DialogTrigger>
                    <ExperienceDetailDialog experience={selectedExperience} />
                  </Dialog>
                  
                  <Button size="sm" asChild className="flex-1 sm:flex-none">
                    <Link href={`/experiences/${experience.id}/book`}>
                      {t('experiences.book')}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExperiences.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t('experiences.noResults')}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm('')
              setFilterByPrice('all')
              setSortBy('created_at')
            }}
          >
            {t('experiences.clearFilters')}
          </Button>
        </div>
      )}
    </div>
  )
}

function ExperienceDetailDialog({ experience }: { experience: Experience | null }) {
  const { t } = useI18n()
  
  if (!experience) return null

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{experience.title}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Images */}
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

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            <span>{experience.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <span>{experience.duration_hours} {experience.duration_hours === 1 ? t('experiences.hour') : t('experiences.hours')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-400" />
            <span>{interpolate(t('experiences.maxParticipants'), { count: experience.max_participants.toString() })}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-lg">${experience.price_per_person} {t('common.perPerson')}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold mb-2">{t('experiences.description')}</h3>
          <p className="text-gray-600 whitespace-pre-line">{experience.description}</p>
        </div>

        {/* Included Items */}
        {experience.included_items && experience.included_items.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">{t('experiences.includes')}</h3>
            <ul className="list-disc list-inside space-y-1">
              {experience.included_items.map((item, index) => (
                <li key={index} className="text-gray-600">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {experience.requirements && (
          <div>
            <h3 className="font-semibold mb-2">{t('experiences.requirements')}</h3>
            <p className="text-gray-600">{experience.requirements}</p>
          </div>
        )}

        {/* Host Info */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">{t('experiences.host')}</h3>
          <p className="text-gray-600">
            {experience.profiles?.community_name || experience.profiles?.full_name}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/experiences/${experience.id}/book`}>
              {t('experiences.bookThisExperience')}
            </Link>
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}
