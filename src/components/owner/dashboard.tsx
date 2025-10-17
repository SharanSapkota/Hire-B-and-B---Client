"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bike, DollarSign, Star, TrendingUp } from "lucide-react"

export function OwnerDashboard() {
  const { currentUser, bikes, rentals } = useStore()

  const ownerBikes = bikes.filter((bike) => bike.ownerId === currentUser?.id)
  const ownerRentals = rentals.filter((rental) => rental.ownerId === currentUser?.id)

  const totalRevenue = ownerRentals.reduce((sum, rental) => sum + rental.totalPrice, 0)
  const avgRating =
    ownerBikes.length > 0 ? ownerBikes.reduce((sum, bike) => sum + bike.rating, 0) / ownerBikes.length : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Bikes</CardTitle>
          <Bike className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ownerBikes.length}</div>
          <p className="text-xs text-muted-foreground">{ownerBikes.filter((b) => b.available).length} available</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ownerRentals.length}</div>
          <p className="text-xs text-muted-foreground">
            {ownerRentals.filter((r) => r.status === "active").length} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue}</div>
          <p className="text-xs text-muted-foreground">All time earnings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">Across all bikes</p>
        </CardContent>
      </Card>
    </div>
  )
}
