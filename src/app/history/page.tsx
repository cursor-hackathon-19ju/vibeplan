"use client"

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Search } from "lucide-react"
import { createClient } from "@/lib/supabase"

const budgetLabels = ["Broke Student", "Budget-Friendly", "Moderate", "Comfortable", "Atas Boss"]

interface HistoryItem {
  id: string
  query: string
  created_at: string
  activities: string[]
  budget: number
  num_pax: string
  mbti?: string
  spicy?: number
  itinerary_data: {
    activities: any[]
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffWeeks === 1) return "1 week ago"
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`
  if (diffMonths === 1) return "1 month ago"
  return `${diffMonths} months ago`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          setError('Please log in to view your history')
          setLoading(false)
          return
        }

        // Fetch user's itineraries
        const { data, error: fetchError } = await supabase
          .from('itineraries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) {
          console.error('Error fetching history:', fetchError)
          setError('Failed to load history')
          setLoading(false)
          return
        }

        setHistory(data as HistoryItem[])
        setLoading(false)
      } catch (err) {
        console.error('Error:', err)
        setError('An unexpected error occurred')
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <MobileNav />
          <main className="container max-w-4xl mx-auto p-6 md:p-8">
            <p>Loading history...</p>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <MobileNav />
          <main className="container max-w-4xl mx-auto p-6 md:p-8">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => window.location.href = '/login'} className="mt-4">
              Log In
            </Button>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1">
        <MobileNav />
        
        <main className="container max-w-4xl mx-auto p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-serif italic mb-2">
              Search History
            </h1>
            <p className="text-muted-foreground text-lg">
              Your past searches and activity recommendations
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {history.map((item) => (
              <Link key={item.id} href={`/results?id=${item.id}`}>
                <Card className="hover:border-cyan-400 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium font-sans mb-2">
                        {item.query || "Untitled itinerary"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatTimeAgo(item.created_at)} • {formatDate(item.created_at)}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Filters Used */}
                      <div className="flex flex-wrap gap-2">
                        {item.activities.map((activity) => (
                          <Badge key={activity} variant="secondary">
                            {activity}
                          </Badge>
                        ))}
                        {item.budget !== undefined && (
                          <Badge variant="outline">
                            {budgetLabels[item.budget]}
                          </Badge>
                        )}
                        {item.num_pax && (
                          <Badge variant="outline">
                            {item.num_pax} pax
                          </Badge>
                        )}
                        {item.mbti && (
                          <Badge variant="outline">
                            {item.mbti}
                          </Badge>
                        )}
                      </div>

                      {/* Results Count */}
                      <p className="text-sm text-muted-foreground">
                        Found {item.itinerary_data?.activities?.length || 0} activities
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {history.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Search className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No search history yet</p>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Start planning your weekend activities to see them here
                  </p>
                  <Button asChild>
                    <a href="/">Start Planning</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

