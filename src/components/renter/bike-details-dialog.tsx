"use client"

import { useStore } from "@/lib/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Heart, MapPin, Calendar, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { BikeMap } from "./bike-map"

interface BikeDetailsDialogProps {
  bikeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BikeDetailsDialog({ bikeId, open, onOpenChange }: BikeDetailsDialogProps) {
  const { bikes, reviews } = useStore()

  const bike = bikes.find((b) => b.id === bikeId)
  const bikeReviews = reviews.filter((r) => r.bikeId === bikeId)

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  if (!bike) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{bike.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {bike.images.map((image, idx) => (
              <div key={idx} className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${bike.name} ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-lg">{bike.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({bikeReviews.length} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-5 w-5 fill-red-400 text-red-400" />
                <span className="font-semibold">{bike.likes}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{bike.category}</Badge>
              <span className="text-2xl font-bold">${bike.price}/day</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-muted-foreground">{bike.available ? "Available" : "Rented"}</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div>
              <p className="text-sm font-medium">Condition</p>
              <Badge variant={getConditionVariant(bike.condition)} className="mt-1">
                {bike.condition}
              </Badge>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div>
              <p className="text-sm font-medium">Added</p>
              <p className="text-sm text-muted-foreground">{formatDate(bike.dateAdded)}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{bike.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <p className="text-muted-foreground mb-3">{bike.location.address}</p>
            <BikeMap bike={bike} />
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Rental History
            </h3>
            <p className="text-muted-foreground">{bike.totalRentals} total rentals</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Reviews</h3>
            {bikeReviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {bikeReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{review.userName}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
