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
Analyze the user's query and create a logical itinerary:

QUERY ANALYSIS:
1. If the user asks for a specific type of venue (e.g., "brunch spots", "cafes", "bars"):
   - Select ONLY 1-2 activities of that type
   - This is a recommendation list, not a full-day itinerary
   - Don't create a timeline with multiple identical meal types

2. If the user asks for a full day/activity plan (e.g., "plan my weekend", "things to do"):
   - Select 4-6 diverse activities
   - Create a realistic full-day timeline
   - Ensure logical flow and variety

LOGICAL CONSTRAINTS (CRITICAL):
- NEVER select multiple meals of the same type (e.g., NO "brunch → brunch → brunch")
- NEVER select duplicate venue types unless creating a comparison list
- A person can only eat one breakfast, one brunch, one lunch, and one dinner per day
- Mix different activity types: meals + attractions + experiences + nightlife
- For meal-specific queries, return 1-2 top recommendations, not a full itinerary

REQUIREMENTS:
1. Choose activities that fit the budget and preferences
2. Create a realistic timeline with start/end times
3. Ensure activities flow logically (breakfast 8-10AM → activity 10AM-2PM → lunch 12-2PM → activity 3-6PM → dinner 7-9PM)
4. Add coordinates for each activity (use Singapore central: lat 1.290270, lng 103.851959 if missing)
5. For single-venue queries (brunch spots, cafes, bars), limit to 1-2 options
6. Return ONLY valid JSON

OUTPUT FORMAT:
{
  "activities": [
    {
      ...all fields from original activity...,
      "id": 1,
      "time": "9:00 AM - 11:00 AM",
      "coordinates": {"lat": 1.xxx, "lng": 103.xxx}
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
    console.log(`✅ Selected ${result.activities?.length || 0} activities`)

    return result.activities || []
  } catch (error) {
    console.error('❌ Activity selection error:', error)
    throw new Error('Failed to select activities')
  }
}

// Step 2: Enhance itinerary with your custom prompt
export async function enhanceItinerary(
  selectedActivities: SelectedActivity[]
): Promise<Itinerary> {
  const openai = getOpenAIClient()

  const prompt = `You are a world-class AI travel writer and data enhancer. You are given a list of JSON objects called "activities", each representing a travel experience.

Your task:

1. If an activity's "price" is 0, null, or missing, estimate a realistic price in SGD based on its type and context. Use reasonable Singapore price ranges:
   - Café / local food: $5–$15
   - Museum / attraction: $10–$40
   - Premium / adventure experience: $50+
   - Free outdoor / sightseeing: $0
   Keep the price as a float with 2 decimals.

2. Keep all original fields, only update the "price" field if needed.

3. Do NOT hallucinate or invent any information. Only include data that can be directly inferred from the provided activities JSON.

4. For the "summary" section:
   - If budget can be computed (sum of all activity prices), include it as: "$<total> SGD".
   - If duration can be derived from timestamps in the activities (e.g., start/end time fields), include it as: "<start> – <end> (<approx duration>)".
   - If area can be inferred from activity location fields (e.g., all mention 'Sentosa' or 'Marina Bay'), include it.
   - If none of these can be derived, leave the field as an empty string ("").
   - For "perks", extract ONLY actual deals mentioned verbatim in the activity descriptions (e.g. "10% off", "Free drink", "2-for-1"). If no deals exist, set "perks" to an empty string ("").

5. Return a single JSON object in this exact structure:

{
  "title": "<short vivid headline>",
  "summary": {
    "intro": "<1–2 sentence engaging hook>",
    "description": "<2–3 sentence overview of the day>",
    "budget": "<total budget if derivable, else empty string>",
    "duration": "<derived duration if possible, else empty string>",
    "area": "<derived area if possible, else empty string>",
    "perks": "<comma-separated list of real deals found, else empty string>"
  },
  "activities": [/* same list as input, with updated prices */]
}

Style and tone guidelines:
- Title should sound like a travel magazine (e.g. "A Sun-Kissed Escape: One Perfect Day in Sentosa").
- Intro sets the emotional vibe of the day.
- Description should flow from morning → afternoon → evening if possible.
- Use natural, descriptive language with at most 1–2 emojis.
- NEVER fabricate or assume values for budget, duration, area, or perks.
- Do NOT include explanations, reasoning, or code comments — only valid JSON.

Example output:

{
  "title": "A Sun-Kissed Escape: One Perfect Day in Sentosa",
  "summary": {
    "intro": "☀️ Get ready for a sun-filled adventure across Sentosa Island — a day that balances sea breeze, local bites, and island thrills.",
    "description": "From sipping kopi at hidden cafés to soaring above the beach on a zipline, this itinerary blends relaxation and adrenaline.",
    "budget": "$92.50 SGD",
    "duration": "8:00 AM – 9:30 PM (Full-day itinerary)",
    "area": "Sentosa Island + HarbourFront",
    "perks": "10% off dining, Free drink voucher"
  },
  "activities": []
}

Now, analyze the following activities JSON and return ONLY the final itinerary JSON:

${JSON.stringify(selectedActivities, null, 2)}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    console.log(`✅ Enhanced itinerary: "${result.title}"`)

    return result as Itinerary
  } catch (error) {
    console.error('❌ Itinerary enhancement error:', error)
    throw new Error('Failed to enhance itinerary')
  }
}
