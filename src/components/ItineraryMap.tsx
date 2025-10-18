"use client"

import { useEffect, useMemo, useState } from 'react'
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps'

interface Activity {
  id: number
  title: string
  location: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface ItineraryMapProps {
  activities: Activity[]
  apiKey: string
}

function MapContent({ activities }: { activities: Activity[] }) {
  const map = useMap()
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  // Calculate center and bounds based on activities
  const { center, bounds } = useMemo(() => {
    const validActivities = activities.filter(a => a.coordinates)
    
    if (validActivities.length === 0) {
      return {
        center: { lat: 1.2494, lng: 103.8182 }, // Default to Sentosa
        bounds: null
      }
    }

    const lats = validActivities.map(a => a.coordinates!.lat)
    const lngs = validActivities.map(a => a.coordinates!.lng)
    
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    
    return {
      center: {
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2
      },
      bounds: {
        north: maxLat,
        south: minLat,
        east: maxLng,
        west: minLng
      }
    }
  }, [activities])

  // Fit map to bounds when map is loaded
  useEffect(() => {
    if (!map || !bounds) return

    const googleBounds = new google.maps.LatLngBounds(
      { lat: bounds.south, lng: bounds.west },
      { lat: bounds.north, lng: bounds.east }
    )
    
    map.fitBounds(googleBounds, { top: 50, right: 50, bottom: 50, left: 50 })
  }, [map, bounds])

  return (
    <>
      {activities.map((activity) => {
        if (!activity.coordinates) return null

        return (
          <AdvancedMarker
            key={activity.id}
            position={activity.coordinates}
            onClick={() => setSelectedActivity(activity)}
          />
        )
      })}

      {selectedActivity && selectedActivity.coordinates && (
        <InfoWindow
          position={selectedActivity.coordinates}
          onCloseClick={() => setSelectedActivity(null)}
        >
          <div className="p-2">
            <h3 className="font-semibold text-sm">{selectedActivity.title}</h3>
            <p className="text-xs text-gray-600 mt-1">{selectedActivity.location}</p>
          </div>
        </InfoWindow>
      )}
    </>
  )
}

export function ItineraryMap({ activities, apiKey }: ItineraryMapProps) {
  // Calculate initial center
  const center = useMemo(() => {
    const validActivities = activities.filter(a => a.coordinates)
    
    if (validActivities.length === 0) {
      return { lat: 1.2494, lng: 103.8182 }
    }

    const lats = validActivities.map(a => a.coordinates!.lat)
    const lngs = validActivities.map(a => a.coordinates!.lng)
    
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
    }
  }, [activities])

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-sm text-muted-foreground">Map API key not configured</p>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={13}
        gestureHandling="greedy"
        disableDefaultUI={true}
        mapId="DEMO_MAP_ID"
        className="w-full h-full"
        rotateControl={false}
      >
        <MapContent activities={activities} />
      </Map>
    </APIProvider>
  )
}

