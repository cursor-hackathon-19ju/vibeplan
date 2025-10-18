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
      <div className="absolute left-0 sm:left-0 top-0 bottom-0 w-px bg-border ml-1.5 sm:ml-2">
        {!isLast && <div className="absolute inset-0 bg-primary/20" />}
      </div>

      {/* Timeline dot */}
      <div className="absolute left-0 sm:left-0 top-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary border-2 sm:border-4 border-background z-10" />

      {/* Content */}
      <div className="ml-8 sm:ml-12 pb-6 sm:pb-8">
        {/* Time header */}
        <div className="mb-2 sm:mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-primary">
            {activity.time}
          </h3>
          <h4 className="text-lg sm:text-xl font-serif italic mt-1">
            {activity.title}
          </h4>
        </div>

        {/* Description */}
        <div
          className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-3 sm:mb-4"
          dangerouslySetInnerHTML={{ __html: activity.description }}
        />

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="break-words">{activity.location}</span>
          </div>
          {activity.price && (
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{activity.price}</span>
            </div>
          )}
          {activity.discount && (
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {activity.discount}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {activity.tags && activity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
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

