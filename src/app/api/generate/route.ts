import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Exa from "exa-js"
import { buildSemanticKeywords } from './utils/keywords'
import { queryActivities } from './utils/chromaClient'
import { selectAndArrangeActivities, enhanceItinerary } from './utils/llmCurator'

// Helper: Detect if query is venue-specific (e.g., "brunch spots", "cafes", "bars")
function isVenueSpecificQuery(query: string): boolean {
  const venuePatterns = [
    /\b(brunch|breakfast|lunch|dinner)\s+(spot|place|venue)s?\b/i,
    /\b(cafe|coffee|bar|restaurant|pub|bistro|eatery)s?\b/i,
    /\bwhere\s+to\s+(eat|drink|brunch|dine)\b/i,
    /\b(food|dining)\s+(spot|place|venue)s?\b/i
  ]
  return venuePatterns.some(pattern => pattern.test(query))
}

export async function POST(request: NextRequest) {

  try {
    const body = await request.json()

    // Log the search parameters for debugging
    console.log('🔍 Search parameters received:', body)

    // STEP 1: Build semantic keywords for ChromaDB search
    const semanticQuery = buildSemanticKeywords({
      query: body.query,
      activities: body.activities,
      budget: body.budget,
      numPax: body.numPax,
      mbti: body.mbti,
      spicy: body.spicy
    })
    console.log('📝 Semantic query:', semanticQuery)

    // STEP 2: Fetch activities from ChromaDB with multi-query strategy
    let chromaActivities: any[] = []
    try {
      const isVenueQuery = isVenueSpecificQuery(body.query)

      if (isVenueQuery) {
        // Multi-query strategy: Get specific venues + diverse activities
        console.log('🎯 Venue-specific query detected - using dual query strategy')

        // Query 1: Get 3-5 of the requested venue type
        const specificActivities = await queryActivities(semanticQuery, 5)
        console.log(`✅ ChromaDB (specific): Found ${specificActivities.length} matching venues`)

        // Query 2: Get 10 diverse complementary activities
        const diverseQuery = `${body.query} things to do activities attractions experiences Singapore`
        const diverseActivities = await queryActivities(diverseQuery, 10)
        console.log(`✅ ChromaDB (diverse): Found ${diverseActivities.length} complementary activities`)

        // Merge results (specific first, then diverse)
        chromaActivities = [...specificActivities, ...diverseActivities]
        console.log(`📊 ChromaDB: Combined ${chromaActivities.length} total activities (${specificActivities.length} specific + ${diverseActivities.length} diverse)`)
      } else {
        // Standard single query for full-day plans
        chromaActivities = await queryActivities(semanticQuery, 15)
        console.log(`✅ ChromaDB: Found ${chromaActivities.length} activities`)
      }
    } catch (error) {
      console.warn('⚠️ ChromaDB query failed, continuing with Exa only:', error)
    }

    // STEP 3: Fetch results from Exa (web search)
    const exa = new Exa(process.env.EXA_API_KEY);
    const refined_query = `I want to plan an activity that includes ${body.activities.length > 0 ? body.activities.join(', ') : 'a mix of activities'}, for a total of ${body.numPax || 'a few'} people. The budget is ${body.budget} on a scale of 0–4 (where 0 = <$30 and 4 = $100+). This plan is tailored for individuals with the MBTI type ${body.mbti || 'any type'}. ${body.spicy ? 'It should also include drinks and nightlife.' : ''} The main preference or goal is: "${body.query}".`

    // Calculate date range: 30 days ago to today
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const exa_result = await exa.searchAndContents(
      `${refined_query}`,
      {
        type: "auto",
        userLocation: "SG",
        numResults: 5,
        startPublishedDate: startDate.toISOString(),
        endPublishedDate: endDate.toISOString(),
        summary: {
          schema: {
            description: "Schema for activity information including title, description, and tags",
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Activity title in format: [Meal/Activity Type] at [Venue Name]"
              },
              description: {
                type: "string",
                description: "2-3 engaging sentences about the experience that start with an action verb, describe the ambiance, mention deals naturally, and feel like a friend's recommendation"
              },
              tags: {
                type: "array",
                description: "3-5 relevant tags categorizing the activity",
                items: {
                  type: "string",
                  description: "Tag related to meal time, vibe, activity type, cuisine, or occasion"
                }
              }
            },
            required: ["title", "description", "tags"],
            additionalProperties: false
          }
        }
      }
    );

    const exaSummaries = exa_result.results.map((r: any) => ({
      ...JSON.parse(r.summary),
      url: r.url
    }));
    console.log(`✅ Exa: Found ${exaSummaries.length} activities`)

    // STEP 4: Combine ChromaDB and Exa activities
    const combinedActivities = [
      ...chromaActivities,
      ...exaSummaries.map((summary: any) => ({
        title: summary.title,
        description: summary.description,
        tags: summary.tags || [],
        location: 'Singapore', // Exa results don't have specific location
        venue_name: summary.title.split(' at ')[1] || 'Various',
        price: null, // Will be estimated by LLM
        duration_hours: null,
        offer_type: 'activity',
        validity_end: null,
        source_channel: 'exa',
        source_type: 'web',
        source_link: summary.url, // URL from Exa search result
        latitude: null, // Will be added by LLM
        longitude: null // Will be added by LLM
      }))
    ]
    console.log(`📊 Total combined activities: ${combinedActivities.length} (${chromaActivities.length} from ChromaDB + ${exaSummaries.length} from Exa)`)

    // Log first activity to verify fields
    if (chromaActivities.length > 0) {
      const firstActivity = chromaActivities[0]
      console.log('🔍 First ChromaDB activity fields:')
      console.log(`   - source_link: ${firstActivity.source_link || 'MISSING'}`)
      console.log(`   - latitude: ${firstActivity.latitude || 'MISSING'}`)
      console.log(`   - longitude: ${firstActivity.longitude || 'MISSING'}`)
    }

    // STEP 5: Use LLM to select 4-6 best activities and arrange timeline
    const selectedActivities = await selectAndArrangeActivities(
      combinedActivities,
      {
        query: body.query,
        budget: body.budget,
        numPax: body.numPax,
        mbti: body.mbti,
        spicy: body.spicy,
        activities: body.activities
      }
    )
    console.log(`✅ Selected ${selectedActivities.length} activities`)

    // STEP 6: Enhance itinerary with price estimation and summary
    const itineraryData = await enhanceItinerary(selectedActivities)
    console.log(`✅ Generated itinerary: "${itineraryData.title}"`)

    // Log final activity to verify fields are preserved
    if (itineraryData.activities && itineraryData.activities.length > 0) {
      const finalActivity = itineraryData.activities[0]
      console.log('🔍 Final itinerary first activity fields:')
      console.log(`   - source_link: ${finalActivity.source_link || 'MISSING'}`)
      console.log(`   - latitude: ${finalActivity.latitude || 'MISSING'}`)
      console.log(`   - longitude: ${finalActivity.longitude || 'MISSING'}`)
      console.log(`   - coordinates: ${JSON.stringify(finalActivity.coordinates)}`)
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

