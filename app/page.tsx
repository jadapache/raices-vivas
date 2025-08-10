"use client"

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudOffIcon, MapPin, Users, MessageSquareMoreIcon, Star } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import Image from 'next/image'

export default function HomePage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6">
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-gray-100">
                <Link href="/experiences">{t('home.exploreExperiences')}</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/auth">{t('home.joinUs')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.valueProposition')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.valueSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CloudOffIcon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>{t('home.accessible')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('home.accessibleDesc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>{t('home.selfControl')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('home.selfControlDesc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquareMoreIcon className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>{t('home.trust')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
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
              {t('home.featuredExperiences')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              {t('home.featuredSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={`/vibrant-cultural-celebration.png?height=200&width=400&query=cultural experience ${i}`}
                    alt={`Experience ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Pasadía Cascada Silvania</CardTitle>
                  <CardDescription>No toda la riqueza del Putumayo es de color negro.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.9</span>
                      <span className="text-sm text-gray-500">(24 reseñas)</span>
                    </div>
                    <div className="text-lg font-bold">$45.000</div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    Orito, Putumayo
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Button size="lg" asChild>
              <Link href="/experiences">{t('home.exploreExperiences')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            {t('home.readyTitle')}
          </h2>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            {t('home.readySubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/experiences">{t('home.exploreExperiences')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/auth">{t('home.joinNow')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
