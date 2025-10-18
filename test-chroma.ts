// Test ChromaDB access from TypeScript
import { ChromaClient } from 'chromadb'
import { readFileSync } from 'fs'
import OpenAI from 'openai'

// Load .env.local
const envFile = readFileSync('.env.local', 'utf-8')
const envVars = envFile.split('\n').reduce((acc, line) => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    acc[key.trim()] = valueParts.join('=').trim()
  }
  return acc
}, {} as Record<string, string>)

async function testChromaAccess() {
  try {
    console.log('🔍 Testing ChromaDB access...\n')

    // Step 1: Connect to ChromaDB server
    const chromaClient = new ChromaClient({
      path: 'http://localhost:8000'
    })
    console.log('✅ Connected to ChromaDB server at http://localhost:8000')

    // Step 2: List collections
    const collections = await chromaClient.listCollections()
    console.log(`✅ Found ${collections.length} collection(s):`, collections.map(c => c.name))

    // Step 3: Create OpenAI client for embeddings
    const apiKey = envVars.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in .env.local')
    }

    const openai = new OpenAI({ apiKey })
    console.log('✅ Created OpenAI client')

    // Step 4: Get the telegram_activities collection
    const collection = await chromaClient.getCollection({
      name: 'telegram_activities'
    })
    console.log(`✅ Accessed collection: ${collection.name}`)

    // Step 5: Count documents
    const count = await collection.count()
    console.log(`✅ Collection has ${count} activities`)

    // Step 6: Test query with semantic search using OpenAI embeddings
    console.log('\n🔍 Testing semantic query: "romantic dinner date"...')

    // Generate embedding for the query
    const queryText = 'romantic dinner date'
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: queryText
    })
    const queryEmbedding = embeddingResponse.data[0].embedding
    console.log(`✅ Generated embedding (${queryEmbedding.length} dimensions)`)

    // Query ChromaDB with the embedding
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 3
    })

    console.log(`✅ Query returned ${results.ids[0].length} results\n`)

    // Step 6: Display sample result
    if (results.ids[0].length > 0) {
      console.log('📋 Sample result:')
      console.log('ID:', results.ids[0][0])

      if (results.metadatas && results.metadatas[0] && results.metadatas[0][0]) {
        const metadata = results.metadatas[0][0]
        console.log('Title:', metadata.title)
        console.log('Location:', metadata.location)
        console.log('Tags:', metadata.tags)

        if (metadata.full_data) {
          const fullData = JSON.parse(metadata.full_data as string)
          console.log('\n📄 Full data structure:')
          console.log('  - title:', fullData.title)
          console.log('  - description:', fullData.description?.substring(0, 100) + '...')
          console.log('  - venue_name:', fullData.venue_name)
          console.log('  - price:', fullData.price)
          console.log('  - tags:', fullData.tags)
        }
      }

      if (results.distances && results.distances[0]) {
        console.log('\nDistance:', results.distances[0][0])
      }
    }

    console.log('\n✅ All tests passed! ChromaDB is accessible from TypeScript.')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

testChromaAccess()
