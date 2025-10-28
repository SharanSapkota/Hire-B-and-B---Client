"use client"

import { useState, useEffect, useRef } from "react"
import { useStore } from "@/lib/store"
import type { Bike } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, DollarSign, Star, Navigation } from "lucide-react"
import { BikeDetailsDialog } from "./bike-details-dialog"
import { getCurrentLocation } from "../maps/getCurrentLocation"

interface GoogleMapsInstance {
  map: any
  markers: any[]
  userMarker: any | null
}

export function BikesNearbyMap() {
  const { bikes } = useStore()
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<GoogleMapsInstance | null>(null)

  const availableBikes = bikes.filter((bike) => bike.available)

  console.log("[v0] Available bikes:", availableBikes.length)

  // Get user location
  useEffect(() => {
    const currentLocation = getCurrentLocation();
    setUserLocation(currentLocation)
  }, [])

  // Load Google Maps
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key || !mapRef.current) return

    console.log("[Google Maps] Checking existing script...")

    const scriptId = "google-maps-js"
    let script = document.getElementById(scriptId) as HTMLScriptElement | null

    if (!script) {
      script = document.createElement("script")
      script.id = scriptId
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,geometry`
      script.async = true
      script.defer = true

      // Initialize map only after both script + userLocation are ready
      script.onload = () => {
        if (userLocation) {
          loadGoogleMaps()
        } else {
          console.warn("[Google Maps] Script loaded, waiting for user location...")
        }
      }

      document.head.appendChild(script)
    } else if ((window as any).google?.maps && userLocation) {
      loadGoogleMaps()
    }
  }, [userLocation])

  // Initialize Google Map
  const loadGoogleMaps = () => {
    if (!(window as any).google || !(window as any).google.maps) {
      console.warn("[Google Maps] Not ready yet")
      return false
    }

    try {
      const g = (window as any).google.maps

      if (!mapRef.current) return false

      const map = new g.Map(mapRef.current, {
        center: userLocation || { lat: 40.7489, lng: -73.968 },
        zoom: 15,
      })

      mapInstanceRef.current = { map, markers: [], userMarker: null }
      setMapReady(true)

      console.log("[Google Maps] Initialized successfully")
      return true
    } catch (err) {
      console.error("[Google Maps] Initialization error:", err)
      return false
    }
  }

  // Add user location marker
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !userLocation) return

    console.log("[Google Maps] Adding user location marker at:", userLocation)

    const { map } = mapInstanceRef.current
    const g = (window as any).google.maps

    if (mapInstanceRef.current.userMarker) {
      mapInstanceRef.current.userMarker.setMap(null)
    }

    const userIcon = {
      path: g.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#ef4444",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 3,
    }

    const userMarker = new g.Marker({
      position: userLocation,
      map,
      icon: userIcon,
      title: "You are here",
      animation: g.Animation.DROP,
    })

    mapInstanceRef.current.userMarker = userMarker

    map.setCenter(userLocation)
    map.setZoom(13)

    console.log("[Google Maps] User marker added")
  }, [mapReady, userLocation])

  // Add bike markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || availableBikes.length === 0) return

    console.log("[Google Maps] Adding bike markers for", availableBikes.length, "bikes")

    const { map } = mapInstanceRef.current
    const g = (window as any).google.maps

    mapInstanceRef.current.markers.forEach((marker: any) => marker.setMap(null))
    mapInstanceRef.current.markers = []

    let currentInfoWindow: any = null

    availableBikes.forEach((bike) => {
      const isSelected = selectedBike?.id === bike.id

      const bikeIcon = {
        path: g.SymbolPath.CIRCLE,
        fillColor: isSelected ? "#0ea5e9" : "#14b8a6",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
        scale: 6,
      }

      const marker = new g.Marker({
        position: { lat: bike.location.lat, lng: bike.location.lng },
        map,
        icon: bikeIcon,
        title: bike.name,
        animation: g.Animation.DROP,
      })

      const infoContent = `
        <div style="min-width: 280px; max-width: 320px; padding: 12px; font-family: system-ui, sans-serif;">
          ${
            bike.images && bike.images[0]
              ? `<img src="${bike.images[0]}" alt="${bike.name}" style="width: 100%; height: 120px; border-radius: 8px; object-fit: cover;" />`
              : `<div style="display: flex; align-items: center; justify-content: center; height: 120px; background: #ddd;">🚴</div>`
          }
          <h3 style="font-weight: 700; font-size: 18px; margin: 8px 0;">${bike.name}</h3>
          <p style="font-size: 13px; color: #555;">${bike.description}</p>
          <p style="font-size: 13px; color: #333;"><b>Price:</b> $${bike.price}/day</p>
          <p style="font-size: 12px; color: #777;">Lat: ${bike.location.lat.toFixed(4)}, Lng: ${bike.location.lng.toFixed(4)}</p>
        </div>
      `

      const infoWindow = new g.InfoWindow({ content: infoContent, maxWidth: 340 })

      marker.addListener("click", () => {
        if (currentInfoWindow) currentInfoWindow.close()
        currentInfoWindow = infoWindow
        infoWindow.open(map, marker)
        setSelectedBike(bike)
        setDetailsOpen(true)
      })

      mapInstanceRef.current?.markers.push(marker)
    })

    if (map && availableBikes.length > 0) {
      const bounds = new g.LatLngBounds()
      availableBikes.forEach((bike) => bounds.extend(bike.location))
      if (userLocation) bounds.extend(userLocation)
      map.fitBounds(bounds, { padding: { top: 60, right: 60, bottom: 60, left: 60 } })
    }

    return () => {
      mapInstanceRef.current?.markers.forEach((m: any) => m.setMap(null))
    }
  }, [mapReady, availableBikes, selectedBike, userLocation])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              <CardTitle>Bikes Near You</CardTitle>
            </div>
            <Badge variant="secondary">{availableBikes.length} available</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={mapRef} className="w-full h-[500px] rounded-lg border overflow-hidden z-0" />

          {/* Selected bike info */}
          {selectedBike && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold text-lg">{selectedBike.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedBike.description}</p>
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedBike.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${selectedBike.price}/day</span>
                    </div>
                    <Badge variant="secondary">{selectedBike.category}</Badge>
                    <Badge variant={getConditionVariant(selectedBike.condition)}>{selectedBike.condition}</Badge>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{selectedBike.location.address}</span>
                  </div>
                </div>
                <Button onClick={() => setDetailsOpen(true)} className="w-full sm:w-auto">
                  View Details
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bike list view */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availableBikes.map((bike) => (
          <Card
            key={bike.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedBike?.id === bike.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedBike(bike)}
          >
            <CardContent className="p-4">
              <div className="aspect-video relative rounded-lg overflow-hidden mb-3">
                <img
                  src={bike.images[0] || "/placeholder.svg?height=200&width=300&query=bicycle"}
                  alt={bike.name}
                  className="object-cover w-full h-full"
                />
                <Badge className="absolute top-2 left-2" variant={getConditionVariant(bike.condition)}>
                  {bike.condition}
                </Badge>
              </div>
              <h3 className="font-semibold truncate">{bike.name}</h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{bike.rating}</span>
                </div>
                <span>•</span>
                <span>${bike.price}/day</span>
              </div>
              <div className="flex items-start gap-1 mt-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span className="truncate">{bike.location.address}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedBike && <BikeDetailsDialog bikeId={selectedBike.id} open={detailsOpen} onOpenChange={setDetailsOpen} />}
    </div>
  )
}

const getConditionVariant = (condition: string) => {
  switch (condition) {
    case "Excellent":
      return "default"
    case "Good":
      return "secondary"
    case "Fair":
      return "outline"
    case "Needs Maintenance":
      return "destructive"
    default:
      return "secondary"
  }
}

const getConditionColor = (condition: string) => {
  switch (condition) {
    case "Excellent":
      return "#0ea5e9"
    case "Good":
      return "#6b7280"
    case "Fair":
      return "#f59e0b"
    case "Needs Maintenance":
      return "#ef4444"
    default:
      return "#6b7280"
  }
}
