"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, MapPin } from "lucide-react"
import Image from "next/image"
import { BookBikeDialog } from "./book-bike-dialog"
import { BikeDetailsDialog } from "./bike-details-dialog"

export function BikeBrowser() {
  const { bikes, likeBike } = useStore()
  const [selectedBike, setSelectedBike] = useState<string | null>(null)
  const [detailsBike, setDetailsBike] = useState<string | null>(null)

  const availableBikes = bikes.filter((bike) => bike.available)

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

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableBikes.map((bike) => (
          <Card key={bike.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full cursor-pointer" onClick={() => setDetailsBike(bike.id)}>
              <Image src={bike.images[0] || "/placeholder.svg"} alt={bike.name} fill className="object-cover" />
              <Badge className="absolute top-2 right-2" variant="default">
                ${bike.price}/day
              </Badge>
              <Badge className="absolute top-2 left-2" variant={getConditionVariant(bike.condition)}>
                {bike.condition}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{bike.name}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">{bike.description}</p>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{bike.rating.toFixed(1)}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-auto p-0" onClick={() => likeBike(bike.id)}>
                    <Heart className="h-4 w-4 fill-red-400 text-red-400 mr-1" />
                    <span>{bike.likes}</span>
                  </Button>
                </div>
                <Badge variant="secondary">{bike.category}</Badge>
              </div>

              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{bike.location.address}</span>
              </div>
            </CardContent>

            <CardFooter className="gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setDetailsBike(bike.id)}>
                View Details
              </Button>
              <Button className="flex-1" onClick={() => setSelectedBike(bike.id)}>
                Book Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedBike && (
        <BookBikeDialog
          bikeId={selectedBike}
          open={!!selectedBike}
          onOpenChange={(open) => !open && setSelectedBike(null)}
        />
      )}

      {detailsBike && (
        <BikeDetailsDialog
          bikeId={detailsBike}
          open={!!detailsBike}
          onOpenChange={(open) => !open && setDetailsBike(null)}
        />
      )}
    </>
  )
}
