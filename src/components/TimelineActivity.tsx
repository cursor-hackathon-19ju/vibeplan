import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Tag, ExternalLink } from "lucide-react"

interface TimelineActivity {
  id: number
  time: string
  title: string
  description: string
  location: string
  price?: string
  tags?: string[]
  discount?: string
  source_link?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface TimelineActivityProps {
  activity: TimelineActivity
  isLast?: boolean
}

export function TimelineActivity({ activity, isLast = false }: TimelineActivityProps) {
  return (
    <div className="relative">
      {/* Timeline connector */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-2">
        {!isLast && <div className="absolute inset-0 bg-primary/20" />}
      </div>
      
      {/* Timeline dot */}
      <div className="absolute left-0 top-2 w-5 h-5 rounded-full bg-primary border-4 border-background z-10" />
      
      {/* Content */}
      <div className="ml-12 pb-8">
        {/* Time header */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-primary">
            {activity.time}
          </h3>
          <h4 className="text-xl font-serif italic mt-1">
            {activity.title}
          </h4>
        </div>
        
        {/* Description */}
        <div 
          className="text-muted-foreground leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: activity.description }}
        />
        
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>{activity.location}</span>
          </div>
          {activity.price && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              <span>{activity.price}</span>
            </div>
          )}
          {activity.discount && (
            <Badge variant="secondary" className="text-xs">
              {activity.discount}
            </Badge>
          )}
        </div>
        
        {/* Tags */}
        {activity.tags && activity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {activity.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Source Link */}
        {activity.source_link && (
          <a
            href={activity.source_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View source</span>
          </a>
        )}
      </div>
    </div>
  )
}

