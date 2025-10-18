"use client"

export const dynamic = 'force-dynamic'

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense, useCallback } from "react"
import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"
import { TimelineActivity } from "@/components/TimelineActivity"
import { ItineraryMap } from "@/components/ItineraryMap"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ArrowLeft, RefreshCw, Map, DollarSign, Clock, MapPin, Tag, Share2, Lock, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { Switch } from "@/components/ui/switch"

// TypeScript interfaces for the itinerary data
interface Coordinates {
  lat: number
  lng: number
}

interface Activity {
  id: number
  time: string
  title: string
  description: string
  location: string
  price: string
  discount?: string
  source_link?: string
  coordinates: Coordinates
}

interface ItinerarySummary {
  intro: string
  description: string
  budget: string
  duration: string
  area: string
  perks: string
}

interface Itinerary {
  title: string
  summary: ItinerarySummary
  activities: Activity[]
}

interface ResultsContentProps {
  itinerary: Itinerary
  itineraryId?: string
  isOwner?: boolean
  isPublic?: boolean
  onTogglePublic?: (nextPublic: boolean) => Promise<void>
}

function ResultsContent({ itinerary, itineraryId, isOwner = false, isPublic = false, onTogglePublic }: ResultsContentProps) {
  const router = useRouter()
  const [mapOpen, setMapOpen] = useState(false)
  const [publicState, setPublicState] = useState(isPublic)

  // Sync publicState with prop changes
  useEffect(() => {
    setPublicState(isPublic)
  }, [isPublic])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1">
        <MobileNav />
        
        <main className="container max-w-[1600px] mx-auto p-6 md:p-8">
           {/* Header */}
           <div className="mb-8 flex items-center gap-4">
             <Button
               variant="ghost"
               size="icon"
               onClick={() => router.push('/history')}
             >
               <ArrowLeft className="h-5 w-5" />
             </Button>
             <Button onClick={() => router.push('/')} variant="outline">
               <RefreshCw className="h-4 w-4 mr-2" />
               Refine Search
             </Button>
            
            {/* Share Toggle - Only visible to owner */}
            {isOwner && (
              <div className="flex items-center gap-3 px-4 py-2 border rounded-lg">
                <div className="flex items-center gap-2">
                  {publicState ? (
                    <Share2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium w-[50px]">
                    {publicState ? "Public" : "Private"}
                  </span>
                </div>
                <Switch
                  checked={publicState}
                  onCheckedChange={async (checked) => {
                    setPublicState(checked)
                    if (!onTogglePublic) return

                    try {
                      await onTogglePublic(checked)
                    } catch (toggleError) {
                      console.error("Failed to update public status:", toggleError)
                      setPublicState(!checked)
                    }
                  }}
                />
              </div>
            )}
            
            {/* Visitor view-only indicator */}
            {!isOwner && (
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <Eye className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  View Only
                </span>
              </Badge>
            )}
            
            {/* Mobile Map Toggle */}
            <Sheet open={mapOpen} onOpenChange={setMapOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="ml-auto lg:hidden">
                  <Map className="h-4 w-4 mr-2" />
                  View Map
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <div className="h-full">
                  <ItineraryMap 
                    activities={itinerary.activities}
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(450px,45%)] gap-8">
            {/* Left Section - Itinerary */}
            <div>
              {/* Title */}
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif italic mb-4 md:mb-6">
                {itinerary.title}
              </h1>
              
              {/* Summary */}
              <Card className="mb-6 md:mb-8">
                <CardContent className="pt-4 md:pt-6 space-y-3 md:space-y-4">
                  <p className="text-base leading-relaxed">
                    {itinerary.summary.intro}
                  </p>
                  <p className="text-base leading-relaxed">
                    {itinerary.summary.description}
                  </p>
                  
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Total Estimated Budget (After Deals)</p>
                        <p className="text-muted-foreground">{itinerary.summary.budget}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Duration</p>
                        <p className="text-muted-foreground">{itinerary.summary.duration}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Locations</p>
                        <p className="text-muted-foreground">{itinerary.summary.area}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Tag className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Included Perks</p>
                        <p className="text-muted-foreground">{itinerary.summary.perks}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Timeline */}
              <div className="space-y-0">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Your Day Timeline</h2>
                {itinerary.activities.map((activity, index) => (
                  <TimelineActivity
                    key={activity.id}
                    activity={activity}
                    isLast={index === itinerary.activities.length - 1}
                  />
                ))}
              </div>
            </div>
            
            {/* Right Section - Map (Desktop Only) */}
            <div className="hidden lg:block">
              <div className="sticky top-8">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="h-[calc(100vh-8rem)] min-h-[600px]">
                      <ItineraryMap 
                        activities={itinerary.activities}
                        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function ResultsPageWrapper() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [itineraryId, setItineraryId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  const handlePublicToggle = useCallback(async (nextPublic: boolean) => {
    if (!itineraryId) {
      throw new Error('Missing itinerary ID for public toggle')
    }

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('itineraries')
      .update({ public: nextPublic })
      .eq('id', itineraryId)

    if (updateError) {
      throw updateError
    }

    setIsPublic(nextPublic)
  }, [itineraryId])

  // Get params from URL - either direct results or database ID
  const resultsParam = searchParams?.get('results')
  const idParam = searchParams?.get('id')

  useEffect(() => {
    async function loadItinerary() {
      try {
        // Priority 1: Load from database by ID
        if (idParam) {
          const supabase = createClient()
          const { data, error: fetchError } = await supabase
            .from('itineraries')
            .select('itinerary_data, user_id, public')
            .eq('id', idParam)
            .single()

          if (fetchError) {
            console.error('Error fetching itinerary:', fetchError)
            setError('Failed to load itinerary')
            setLoading(false)
            return
          }

          if (data && data.itinerary_data) {
            // Handle case where JSONB might be returned as string or needs parsing
            try {
              const itineraryData = typeof data.itinerary_data === 'string' 
                ? JSON.parse(data.itinerary_data)
                : data.itinerary_data
              
              setItinerary(itineraryData as Itinerary)
              setItineraryId(idParam)

              const {
                data: { user },
                error: authError,
              } = await supabase.auth.getUser()

              if (authError) {
                console.error('Error fetching user:', authError)
              }

              setIsOwner(user?.id === data.user_id)
              setIsPublic(Boolean(data.public))
            } catch (parseError) {
              console.error('Error parsing itinerary data:', parseError)
              setError('Failed to parse itinerary data')
            }
          } else {
            setError('Itinerary not found')
          }
          setLoading(false)
          return
        }

        // Priority 2: Load from URL param (backward compatibility)
        if (resultsParam) {
          const parsedItinerary: Itinerary = JSON.parse(resultsParam)
          setItinerary(parsedItinerary)
          setLoading(false)
          return
        }

        // No data available
        router.push('/')
      } catch (err) {
        console.error('Error loading itinerary:', err)
        setError('Failed to load itinerary')
        setLoading(false)
      }
    }

    loadItinerary()
  }, [idParam, resultsParam, router])

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <MobileNav />
          <main className="container max-w-[1600px] mx-auto p-6 md:p-8">
            <p>Loading results...</p>
          </main>
        </div>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <MobileNav />
          <main className="container max-w-[1600px] mx-auto p-6 md:p-8">
            <p className="text-red-500">{error || 'Failed to load itinerary'}</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Go Home
            </Button>
          </main>
        </div>
      </div>
    )
  }

  return (
    <ResultsContent 
      itinerary={itinerary} 
      itineraryId={itineraryId || undefined}
      isOwner={isOwner}
      isPublic={isPublic}
      onTogglePublic={isOwner ? handlePublicToggle : undefined}
    />
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <MobileNav />
          <main className="container max-w-[1600px] mx-auto p-6 md:p-8">
            <p>Loading results...</p>
          </main>
        </div>
      </div>
    }>
      <ResultsPageWrapper />
    </Suspense>
  )
}
