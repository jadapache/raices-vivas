"use client"

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudOffIcon, MapPin, Users, MessageSquareMoreIcon, Star, ArrowRight, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Experience {
  id: string;
  title: string;
  short_description: string;
  price_per_person: number;
  location: string;
  images: string[];
}

  
export default function HomePage() {
  const { t } = useI18n()
  const [experiences, setExperiences] = useState<Experience[]>([])

  useEffect(() => {
      fetchExperiences()
    }, [])

  const fetchExperiences = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
          .from('experiences')
          .select('id, title, short_description, price_per_person, location, images')
          .eq('status', 'approved') 
          .order('created_at', { ascending: false })
          .limit(3); 
    
        if (error) {
          console.error('Error fetching experiences:', error)
        } else {
          setExperiences(data || [])
      }
   }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Turismo Comunitario Auténtico</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              {t('home.heroTitle')}
            </h1>
            
            <p className="text-xl sm:text-2xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-blue-50">
              {t('home.heroSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto">
              <Button size="lg" variant="outline" asChild className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-4 h-auto rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                <Link href="/experiences" className="flex items-center">
                  {t('home.exploreExperiences')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-4 h-auto rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                <Link href="/auth">{t('home.joinUs')}</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-32 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse blur-sm"></div>
        <div className="absolute bottom-32 right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse delay-1000 blur-sm"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-500 blur-sm"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-blue-50 text-blue-600 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold">¿Por qué elegir Raíces Vivas?</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              {t('home.valueProposition')}
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {t('home.valueSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-2">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <CloudOffIcon className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-3">{t('home.accessible')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg text-slate-600 leading-relaxed">
                  {t('home.accessibleDesc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-2">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Users className="h-10 w-10 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-3">{t('home.selfControl')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg text-slate-600 leading-relaxed">
                  {t('home.selfControlDesc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-2">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <MessageSquareMoreIcon className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-3">{t('home.trust')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg text-slate-600 leading-relaxed">
                  {t('home.trustDesc')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Experiences */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.recentAddedExperiences')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              {t('home.recentAddedSubtittle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {experiences?.map((experience) => (
              <Card key={experience.id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={experience.images?.[0] || '/default-placeholder.png'} // Use the first image or a placeholder
                    alt={experience.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{experience.title}</CardTitle>
                  <CardDescription>{experience.short_description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {/* You can add a logic to show real ratings if you have them */}
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">--</span>
                      <span className="text-sm text-gray-500">(0 reseñas)</span>
                    </div>
                    <div className="text-lg font-bold">${experience.price_per_person.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {experience.location}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button size="lg" asChild className="text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold">
              <Link href="/experiences" className="flex items-center">
                {t('home.exploreExperiences')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8">
              {t('home.readyTitle')}
            </h2>
            <p className="text-xl sm:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-blue-50">
              {t('home.readySubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto">
              <Button size="lg" variant="outline" asChild className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-4 h-auto rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                <Link href="/experiences" className="flex items-center">
                  {t('home.exploreExperiences')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-4 h-auto rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                <Link href="/auth">{t('home.joinNow')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
