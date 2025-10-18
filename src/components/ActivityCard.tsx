import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, DollarSign, Users } from "lucide-react"

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

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {activity.imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={activity.imageUrl}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl font-serif italic">{activity.name}</CardTitle>
          <Badge>{activity.category}</Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {activity.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{activity.price}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{activity.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{activity.location}</span>
          </div>
          {activity.pax && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{activity.pax}</span>
            </div>
          )}
        </div>
        
        {activity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {activity.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

