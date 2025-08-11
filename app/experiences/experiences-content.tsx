"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { 
  MapPin, 
  Users, 
  Clock, 
  Search, 
  Filter, 
  Star, 
  Grid3x3, 
  List,
  SlidersHorizontal,
  Heart,
  Share2,
  Calendar,
  DollarSign
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/context'
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

type ViewMode = 'grid' | 'list'

export default function ExperiencesContent() {
  const searchParams = useSearchParams()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [priceRange, setPriceRange] = useState([0, 500])
  const [durationFilter, setDurationFilter] = useState('all')
  const [participantsFilter, setParticipantsFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('todas')
  
  const { t } = useI18n()

  useEffect(() => {
    fetchExperiences()
  }, [])

  useEffect(() => {
    filterAndSortExperiences()
  }, [experiences, searchTerm, sortBy, priceRange, durationFilter, participantsFilter, locationFilter])

  useEffect(() => {
    // Set search params only on client side
    if (typeof window !== 'undefined') {
      const search = searchParams?.get('search') || ''
      setSearchTerm(search)
    }
  }, [searchParams])

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
      // Set initial price range based on data
      if (data && data.length > 0) {
        const prices = data.map(exp => exp.price_per_person)
        const maxPrice = Math.max(...prices)
        setPriceRange([0, Math.ceil(maxPrice * 1.1)])
      }
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
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.profiles?.community_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Price range filter
    filtered = filtered.filter(exp => 
      exp.price_per_person >= priceRange[0] && exp.price_per_person <= priceRange[1]
    )

    // Duration filter
    if (durationFilter !== 'all') {
      switch (durationFilter) {
        case 'short':
          filtered = filtered.filter(exp => exp.duration_hours <= 2)
          break
        case 'medium':
          filtered = filtered.filter(exp => exp.duration_hours > 2 && exp.duration_hours <= 6)
          break
        case 'long':
          filtered = filtered.filter(exp => exp.duration_hours > 6)
          break
      }
    }

    // Participants filter
    if (participantsFilter !== 'all') {
      switch (participantsFilter) {
        case 'small':
          filtered = filtered.filter(exp => exp.max_participants <= 5)
          break
        case 'medium':
          filtered = filtered.filter(exp => exp.max_participants > 5 && exp.max_participants <= 15)
          break
        case 'large':
          filtered = filtered.filter(exp => exp.max_participants > 15)
          break
      }
    }

    // Location filter
    if (locationFilter && locationFilter !== 'todas') {
      filtered = filtered.filter(exp =>
        exp.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
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
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        case 'rating':
          return 0 // Placeholder for when ratings are implemented
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredExperiences(filtered)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setPriceRange([0, 500])
    setDurationFilter('all')
    setParticipantsFilter('all')
    setLocationFilter('todas')
    setSortBy('created_at')
  }

  const getUniqueLocations = () => {
    const locations = experiences.map(exp => exp.location)
    return [...new Set(locations)].sort()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <div className="h-56 bg-gradient-to-r from-slate-200 to-slate-300 rounded-t-xl"></div>
                <CardHeader className="space-y-3">
                  <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded-lg"></div>
                    <div className="h-4 bg-slate-200 rounded-lg w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-30">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-50 text-blue-600 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-semibold">Descubre lo Auténtico</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            {t('experiences.title')}
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {t('experiences.subtitle')}
          </p>
        </div>

        {/* Search and Actions */}
        <div className="mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Enhanced Search */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <Input
                  placeholder={t('experiences.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-lg border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-14 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  {t('experiences.filters')}
                </Button>
                
                <div className="flex bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl overflow-hidden shadow-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none h-14 px-4 border-r border-slate-200"
                    title={t('experiences.viewGrid')}
                  >
                    <Grid3x3 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none h-14 px-4"
                    title={t('experiences.viewList')}
                  >
                    <List className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="max-w-6xl mx-auto mb-12">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1"></div>
                  <CardTitle className="flex-1 text-center text-xl text-slate-900">
                    {t('experiences.advancedFilters')}
                  </CardTitle>
                  <div className="flex-1 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearAllFilters} 
                      className="text-slate-600 hover:text-slate-900 border-slate-300 hover:border-slate-400 px-4 py-2 font-medium"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {t('experiences.clearAll')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <Tabs defaultValue="filters" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="filters" className="rounded-lg font-semibold">{t('experiences.filters')}</TabsTrigger>
                    <TabsTrigger value="sort" className="rounded-lg font-semibold">{t('experiences.sort')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="filters" className="space-y-8 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {/* Price Range */}
                      <div className="space-y-4">
                        <Label className="flex items-center space-x-2 text-base font-semibold text-slate-700">
                          <DollarSign className="h-5 w-5 text-emerald-600" />
                          <span>{t('experiences.priceRange')}</span>
                        </Label>
                        <div className="px-3 py-4 bg-slate-50 rounded-xl">
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={500}
                            min={0}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-slate-600 mt-3 font-medium">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                          </div>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="space-y-4">
                        <Label className="flex items-center space-x-2 text-base font-semibold text-slate-700">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span>{t('experiences.duration')}</span>
                        </Label>
                        <Select value={durationFilter} onValueChange={setDurationFilter}>
                          <SelectTrigger className="h-12 rounded-xl border-0 bg-slate-50">
                            <SelectValue placeholder={t('experiences.duration')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('experiences.duration')}</SelectItem>
                            <SelectItem value="short">Corta (≤2h)</SelectItem>
                            <SelectItem value="medium">Media (2-6h)</SelectItem>
                            <SelectItem value="long">Larga (&gt;6h)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Group Size */}
                      <div className="space-y-4">
                        <Label className="flex items-center space-x-2 text-base font-semibold text-slate-700">
                          <Users className="h-5 w-5 text-purple-600" />
                          <span>{t('experiences.groupSize')}</span>
                        </Label>
                        <Select value={participantsFilter} onValueChange={setParticipantsFilter}>
                          <SelectTrigger className="h-12 rounded-xl border-0 bg-slate-50">
                            <SelectValue placeholder={t('experiences.groupSize')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Cualquier tamaño</SelectItem>
                            <SelectItem value="small">Pequeño (≤5)</SelectItem>
                            <SelectItem value="medium">Mediano (6-15)</SelectItem>
                            <SelectItem value="large">Grande (&gt;15)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Location */}
                      <div className="space-y-4">
                        <Label className="flex items-center space-x-2 text-base font-semibold text-slate-700">
                          <MapPin className="h-5 w-5 text-red-600" />
                          <span>{t('experiences.location')}</span>
                        </Label>
                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                          <SelectTrigger className="h-12 rounded-xl border-0 bg-slate-50">
                            <SelectValue placeholder={t('experiences.location')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todas">Todas las ubicaciones</SelectItem>
                            {getUniqueLocations().map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sort" className="mt-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[
                        { key: 'created_at', icon: Calendar, label: t('experiences.mostRecent') },
                        { key: 'price_low', icon: DollarSign, label: 'Precio: Menor a Mayor' },
                        { key: 'price_high', icon: DollarSign, label: 'Precio: Mayor a Menor' },
                        { key: 'rating', icon: Star, label: t('experiences.bestRated') },
                        { key: 'duration', icon: Clock, label: t('experiences.byDuration') },
                        { key: 'participants', icon: Users, label: 'Más Participantes' },
                        { key: 'alphabetical', icon: Filter, label: t('experiences.alphabetical') }
                      ].map(({ key, icon: Icon, label }) => (
                        <Button
                          key={key}
                          variant={sortBy === key ? 'default' : 'outline'}
                          onClick={() => setSortBy(key)}
                          className="justify-start h-auto p-4 rounded-xl transition-all duration-300 hover:shadow-lg"
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          <span className="text-sm font-medium">{label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <p className="text-lg text-slate-600">
              <span className="font-bold text-2xl text-slate-900">{filteredExperiences.length}</span> 
              {' '}{filteredExperiences.length === 1 ? t('experiences.experienceFound') : t('experiences.experiencesFound')}
            </p>
            {(searchTerm || priceRange[0] > 0 || priceRange[1] < 500 || durationFilter !== 'all' || participantsFilter !== 'all' || (locationFilter && locationFilter !== 'todas')) && (
              <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 border-blue-200">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filtros activos</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Results Grid/List */}
        <div className="max-w-6xl mx-auto">
          {filteredExperiences.length === 0 ? (
            <Card className="text-center py-16 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {t('experiences.noResults')}
                  </h3>
                  <p className="text-lg text-slate-600 mb-8">
                    {t('experiences.noResultsDesc')}
                  </p>
                  <Button onClick={clearAllFilters} variant="outline" className="px-8 py-3 rounded-xl font-semibold">
                    {t('experiences.clearFilters')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
              : "space-y-8"
            }>
              {filteredExperiences.map((experience) => (
                viewMode === 'grid' ? (
                  <ExperienceCard key={experience.id} experience={experience} />
                ) : (
                  <ExperienceListItem key={experience.id} experience={experience} />
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Enhanced Grid Card Component
function ExperienceCard({ experience }: { experience: Experience }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { t } = useI18n()

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:-translate-y-2">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={experience.images?.[0] || `/placeholder.svg?height=256&width=400&query=experience ${experience.title}`}
          alt={experience.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Badge className="bg-white/95 backdrop-blur-sm text-slate-900 font-bold text-lg px-3 py-2 rounded-xl">
            ${experience.price_per_person}
          </Badge>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsFavorite(!isFavorite)
              }}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 hover:scale-110"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
            </button>
            <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 hover:scale-110">
              <Share2 className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
        
        {/* Rating badge */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-slate-900">4.8</span>
            <span className="text-xs text-slate-600">(24)</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
              {experience.title}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {experience.short_description || experience.description}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-red-500" />
              <span className="truncate font-medium">{experience.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              <span className="font-medium">{experience.duration_hours}h</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              <span className="font-medium">Máx. {experience.max_participants}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
              <span className="font-medium">Disponible</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-4">
              {t('experiences.by')} <span className="font-semibold text-slate-700">{experience.profiles?.community_name || experience.profiles?.full_name}</span>
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" asChild className="flex-1 rounded-xl font-semibold">
                <Link href={`/experiences/${experience.id}`}>
                  {t('experiences.viewDetails')}
                </Link>
              </Button>
              <Button size="sm" asChild className="flex-1 rounded-xl font-semibold">
                <Link href={`/experiences/${experience.id}/book`}>
                  {t('experiences.book')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced List Item Component
function ExperienceListItem({ experience }: { experience: Experience }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { t } = useI18n()

  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative md:w-80 h-56 md:h-auto flex-shrink-0">
            <Image
              src={experience.images?.[0] || `/placeholder.svg?height=224&width=320&query=experience ${experience.title}`}
              alt={experience.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/95 backdrop-blur-sm text-slate-900 font-bold text-lg px-3 py-2 rounded-xl">
                ${experience.price_per_person}
              </Badge>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold text-slate-900">4.8</span>
                  <span className="text-sm text-slate-500">(24 reseñas)</span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-3">
                  {experience.title}
                </h3>
                <p className="text-lg text-slate-600 mb-6 line-clamp-2 leading-relaxed">
                  {experience.short_description || experience.description}
                </p>
              </div>
              
              <div className="flex space-x-3 ml-6">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300"
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                </button>
                <button className="p-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300">
                  <Share2 className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-red-500" />
                <span className="font-medium text-slate-700">{experience.location}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-blue-500" />
                <span className="font-medium text-slate-700">{experience.duration_hours} horas</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-3 text-purple-500" />
                <span className="font-medium text-slate-700">Máx. {experience.max_participants}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-emerald-500" />
                <span className="font-medium text-slate-700">Disponible</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {t('experiences.by')} <span className="font-semibold text-slate-700">{experience.profiles?.community_name || experience.profiles?.full_name}</span>
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" asChild className="px-6 py-3 rounded-xl font-semibold">
                  <Link href={`/experiences/${experience.id}`}>
                    {t('experiences.viewDetails')}
                  </Link>
                </Button>
                <Button asChild className="px-6 py-3 rounded-xl font-semibold">
                  <Link href={`/experiences/${experience.id}/book`}>
                    {t('experiences.bookNow')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}