// LLM-powered activity curation and itinerary generation

import OpenAI from 'openai'
import type { Activity } from './chromaClient'

let openaiInstance: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in environment variables')
    }
    openaiInstance = new OpenAI({ apiKey })
  }
  return openaiInstance
}

/**
 * Generate random coordinates within a specified radius from a center point
 * @param centerLat - Center latitude
 * @param centerLng - Center longitude
 * @param radiusKm - Radius in kilometers
 * @returns Random coordinates within the radius
 */
function getRandomCoordinatesWithinRadius(
  centerLat: number,
  centerLng: number,
  radiusKm: number
): { lat: number; lng: number } {
  // Convert radius from kilometers to degrees
  // 1 degree ≈ 111 km at the equator
  const radiusInDegrees = radiusKm / 111.0

  // Generate random angle and distance
  const angle = Math.random() * 2 * Math.PI
  const distance = Math.sqrt(Math.random()) * radiusInDegrees

  // Calculate offset
  const deltaLat = distance * Math.cos(angle)
  const deltaLng = distance * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180)

  return {
    lat: parseFloat((centerLat + deltaLat).toFixed(6)),
    lng: parseFloat((centerLng + deltaLng).toFixed(6))
  }
}

// Singapore central coordinates
const SINGAPORE_CENTRAL_LAT = 1.290270
const SINGAPORE_CENTRAL_LNG = 103.851959
const DEFAULT_RADIUS_KM = 2

interface UserPreferences {
  query: string
  budget: number
  numPax: string
  mbti?: string
  spicy?: boolean
  activities?: string[]
}

interface SelectedActivity extends Activity {
  id: number
  time: string
  coordinates: {
    lat: number
    lng: number
  }
}

interface Itinerary {
  title: string
  summary: {
    intro: string
    description: string
    budget: string
    duration: string
    area: string
    perks: string
  }
  activities: SelectedActivity[]
}

const budgetLabels = [
  'Broke (<$30/person)',
  'Budget ($30-50)',
  'Moderate ($50-75)',
  'Comfortable ($75-100)',
  'Baller ($100+)'
]

