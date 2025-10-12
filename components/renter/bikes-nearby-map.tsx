"use client"

import { useState, useEffect, useRef } from "react"
import { useStore } from "@/lib/store"
import type { Bike } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, DollarSign, Star, Navigation } from "lucide-react"
import { BikeDetailsDialog } from "./bike-details-dialog"

export function BikesNearbyMap() {
  const { bikes } = useStore()
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  const availableBikes = bikes.filter((bike) => bike.available)

  console.log("[v0] Available bikes:", availableBikes.length)

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          console.log("[v0] User location from GPS:", location)
          setUserLocation(location)
        },
        (error) => {
          console.log("[v0] Geolocation error, using default NYC location:", error)
          const defaultLocation = {
            lat: 40.7489,
            lng: -73.968,
          }
          setUserLocation(defaultLocation)
        },
      )
    } else {
      console.log("[v0] Geolocation not supported, using default NYC location")
      setUserLocation({
        lat: 40.7489,
        lng: -73.968,
      })
    }
  }, [])

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    console.log("[v0] Initializing Leaflet map...")

    // Add Leaflet CSS first
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link")
      link.id = "leaflet-css"
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      link.onload = () => {
        console.log("[v0] Leaflet CSS loaded")
      }
      document.head.appendChild(link)
    }

    // Wait a bit for CSS to load, then initialize map
    setTimeout(() => {
      import("leaflet").then((L) => {
        console.log("[v0] Leaflet library loaded")

        // Initialize map centered on New York
        const map = L.map(mapRef.current!).setView([40.7489, -73.968], 13)

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        console.log("[v0] Map tiles added")

        mapInstanceRef.current = map
        setMapReady(true)

        // Fix for marker icons not showing
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        })

        console.log("[v0] Map initialization complete")
      })
    }, 100)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        setMapReady(false)
      }
    }
  }, [])

  // Add user location marker
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !userLocation) return

    console.log("[v0] Adding user location marker at:", userLocation)

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current

      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div style="position: relative;">
            <div style="position: absolute; inset: 0; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;">
              <div style="height: 40px; width: 40px; border-radius: 50%; background-color: rgb(239, 68, 68); opacity: 0.5;"></div>
            </div>
            <div style="position: relative; height: 40px; width: 40px; border-radius: 50%; background-color: rgb(220, 38, 38); border: 3px solid white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>You are here</b>")

      console.log("[v0] User marker added")

      // Center map on user location
      map.setView([userLocation.lat, userLocation.lng], 13)

      return () => {
        userMarker.remove()
      }
    })
  }, [mapReady, userLocation])

  // Add bike markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || availableBikes.length === 0) {
      console.log("[v0] Not ready to add bike markers:", {
        mapReady,
        hasMap: !!mapInstanceRef.current,
        bikesCount: availableBikes.length,
      })
      return
    }

    console.log("[v0] Adding bike markers for", availableBikes.length, "bikes")

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Add bike markers
      availableBikes.forEach((bike, index) => {
        console.log(`[v0] Adding marker ${index + 1}:`, bike.name, "at", bike.location)

        const isSelected = selectedBike?.id === bike.id

        // Create custom bike icon
        const bikeIcon = L.divIcon({
          className: "custom-bike-marker",
          html: `
            <div style="position: relative; transform: scale(${isSelected ? 1.25 : 1}); transition: transform 0.2s;">
              <div style="position: relative; height: 40px; width: 40px; border-radius: 50%; background-color: ${
                isSelected ? "rgb(14, 165, 233)" : "rgb(20, 184, 166)"
              }; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center; border: 2px solid white;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18.5" cy="17.5" r="3.5"/>
                  <circle cx="5.5" cy="17.5" r="3.5"/>
                  <circle cx="15" cy="5" r="1"/>
                  <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                </svg>
              </div>
              <div style="position: absolute; bottom: -4px; right: -4px; background-color: white; border: 1px solid #e5e7eb; border-radius: 9999px; padding: 2px 6px; font-size: 10px; font-weight: bold; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                $${bike.price}
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })

        const marker = L.marker([bike.location.lat, bike.location.lng], { icon: bikeIcon })
          .addTo(map)
          .bindPopup(
            `
            <div style="min-width: 200px;">
              <h3 style="font-weight: 600; margin-bottom: 8px;">${bike.name}</h3>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; color: #6b7280;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="color: #fbbf24;">★</span>
                  <span>${bike.rating}</span>
                </div>
                <span>•</span>
                <span>$${bike.price}/day</span>
              </div>
              <div style="margin-bottom: 8px;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; background-color: ${getConditionColor(
                  bike.condition,
                )}; color: white;">
                  ${bike.condition}
                </span>
              </div>
              <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${bike.location.address}</p>
              <button 
                onclick="window.selectBike('${bike.id}')" 
                style="width: 100%; padding: 8px; background-color: rgb(14, 165, 233); color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;"
              >
                View Details
              </button>
            </div>
          `,
          )
          .on("click", () => {
            console.log("[v0] Bike marker clicked:", bike.name)
            setSelectedBike(bike)
            setDetailsOpen(true)
          })

        markersRef.current.push(marker)
      })

      console.log("[v0] All bike markers added:", markersRef.current.length)

      // Fit map to show all markers
      if (availableBikes.length > 0) {
        const bounds = L.latLngBounds(availableBikes.map((bike) => [bike.location.lat, bike.location.lng]))
        if (userLocation) {
          bounds.extend([userLocation.lat, userLocation.lng])
        }
        map.fitBounds(bounds, { padding: [50, 50] })
        console.log("[v0] Map bounds adjusted to show all markers")
      }
    })
  }, [mapReady, availableBikes, selectedBike, userLocation])

  // Global function to select bike from popup
  useEffect(() => {
    ;(window as any).selectBike = (bikeId: string) => {
      const bike = availableBikes.find((b) => b.id === bikeId)
      if (bike) {
        setSelectedBike(bike)
        setDetailsOpen(true)
      }
    }

    return () => {
      delete (window as any).selectBike
    }
  }, [availableBikes])

  const handleMarkerClick = (bike: Bike) => {
    setSelectedBike(bike)
    setDetailsOpen(true)
  }

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

      <style jsx global>{`
        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
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
