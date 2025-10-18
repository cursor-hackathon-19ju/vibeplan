// ChromaDB query utilities via Python FastAPI bridge

export interface Activity {
  title: string
  description: string
  location: string
  venue_name: string
  price: number | null
  tags: string[]
  duration_hours: number | null
  offer_type: string
  validity_end: string | null
  source_channel: string
  source_type: string
}

const CHROMADB_API_URL = 'http://localhost:8001'

export async function queryActivities(
  semanticQuery: string,
  topK: number = 20
): Promise<Activity[]> {
  try {
    console.log(`🔍 Querying ChromaDB API: "${semanticQuery}" (top ${topK})`)

    // Query the Python FastAPI bridge
    const response = await fetch(`${CHROMADB_API_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: semanticQuery,
        n_results: topK
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`ChromaDB API error: ${error.detail || response.statusText}`)
    }

    const data = await response.json()

    console.log(`✅ Retrieved ${data.count} activities from ChromaDB`)

    return data.activities as Activity[]

  } catch (error) {
    console.error('❌ ChromaDB query error:', error)
    throw new Error('Failed to query activities database')
  }
}
