"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, Trash2, Edit, TrendingUp, Calendar } from "lucide-react"
import Image from "next/image"

export function OwnerBikeList() {
  const { currentUser, bikes, deleteBike } = useStore()

  const ownerBikes = bikes.filter((bike) => bike.ownerId === currentUser?.id)

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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (ownerBikes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No bikes added yet. Add your first bike to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {ownerBikes.map((bike) => (
        <Card key={bike.id} className="overflow-hidden">
          <div className="relative h-48 w-full">
            <Image src={bike.images[0] || "/placeholder.svg"} alt={bike.name} fill className="object-cover" />
            <Badge className="absolute top-2 right-2" variant={bike.available ? "default" : "secondary"}>
              {bike.available ? "Available" : "Rented"}
            </Badge>
          </div>

          <CardHeader>
            <CardTitle className="text-lg">{bike.name}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">{bike.description}</p>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-lg">${bike.price}/day</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{bike.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 fill-red-400 text-red-400" />
                  <span>{bike.likes}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant={getConditionVariant(bike.condition)}>{bike.condition}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>{bike.totalRentals} rentals</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Added {formatDate(bike.dateAdded)}</span>
            </div>
          </CardContent>

          <CardFooter className="gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => deleteBike(bike.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
