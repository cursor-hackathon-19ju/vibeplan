"use client"

export const dynamic = 'force-dynamic'

import { useRouter } from "next/navigation"
import { useState, Suspense } from "react"
import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"
import { TimelineActivity } from "@/components/TimelineActivity"
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
      description: "As the city stirs awake, stroll into Yakun Kaya Toast at VivoCity for the quintessential Singapore breakfast. For just $7.20 with your AI pass, enjoy a 10% discount on a set of soft-boiled eggs, thick kaya toast, and freshly brewed kopi. The chatter of commuters, the clinking of cups, and the faint scent of toasted bread mark the perfect start to your island day before you cross the bridge into Sentosa.",
      location: "VivoCity, HarbourFront",
      price: "$7.20",
      discount: "10% off",
      imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
      tags: ["Breakfast", "Local", "Café"]
    },
    {
      id: 2,
      time: "9:30 AM - 11:30 AM",
      title: "Beach Walk & Swim at Siloso Beach",
      description: "Cross the Sentosa Boardwalk and head straight to Siloso Beach. Feel the soft sand between your toes and dive into the gentle waves. The morning sun isn't too harsh yet, making it perfect for a refreshing swim. Grab a coconut from a nearby vendor ($4) and relax under a palm tree, watching kayakers glide across the turquoise waters.",
      location: "Siloso Beach, Sentosa",
      price: "Free (Coconut: $4)",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      tags: ["Beach", "Nature", "Free Activity"]
    },
    {
      id: 3,
      time: "12:00 PM - 1:30 PM",
      title: "Lunch at Coastes Beachside Café",
      description: "Settle into Coastes, where the sea breeze meets comfort food. Order the signature fish and chips ($18.50) or a hearty burger while watching the beach volleyball matches. With your AI discount, you'll save another 10% and get a complimentary iced lemon tea. The laid-back vibe and ocean view make this the perfect midday pause.",
      location: "Siloso Beach, Sentosa",
      price: "$18.50",
      discount: "10% off + Free drink",
      imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
      tags: ["Lunch", "Beachfront", "Western"]
    },
    {
      id: 4,
      time: "2:00 PM - 4:00 PM",
      title: "MegaZip Adventure & Skyline Luge",
      description: "Time for adrenaline! Soar 450 meters across the jungle canopy on the MegaZip zipline, ending with a splash landing on Siloso Beach. Then, race down Skyline Luge Sentosa's winding tracks with panoramic views of the South China Sea. The combo ticket, usually $65, is yours for $55 with the AI attraction rebate.",
      location: "Imbiah Lookout, Sentosa",
      price: "$55",
      discount: "$10 rebate",
      imageUrl: "https://images.unsplash.com/photo-1624286763166-c0e36ce59daf?w=800&q=80",
      tags: ["Adventure", "Thrills", "Outdoor"]
    },
    {
      id: 5,
      time: "6:00 PM - 7:30 PM",
      title: "Sunset at Fort Siloso Skywalk",
      description: "Wind down your adventure at the Fort Siloso Skywalk, a glass-bottom walkway 11 stories high. Watch the sun dip into the horizon, painting the sky in shades of amber and rose. Entry is just $5, and the views of the harbor, container ships, and neighboring islands are nothing short of spectacular.",
      location: "Fort Siloso, Sentosa",
      price: "$5",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      tags: ["Sunset", "Views", "Photography"]
    },
    {
      id: 6,
      time: "8:00 PM - 9:30 PM",
      title: "Dinner & Wings of Time Show",
      description: "Cap off the night with dinner at one of Sentosa's beachfront restaurants before catching the Wings of Time show at 8:40 PM. This open-air pyrotechnic and water show blends fire, lasers, and storytelling against the ocean backdrop. Best of all? It's free to watch from the beach, making it the perfect finale to your island escape.",
      location: "Beach Station, Sentosa",
      price: "Free (Dinner est. $25)",
      imageUrl: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80",
      tags: ["Dinner", "Show", "Nightlife"]
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
        
        <main className="container max-w-7xl mx-auto p-6 md:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
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
                <div className="h-full flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center space-y-2">
                    <Map className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Map View</h3>
                    <p className="text-sm text-muted-foreground">
                      Interactive map coming soon
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8">
            {/* Left Section - Itinerary */}
            <div>
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif italic mb-6">
                {mockItinerary.title}
              </h1>
              
              {/* Summary */}
              <Card className="mb-8">
                <CardContent className="pt-6 space-y-4">
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
                        <p className="font-semibold">Area Covered</p>
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
                <h2 className="text-2xl font-semibold mb-6">Your Day Timeline</h2>
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
                    <div className="h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center bg-muted">
                      <div className="text-center space-y-3 p-6">
                        <Map className="h-16 w-16 mx-auto text-muted-foreground" />
                        <h3 className="text-xl font-semibold">Map View</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          Interactive map showing all activity locations will appear here
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          Coming Soon
                        </p>
                      </div>
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
