import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// TODO: Replace this with actual AI/LLM integration and database queries
// This is a placeholder that returns mock itinerary data

export async function POST(request: NextRequest) {
  
  try {
    const body = await request.json()
    
    // Log the search parameters for debugging
    console.log('Search parameters received:', body)

    // TODO: Implement actual AI/LLM logic here
    // 1. Parse user preferences and query
    // 2. Query your curated activities database
    // 3. Use AI to generate personalized itinerary with timeline
    // 4. Return complete day plan with activities, descriptions, and coordinates

    // For now, return mock itinerary data
    // In production, you would generate this based on:
    // - body.activities (selected activity types)
    // - body.budget (budget level 0-4)
    // - body.numPax (number of people)
    // - body.mbti (personality type)
    // - body.spicy (nightlife preference)
    // - body.query (user's search query)
    // - body.startDate and body.endDate (date range)

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // TypeScript interfaces for the itinerary data
    // interface Coordinates {
    //   lat: number
    //   lng: number
    // }

    // interface Activity {
    //   id: number
    //   time: string
    //   title: string
    //   description: string
    //   location: string
    //   price: string
    //   discount?: string
    //   imageUrl: string
    //   coordinates: Coordinates
    // }

    // interface ItinerarySummary {
    //   intro: string
    //   description: string
    //   budget: string
    //   duration: string
    //   area: string
    //   perks: string
    // }

    // interface Itinerary {
    //   title: string
    //   summary: ItinerarySummary
    //   activities: Activity[]
    // }

    // interface ResultsContentProps {
    //   itinerary: Itinerary
    // }

    // Generate itinerary (currently mock data, will be replaced with AI)
    const itineraryData = {
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
          description: "As the city stirs awake, stroll into <strong>Yakun Kaya Toast at VivoCity</strong> for the quintessential Singapore breakfast. For just <strong>$7.20</strong> with your AI pass, enjoy a <strong>10% discount</strong> on a set of soft-boiled eggs, thick kaya toast, and freshly brewed kopi. The chatter of commuters, the clinking of cups, and the faint scent of toasted bread mark the perfect start to your island day before you cross the bridge into Sentosa.",
          location: "VivoCity, HarbourFront",
          price: "$7.20",
          discount: "10% off",
          coordinates: { lat: 1.2644, lng: 103.8220 }
        },
        {
          id: 2,
          time: "9:30 AM - 11:30 AM",
          title: "Beach Walk & Swim at Siloso Beach",
          description: "Cross the <strong>Sentosa Boardwalk</strong> and head straight to <strong>Siloso Beach</strong>. Feel the soft sand between your toes and dive into the gentle waves. The morning sun isn't too harsh yet, making it perfect for a refreshing swim. Grab a coconut from a nearby vendor <strong>($4)</strong> and relax under a palm tree, watching kayakers glide across the turquoise waters.",
          location: "Siloso Beach, Sentosa",
          price: "Free (Coconut: $4)",
          coordinates: { lat: 1.2471, lng: 103.8096 }
        },
        {
          id: 3,
          time: "12:00 PM - 1:30 PM",
          title: "Lunch at Coastes Beachside Café",
          description: "Settle into <strong>Coastes</strong>, where the sea breeze meets comfort food. Order the signature fish and chips <strong>($18.50)</strong> or a hearty burger while watching the beach volleyball matches. With your AI discount, you'll save another <strong>10%</strong> and get a complimentary iced lemon tea. The laid-back vibe and ocean view make this the perfect midday pause.",
          location: "Siloso Beach, Sentosa",
          price: "$18.50",
          discount: "10% off + Free drink",
          coordinates: { lat: 1.2475, lng: 103.8090 }
        },
        {
          id: 4,
          time: "2:00 PM - 4:00 PM",
          title: "MegaZip Adventure & Skyline Luge",
          description: "Time for adrenaline! Soar <strong>450 meters</strong> across the jungle canopy on the <strong>MegaZip zipline</strong>, ending with a splash landing on Siloso Beach. Then, race down <strong>Skyline Luge Sentosa's</strong> winding tracks with panoramic views of the South China Sea. The combo ticket, usually <strong>$65</strong>, is yours for <strong>$55</strong> with the <strong>AI attraction rebate</strong>.",
          location: "Imbiah Lookout, Sentosa",
          price: "$55",
          discount: "$10 rebate",
          coordinates: { lat: 1.2494, lng: 103.8182 }
        },
        {
          id: 5,
          time: "6:00 PM - 7:30 PM",
          title: "Sunset at Fort Siloso Skywalk",
          description: "Wind down your adventure at the <strong>Fort Siloso Skywalk</strong>, a glass-bottom walkway <strong>11 stories high</strong>. Watch the sun dip into the horizon, painting the sky in shades of amber and rose. Entry is just <strong>$5</strong>, and the views of the harbor, container ships, and neighboring islands are nothing short of spectacular.",
          location: "Fort Siloso, Sentosa",
          price: "$5",
          coordinates: { lat: 1.2493, lng: 103.8069 }
        },
        {
          id: 6,
          time: "8:00 PM - 9:30 PM",
          title: "Dinner & Wings of Time Show",
          description: "Cap off the night with dinner at one of <strong>Sentosa's beachfront restaurants</strong> before catching the <strong>Wings of Time show at 8:40 PM</strong>. This open-air pyrotechnic and water show blends fire, lasers, and storytelling against the ocean backdrop. Best of all? It's <strong>free to watch</strong> from the beach, making it the perfect finale to your island escape.",
          location: "Beach Station, Sentosa",
          price: "Free (Dinner est. $25)",
          coordinates: { lat: 1.2500, lng: 103.8140 }
        }
      ]
    }

    // Save to Supabase database
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Insert itinerary into database
    const { data: itinerary, error: insertError } = await supabase
      .from('itineraries')
      .insert({
        user_id: user.id,
        query: body.query || '',
        activities: body.activities || [],
        budget: body.budget || 0,
        num_pax: body.numPax || '1',
        mbti: body.mbti || null,
        spicy: body.spicy === true,
        start_date: body.startDate || null,
        end_date: body.endDate || null,
        itinerary_data: itineraryData
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error saving itinerary:', insertError)
      return NextResponse.json(
        { error: 'Failed to save itinerary' },
        { status: 500 }
      )
    }

    // Return both the itinerary data and the database ID
    return NextResponse.json({
      ...itineraryData,
      itineraryId: itinerary.id
    })
  } catch (error) {
    console.error('Error generating itinerary:', error)
    return NextResponse.json(
      { error: 'Failed to generate itinerary' },
      { status: 500 }
    )
  }
}

