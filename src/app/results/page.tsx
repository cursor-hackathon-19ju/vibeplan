"use client"

export const dynamic = 'force-dynamic'

import { useRouter } from "next/navigation"
import { useState, Suspense } from "react"
import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"
import { TimelineActivity } from "@/components/TimelineActivity"
import { ItineraryMap } from "@/components/ItineraryMap"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ArrowLeft, RefreshCw, Map, DollarSign, Clock, MapPin, Tag } from "lucide-react"

// Mock data for the itinerary
const mockItinerary = {
  title: "A sun-kissed escape: One Perfect day in Sentosa",
  summary: {
    intro: "☀️ Get ready for a sun-filled adventure across Sentosa Island — a day that balances sea breeze, local bites, and island thrills.",
    description: "From sipping kopi at hidden cafés to soaring above the beach on a zipline, this itinerary brings together relaxation and adrenaline.",
    budget: "$92.50 SGD (Save up to $24 with AI-exclusive discounts)",
    duration: "8:00 AM – 9:30 PM (Full-day itinerary)",
    area: "Sentosa Island + HarbourFront",
    perks: "10% off dining · $5 attraction rebate · Free drink voucher"
  },
  activities: [
    {
      id: 1,
      time: "8:00 AM - 9:00 AM",
      title: "Breakfast at Yakun Kaya Toast",
      description: (
        <>
          As the city stirs awake, stroll into <strong>Yakun Kaya Toast at VivoCity</strong> for the quintessential Singapore breakfast. For just <strong>$7.20</strong> with your AI pass, enjoy a <strong>10% discount</strong> on a set of soft-boiled eggs, thick kaya toast, and freshly brewed kopi. The chatter of commuters, the clinking of cups, and the faint scent of toasted bread mark the perfect start to your island day before you cross the bridge into Sentosa.
        </>
      ),
      location: "VivoCity, HarbourFront",
      price: "$7.20",
      discount: "10% off",
      imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
      tags: ["Breakfast", "Local", "Café"],
      coordinates: { lat: 1.2644, lng: 103.8220 }
    },
    {
      id: 2,
      time: "9:30 AM - 11:30 AM",
      title: "Beach Walk & Swim at Siloso Beach",
      description: (
        <>
          Cross the <strong>Sentosa Boardwalk</strong> and head straight to <strong>Siloso Beach</strong>. Feel the soft sand between your toes and dive into the gentle waves. The morning sun isn't too harsh yet, making it perfect for a refreshing swim. Grab a coconut from a nearby vendor <strong>($4)</strong> and relax under a palm tree, watching kayakers glide across the turquoise waters.
        </>
      ),
      location: "Siloso Beach, Sentosa",
      price: "Free (Coconut: $4)",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      tags: ["Beach", "Nature", "Free Activity"],
      coordinates: { lat: 1.2471, lng: 103.8096 }
    },
    {
      id: 3,
      time: "12:00 PM - 1:30 PM",
      title: "Lunch at Coastes Beachside Café",
      description: (
        <>
          Settle into <strong>Coastes</strong>, where the sea breeze meets comfort food. Order the signature fish and chips <strong>($18.50)</strong> or a hearty burger while watching the beach volleyball matches. With your AI discount, you'll save another <strong>10%</strong> and get a complimentary iced lemon tea. The laid-back vibe and ocean view make this the perfect midday pause.
        </>
      ),
      location: "Siloso Beach, Sentosa",
      price: "$18.50",
      discount: "10% off + Free drink",
      imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
      tags: ["Lunch", "Beachfront", "Western"],
      coordinates: { lat: 1.2475, lng: 103.8090 }
    },
    {
      id: 4,
      time: "2:00 PM - 4:00 PM",
      title: "MegaZip Adventure & Skyline Luge",
      description: (
        <>
          Time for adrenaline! Soar <strong>450 meters</strong> across the jungle canopy on the <strong>MegaZip zipline</strong>, ending with a splash landing on Siloso Beach. Then, race down <strong>Skyline Luge Sentosa's</strong> winding tracks with panoramic views of the South China Sea. The combo ticket, usually <strong>$65</strong>, is yours for <strong>$55</strong> with the <strong>AI attraction rebate</strong>.
        </>
      ),
      location: "Imbiah Lookout, Sentosa",
      price: "$55",
      discount: "$10 rebate",
      imageUrl: "https://images.unsplash.com/photo-1624286763166-c0e36ce59daf?w=800&q=80",
      tags: ["Adventure", "Thrills", "Outdoor"],
      coordinates: { lat: 1.2494, lng: 103.8182 }
    },
    {
      id: 5,
      time: "6:00 PM - 7:30 PM",
      title: "Sunset at Fort Siloso Skywalk",
      description: (
        <>
          Wind down your adventure at the <strong>Fort Siloso Skywalk</strong>, a glass-bottom walkway <strong>11 stories high</strong>. Watch the sun dip into the horizon, painting the sky in shades of amber and rose. Entry is just <strong>$5</strong>, and the views of the harbor, container ships, and neighboring islands are nothing short of spectacular.
        </>
      ),
      location: "Fort Siloso, Sentosa",
      price: "$5",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      tags: ["Sunset", "Views", "Photography"],
      coordinates: { lat: 1.2493, lng: 103.8069 }
    },
    {
      id: 6,
      time: "8:00 PM - 9:30 PM",
      title: "Dinner & Wings of Time Show",
      description: (
        <>
          Cap off the night with dinner at one of <strong>Sentosa's beachfront restaurants</strong> before catching the <strong>Wings of Time show at 8:40 PM</strong>. This open-air pyrotechnic and water show blends fire, lasers, and storytelling against the ocean backdrop. Best of all? It's <strong>free to watch</strong> from the beach, making it the perfect finale to your island escape.
        </>
      ),
      location: "Beach Station, Sentosa",
      price: "Free (Dinner est. $25)",
      imageUrl: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80",
      tags: ["Dinner", "Show", "Nightlife"],
      coordinates: { lat: 1.2500, lng: 103.8140 }
    }
  ]
}

