import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Search } from "lucide-react"

// Mock history data - in production, this would come from a database
const mockHistory = [
  {
    id: 1,
    query: "Plan a date under $50 with food, something artsy, and outdoors.",
    timestamp: "2 days ago",
    date: "Oct 16, 2025",
    filters: {
      activities: ["Food", "Artsy", "Outdoor"],
      budget: 1,
      numPax: "2",
    },
    resultsCount: 6,
  },
  {
    id: 2,
    query: "Family weekend activities",
    timestamp: "1 week ago",
    date: "Oct 11, 2025",
    filters: {
      activities: ["Outdoor", "Museums"],
      budget: 2,
      numPax: "4",
    },
    resultsCount: 8,
  },
  {
    id: 3,
    query: "Artsy cafes and museums",
    timestamp: "2 weeks ago",
    date: "Oct 4, 2025",
    filters: {
      activities: ["Artsy", "Museums", "Food"],
      budget: 2,
      numPax: "2",
      mbti: "INFP",
    },
    resultsCount: 5,
  },
  {
    id: 4,
    query: "Chill activities for introverts under $30",
    timestamp: "3 weeks ago",
    date: "Sep 27, 2025",
    filters: {
      activities: ["Museums", "Artsy"],
      budget: 1,
      numPax: "1",
      mbti: "INTJ",
    },
    resultsCount: 7,
  },
  {
    id: 5,
    query: "Weekend brunch spots with good vibes for 4 people",
    timestamp: "1 month ago",
    date: "Sep 18, 2025",
    filters: {
      activities: ["Food"],
      budget: 2,
      numPax: "4",
    },
    resultsCount: 10,
  },
]

const budgetLabels = ["Broke Student", "Budget-Friendly", "Moderate", "Comfortable", "Atas Boss"]

export default function HistoryPage() {
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

          <div className="space-y-4">
            {mockHistory.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-serif italic mb-2">
                        {item.query}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {item.timestamp} • {item.date}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Filters Used */}
                    <div className="flex flex-wrap gap-2">
                      {item.filters.activities.map((activity) => (
                        <Badge key={activity} variant="secondary">
                          {activity}
                        </Badge>
                      ))}
                      {item.filters.budget !== undefined && (
                        <Badge variant="outline">
                          {budgetLabels[item.filters.budget]}
                        </Badge>
                      )}
                      {item.filters.numPax && (
                        <Badge variant="outline">
                          {item.filters.numPax} pax
                        </Badge>
                      )}
                      {item.filters.mbti && (
                        <Badge variant="outline">
                          {item.filters.mbti}
                        </Badge>
                      )}
                    </div>

                    {/* Results Count */}
                    <p className="text-sm text-muted-foreground">
                      Found {item.resultsCount} activities
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {mockHistory.length === 0 && (
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

