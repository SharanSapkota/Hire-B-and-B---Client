"use client"

import { useEffect, useRef, useState } from "react"

interface Props {
  center?: { lat: number; lng: number }
  marker?: { lat: number; lng: number } | null
  onSelect?: (loc: { lat: number; lng: number; address?: string }) => void
}

export function GoogleMapPicker({ center, marker, onSelect }: Props) {
  const mapEl = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any | null>(null)
  const markerRef = useRef<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key) {
      setError("Missing Google Maps API key")
      setLoading(false)
      return
    }

    let unloaded = false

    let retryId: number | null = null
    const tryInit = () => {
      // If the container isn't mounted yet, retry shortly
      if (!mapEl.current) {
        retryId = window.setTimeout(tryInit, 50)
        return
      }

      // Ensure google maps is available
      if (!(window as any).google || !(window as any).google.maps) return

      // Defensive: if map already initialized, skip
      if (mapRef.current) {
        setLoading(false)
        return
      }

      try {
        // @ts-ignore
        const map = new (window as any).google.maps.Map(mapEl.current as HTMLElement, {
          center: center ?? { lat: 40.7489, lng: -73.968 },
          zoom: 13,
        })
        mapRef.current = map

        if (marker) {
          // @ts-ignore
          markerRef.current = new (window as any).google.maps.Marker({ position: marker, map })
        }

        map.addListener("click", async (e: any) => {
          const lat = e.latLng.lat()
          const lng = e.latLng.lng()
          if (markerRef.current) markerRef.current.setMap(null)
          // @ts-ignore
          markerRef.current = new (window as any).google.maps.Marker({ position: { lat, lng }, map })

          try {
            // @ts-ignore
            const geocoder = new (window as any).google.maps.Geocoder()
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
              if (status === "OK" && results && results[0]) {
                const address = results[0].formatted_address
                onSelect?.({ lat, lng, address })
              } else {
                onSelect?.({ lat, lng })
              }
            })
          } catch {
            onSelect?.({ lat, lng })
          }
        })

        // expose a small helper for locating the user from outside tryInit
        ;(map as any).locateUser = async () => {
          if (!navigator.geolocation) {
            setError("Geolocation is not available in this browser")
            return
          }
          setLocating(true)
          try {
            const pos = await new Promise<GeolocationPosition>((res, rej) =>
              navigator.geolocation.getCurrentPosition(res, rej),
            )
            const lat = pos.coords.latitude
            const lng = pos.coords.longitude
            map.setCenter({ lat, lng })
            map.setZoom(14)
            if (markerRef.current) markerRef.current.setMap(null)
            // @ts-ignore
            markerRef.current = new (window as any).google.maps.Marker({ position: { lat, lng }, map })

            try {
              // @ts-ignore
              const geocoder = new (window as any).google.maps.Geocoder()
              geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                if (status === "OK" && results && results[0]) {
                  const address = results[0].formatted_address
                  onSelect?.({ lat, lng, address })
                } else {
                  onSelect?.({ lat, lng })
                }
                setLocating(false)
              })
            } catch (e) {
              onSelect?.({ lat, lng })
              setLocating(false)
            }
          } catch (e: any) {
            setError(e?.message || "Unable to retrieve your location")
            setLocating(false)
          }
        }

        setLoading(false)
        if (retryId) {
          clearTimeout(retryId)
          retryId = null
        }
      } catch (err) {
        console.error(err)
        setError("Failed to initialize Google Maps")
        setLoading(false)
        if (retryId) {
          clearTimeout(retryId)
          retryId = null
        }
      }
    }

    const scriptId = "google-maps-js"
    if ((window as any).google && (window as any).google.maps) {
      tryInit()
      return
    }

    let script = document.getElementById(scriptId) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement("script")
      script.id = scriptId
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`
      script.async = true
      script.defer = true
      script.onload = () => {
        if (!unloaded) tryInit()
      }
      script.onerror = () => {
        setError("Failed to load Google Maps script")
        setLoading(false)
      }
      document.head.appendChild(script)
    } else {
      // if script exists but google not ready, listen for load
      if ((window as any).google && (window as any).google.maps) tryInit()
      else {
        script.addEventListener("load", () => {
          if (!unloaded) tryInit()
        })
        script.addEventListener("error", () => {
          setError("Failed to load Google Maps script")
          setLoading(false)
        })
      }
    }

    return () => {
      unloaded = true
      // Do not remove the global script — other components may rely on it
    }
  }, [center, marker, onSelect])

  return (
    <div className="relative">
      <div ref={mapEl} className="w-full h-64 rounded-md overflow-hidden" />

      {/* overlay for loading / error */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70">
          <div className="text-sm text-muted-foreground mb-3">Loading Google Maps…</div>
          <button
            type="button"
            className="px-3 py-1 rounded bg-primary text-white text-sm"
            onClick={() => {
              // attempt to initialize locate flow if map ready later
              if (mapRef.current && (mapRef.current as any).locateUser) {
                ;(mapRef.current as any).locateUser()
              } else {
                // otherwise set a small timeout and retry
                setTimeout(() => (mapRef.current as any)?.locateUser?.(), 500)
              }
            }}
          >
            Use my current location
          </button>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
          <div className="p-2 text-sm text-red-500 mb-2">{error}</div>
          <button
            type="button"
            className="px-3 py-1 rounded bg-primary text-white text-sm"
            onClick={() => {
              setError(null)
              if (mapRef.current && (mapRef.current as any).locateUser) (mapRef.current as any).locateUser()
            }}
          >
            Try locating me
          </button>
        </div>
      )}

      {/* locating spinner */}
      {locating && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 p-2 rounded">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-xs text-muted-foreground">Locating…</div>
        </div>
      )}
    </div>
  )
}

export default GoogleMapPicker
