import { NextRequest, NextResponse } from 'next/server'

// TODO: Replace this with actual AI/LLM integration and database queries
// This is a placeholder that returns mock data

const mockActivities = [
  {
    id: 1,
    name: "Gardens by the Bay",
    description: "Explore the stunning Supertree Grove and Cloud Forest with your loved one. Perfect for photography and leisurely walks.",
    category: "Outdoor",
    price: "$28 per person",
    duration: "2-3 hours",
    location: "Marina Bay",
    pax: "2 people",
    tags: ["Nature", "Photography", "Romantic"],
    imageUrl: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&q=80"
  },
  {
    id: 2,
    name: "Tiong Bahru Breakfast Walk",
    description: "Start your day with local breakfast spots and explore the charming Art Deco architecture of Singapore's oldest housing estate.",
    category: "Food",
    price: "$15 per person",
    duration: "2 hours",
    location: "Tiong Bahru",
    pax: "2 people",
    tags: ["Local", "Breakfast", "Heritage"],
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80"
  },
  {
    id: 3,
    name: "National Gallery Singapore",
    description: "Discover Southeast Asian art at this stunning gallery housed in the former Supreme Court and City Hall buildings.",
    category: "Artsy",
    price: "$20 per person",
    duration: "3-4 hours",
    location: "Civic District",
    pax: "2 people",
    tags: ["Art", "Culture", "Indoor"],
    imageUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800&q=80"
  },
  {
    id: 4,
    name: "East Coast Park Cycling",
    description: "Rent bikes and enjoy a scenic ride along the coast. Stop for coconuts and seafood at the hawker centers.",
    category: "Outdoor",
    price: "$10 per person",
    duration: "2-3 hours",
    location: "East Coast",
    pax: "2 people",
    tags: ["Active", "Beach", "Affordable"],
    imageUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80"
  },
  {
    id: 5,
    name: "Haji Lane Street Art Tour",
    description: "Wander through colorful murals and quirky boutiques in this hipster enclave. Perfect for Instagram-worthy shots.",
    category: "Artsy",
    price: "Free",
    duration: "1-2 hours",
    location: "Kampong Glam",
    pax: "2 people",
    tags: ["Photography", "Shopping", "Free"],
    imageUrl: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&q=80"
  },
  {
    id: 6,
    name: "Hawker Center Food Trail",
    description: "Sample Singapore's best local dishes across multiple hawker centers. From chicken rice to laksa, satay to char kway teow.",
    category: "Food",
    price: "$20 per person",
    duration: "2-3 hours",
    location: "Various",
    pax: "2 people",
    tags: ["Local", "Affordable", "Authentic"],
    imageUrl: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=800&q=80"
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log the search parameters for debugging
    console.log('Search parameters received:', body)

    // TODO: Implement actual AI/LLM logic here
    // 1. Parse user preferences and query
    // 2. Query your curated activities database
    // 3. Use AI to rank and personalize recommendations
    // 4. Return customized activity suggestions

    // For now, return mock data
    // In production, you would filter and personalize based on:
    // - body.activities (selected activity types)
    // - body.budget (budget level 0-4)
    // - body.numPax (number of people)
    // - body.mbti (personality type)
    // - body.spicy (nightlife preference)
    // - body.query (user's search query)
    // - body.startDate and body.endDate (date range)

    // Simulate some filtering based on user input
    let filteredActivities = [...mockActivities]
    
    if (body.activities && body.activities.length > 0) {
      filteredActivities = filteredActivities.filter(activity =>
        body.activities.includes(activity.category)
      )
    }

    // If no activities match or no filter was applied, return all mock activities
    if (filteredActivities.length === 0) {
      filteredActivities = mockActivities
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      activities: filteredActivities,
      query: body.query || 'your preferences',
    })
  } catch (error) {
    console.error('Error generating activities:', error)
    return NextResponse.json(
      { error: 'Failed to generate activities' },
      { status: 500 }
    )
  }
}

