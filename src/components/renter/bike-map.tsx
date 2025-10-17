"use client"

import type { Bike } from "@/lib/types"
import { MapPin } from "lucide-react"

interface BikeMapProps {
  bike: Bike
}

export function BikeMap({ bike }: BikeMapProps) {
  return (
    <div className="relative h-64 rounded-lg border bg-muted flex items-center justify-center">
      <div className="text-center space-y-2">
        <MapPin className="h-12 w-12 mx-auto text-primary" />
        <div>
          <p className="font-medium">{bike.name}</p>
          <p className="text-sm text-muted-foreground">{bike.location.address}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Lat: {bike.location.lat.toFixed(4)}, Lng: {bike.location.lng.toFixed(4)}
          </p>
        </div>
        <p className="text-xs text-muted-foreground italic">
          Map integration placeholder - In production, integrate with Google Maps or Mapbox
        </p>
      </div>
    </div>
  )
}
