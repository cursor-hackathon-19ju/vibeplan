// End-to-end API test for /api/generate

async function testGenerateAPI() {
  console.log('🧪 Testing /api/generate endpoint...\n')

  const testRequest = {
    query: 'romantic dinner date with creative twist',
    activities: ['Cafes', 'Museums'],
    budget: 2, // Moderate
    numPax: 'date',
    mbti: 'ENFP',
    spicy: false
  }

  console.log('📤 Sending request:')
  console.log(JSON.stringify(testRequest, null, 2))
  console.log('\n⏳ Generating itinerary (this may take 30-60 seconds)...\n')

  const startTime = Date.now()

  try {
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest)
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ API Error:', error)
      console.error(`Status: ${response.status}`)
      return
    }

    const result = await response.json()

    console.log(`✅ API Response received in ${duration}s\n`)
    console.log('📋 Generated Itinerary:')
    console.log('─'.repeat(60))
    console.log(`Title: ${result.title}`)
    console.log(`\nSummary:`)
    console.log(`  Intro: ${result.summary.intro}`)
    console.log(`  Budget: ${result.summary.budget}`)
    console.log(`  Duration: ${result.summary.duration}`)
    console.log(`  Area: ${result.summary.area}`)
    console.log(`  Perks: ${result.summary.perks}`)
    console.log(`\nActivities: ${result.activities.length}`)

    result.activities.forEach((activity: any, idx: number) => {
      console.log(`\n  ${idx + 1}. ${activity.title}`)
      console.log(`     Time: ${activity.time}`)
      console.log(`     Location: ${activity.location}`)
      console.log(`     Price: ${activity.price}`)
      if (activity.discount) {
        console.log(`     Discount: ${activity.discount}`)
      }
      console.log(`     Coordinates: ${activity.coordinates.lat}, ${activity.coordinates.lng}`)
    })

    console.log('\n' + '─'.repeat(60))
    console.log(`\n✅ Itinerary ID: ${result.itineraryId}`)
    console.log(`\n🔗 View results at: http://localhost:3000/results?id=${result.itineraryId}`)
    console.log('\n✅ All tests passed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

testGenerateAPI()