// Step 1: Select and arrange 4-6 activities from candidates
export async function selectAndArrangeActivities(
  candidateActivities: Activity[],
  preferences: UserPreferences
): Promise<SelectedActivity[]> {
  const openai = getOpenAIClient()

  const prompt = `You are a Singapore local guide selecting activities for a personalized itinerary.

USER PREFERENCES:
- Query: "${preferences.query}"
- Number of people: ${preferences.numPax || 'Not specified'}
- Budget: ${budgetLabels[preferences.budget] || 'Not specified'}
${preferences.activities && preferences.activities.length > 0 ? `- Activity types: ${preferences.activities.join(', ')}` : ''}
${preferences.mbti ? `- Personality: ${preferences.mbti}` : ''}
${preferences.spicy ? '- Include nightlife/drinks: YES' : ''}

CANDIDATE ACTIVITIES:
${JSON.stringify(candidateActivities, null, 2)}

TASK:
Select 4-6 activities that best match the user's preferences and create a logical timeline.

REQUIREMENTS:
1. Choose activities that fit the budget and preferences
2. Create a realistic timeline with start/end times
3. Consider logical flow (e.g., breakfast → lunch → activity → dinner)
4. Ensure variety - don't select multiple activities of the same type (e.g., no "brunch → brunch → brunch")
5. Preserve ALL original fields including source_link, latitude, longitude
6. For coordinates: use latitude/longitude from activity if available. If not available, set coordinates to null - they will be filled in later.
7. Return ONLY valid JSON

OUTPUT FORMAT:
{
  "activities": [
    {
      ...all fields from original activity including source_link, latitude, longitude...,
      "id": 1,
      "time": "9:00 AM - 11:00 AM",
      "coordinates": {"lat": <use latitude if available, else null>, "lng": <use longitude if available, else null>}
    }
  ]
}

Return ONLY the JSON, no explanations.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    const activities = result.activities || []

    // Post-process: fill in random coordinates for activities without them
    const processedActivities = activities.map((activity: any) => {
      // Check if coordinates are missing or null
      if (!activity.coordinates ||
          activity.coordinates.lat === null ||
          activity.coordinates.lng === null ||
          (activity.coordinates.lat === 1.290270 && activity.coordinates.lng === 103.851959)) {
        // Generate random coordinates within 2km of Singapore central
        const randomCoords = getRandomCoordinatesWithinRadius(
          SINGAPORE_CENTRAL_LAT,
          SINGAPORE_CENTRAL_LNG,
          DEFAULT_RADIUS_KM
        )
        return {
          ...activity,
          coordinates: randomCoords
        }
      }
      return activity
    })

    console.log(`✅ Selected ${processedActivities.length} activities`)

    return processedActivities
  } catch (error) {
    console.error('❌ Activity selection error:', error)
    throw new Error('Failed to select activities')
  }
}

// Step 2a: Enhance activity data (emojis + price formatting) - Fast task using gpt-4o-mini
async function enhanceActivityData(
  selectedActivities: SelectedActivity[]
): Promise<SelectedActivity[]> {
  const startTime = Date.now()
  const openai = getOpenAIClient()

  const prompt = `You are a data enhancer. Enhance these activities:

1. **Add contextual emojis to titles:**
   - Prepend ONE relevant emoji (e.g., "🥐 Brunch at Cafe", "🎨 Art Gallery", "🌳 Park Visit")

2. **Format prices as strings:**
   - If price is 0, null, or missing, estimate based on activity type:
     * Café/local food: $5–$15
     * Museum/attraction: $10–$40
     * Premium experience: $50+
     * Free outdoor: "Free"

   IMPORTANT: Format as STRING:
   - Free activities: "Free" (not 0)
   - Paid activities: "$25", "$12.50", etc.

3. Keep ALL original fields (coordinates, source_link, latitude, longitude).

Return JSON:
{
  "activities": [/* enhanced activities with emoji titles and formatted prices */]
}

Activities to enhance:
${JSON.stringify(selectedActivities, null, 2)}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Faster, cheaper model for simple data enhancement
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3 // Lower temperature for consistent formatting
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    const duration = Date.now() - startTime
    console.log(`✅ Enhanced ${result.activities?.length || 0} activities with emojis and prices (${duration}ms)`)
    return result.activities || selectedActivities
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ Activity enhancement error after ${duration}ms:`, error)
    // Fallback: return original activities
    return selectedActivities
  }
}

// Step 2b: Generate creative itinerary summary (title, intro, description) - Creative task using gpt-4o
async function generateItinerarySummary(
  activities: SelectedActivity[]
): Promise<{ title: string; intro: string; description: string }> {
  const startTime = Date.now()
  const openai = getOpenAIClient()

  // Create a simplified activity list for summary generation (no need for all fields)
  const simplifiedActivities = activities.map(a => ({
    title: a.title,
    description: a.description,
    location: a.location,
    time: a.time
  }))

  const prompt = `You are a world-class travel writer. Create an engaging itinerary summary.

Given these activities:
${JSON.stringify(simplifiedActivities, null, 2)}

Generate:
1. **Title**: Travel magazine style (e.g., "A Sun-Kissed Escape: One Perfect Day in Sentosa")
2. **Intro**: 1-2 sentence emotional hook (can include 1 emoji)
3. **Description**: 2-3 sentences describing the day's flow (morning → afternoon → evening)

Style:
- Natural, descriptive language
- Evocative but not over-the-top
- Focus on the experience, not just listing activities

Return JSON:
{
  "title": "<vivid headline>",
  "intro": "<engaging hook>",
  "description": "<overview of the day>"
}

Return ONLY the JSON, no explanations.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Use full model for creative writing
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8 // Higher temperature for creativity
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    const duration = Date.now() - startTime
    console.log(`✅ Generated itinerary summary: "${result.title}" (${duration}ms)`)
    return {
      title: result.title || 'Your Singapore Adventure',
      intro: result.intro || '',
      description: result.description || ''
    }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ Summary generation error after ${duration}ms:`, error)
    // Fallback: return simple summary
    return {
      title: 'Your Singapore Itinerary',
      intro: 'Discover the best of Singapore with this curated itinerary.',
      description: 'Enjoy a day filled with memorable experiences across the city.'
    }
  }
}

// Step 2c: Calculate metadata (budget, duration, area, perks) - Structured task using gpt-4o-mini
async function calculateMetadata(
  activities: SelectedActivity[]
): Promise<{ budget: string; duration: string; area: string; perks: string }> {
  const startTime = Date.now()
  const openai = getOpenAIClient()

  const prompt = `Analyze these activities and extract metadata:

${JSON.stringify(activities, null, 2)}

Extract:
1. **Budget**: Sum all prices. Format as "$XX SGD" or "$XX.XX SGD". If all free, use "$0 SGD".
2. **Duration**: Extract from time fields. Format as "9:00 AM – 9:00 PM (12-hour itinerary)".
3. **Area**: List neighborhoods/areas mentioned (e.g., "Sentosa + Marina Bay + Orchard").
4. **Perks**: Extract ONLY actual deals from descriptions (e.g., "10% off", "Free drink"). If none, use empty string.

Rules:
- Only include data directly from the input
- Do NOT make assumptions or estimates
- If data is missing, use empty string ""

Return JSON:
{
  "budget": "<calculated budget>",
  "duration": "<time range>",
  "area": "<locations>",
  "perks": "<deals found or empty string>"
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast model for structured extraction
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1 // Very low temperature for factual extraction
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    const duration = Date.now() - startTime
    console.log(`✅ Calculated metadata: budget=${result.budget}, duration=${result.duration} (${duration}ms)`)
    return {
      budget: result.budget || '',
      duration: result.duration || '',
      area: result.area || '',
      perks: result.perks || ''
    }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ Metadata calculation error after ${duration}ms:`, error)
    // Fallback: return empty metadata
    return { budget: '', duration: '', area: '', perks: '' }
  }
}

// Step 2: Enhance itinerary with parallel processing (3x faster!)
export async function enhanceItinerary(
  selectedActivities: SelectedActivity[]
): Promise<Itinerary> {
  console.log('🚀 Starting parallel itinerary enhancement...')

  try {
    // Execute all three enhancements in parallel
    const [enhancedActivities, summary, metadata] = await Promise.all([
      enhanceActivityData(selectedActivities),        // ~2-3 seconds (gpt-4o-mini)
      generateItinerarySummary(selectedActivities),   // ~4-5 seconds (gpt-4o)
      calculateMetadata(selectedActivities)           // ~2-3 seconds (gpt-4o-mini)
    ])

    console.log('✅ All parallel enhancements completed')

    return {
      title: summary.title,
      summary: {
        intro: summary.intro,
        description: summary.description,
        budget: metadata.budget,
        duration: metadata.duration,
        area: metadata.area,
        perks: metadata.perks
      },
      activities: enhancedActivities
    }
  } catch (error) {
    console.error('❌ Itinerary enhancement error:', error)
    throw new Error('Failed to enhance itinerary')
  }
}