function ResultsContent() {
  const router = useRouter()
  const [mapOpen, setMapOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1">
        <MobileNav />
        
        <main className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8 flex items-center gap-3 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button onClick={() => router.push('/')} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refine Search
            </Button>
            
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
                    activities={mockItinerary.activities}
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8">
            {/* Left Section - Itinerary */}
            <div>
              {/* Title */}
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif italic mb-4 md:mb-6">
                {mockItinerary.title}
              </h1>
              
              {/* Summary */}
              <Card className="mb-6 md:mb-8">
                <CardContent className="pt-4 md:pt-6 space-y-3 md:space-y-4">
                  <p className="text-base leading-relaxed">
                    {mockItinerary.summary.intro}
                  </p>
                  <p className="text-base leading-relaxed">
                    {mockItinerary.summary.description}
                  </p>
                  
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Total Estimated Budget (After Deals)</p>
                        <p className="text-muted-foreground">{mockItinerary.summary.budget}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Duration</p>
                        <p className="text-muted-foreground">{mockItinerary.summary.duration}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Locations</p>
                        <p className="text-muted-foreground">{mockItinerary.summary.area}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Tag className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Included Perks</p>
                        <p className="text-muted-foreground">{mockItinerary.summary.perks}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Timeline */}
              <div className="space-y-0">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Your Day Timeline</h2>
                {mockItinerary.activities.map((activity, index) => (
                  <TimelineActivity
                    key={activity.id}
                    activity={activity}
                    isLast={index === mockItinerary.activities.length - 1}
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
                        activities={mockItinerary.activities}
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

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <MobileNav />
          <main className="container max-w-6xl mx-auto p-6 md:p-8">
            <p>Loading results...</p>
          </main>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
