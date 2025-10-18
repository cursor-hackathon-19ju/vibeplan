"use client"

export const dynamic = 'force-dynamic'

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"
import { ActivityCard } from "@/components/ActivityCard"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"

interface Activity {
  id: number
  name: string
  description: string
  category: string
  price: string
  duration: string
  location: string
  pax?: string
  tags: string[]
  imageUrl?: string
}

interface ResultsData {
  activities: Activity[]
  query: string
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [results, setResults] = useState<ResultsData | null>(null)

  useEffect(() => {
    // Handle case where searchParams might be null during build
    if (!searchParams) {
      router.push('/')
      return
    }
    
    const resultsData = searchParams.get('results')
    if (resultsData) {
      try {
        setResults(JSON.parse(resultsData))
      } catch (error) {
        console.error('Error parsing results:', error)
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }, [searchParams, router])

  if (!results) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1">
        <MobileNav />
        
        <main className="container max-w-6xl mx-auto p-6 md:p-8">
          {/* Header */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl md:text-4xl font-serif italic">
                  Your Perfect Activities
                </h1>
                <p className="text-muted-foreground mt-1">
                  Based on: <span className="font-medium">{results.query}</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => router.push('/')} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refine Search
              </Button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>

          {/* Empty State */}
          {results.activities.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No activities found. Try adjusting your search criteria.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}
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

