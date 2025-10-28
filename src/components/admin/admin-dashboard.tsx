"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Bike, TrendingUp, Calendar, Star } from "lucide-react"

export function AdminDashboard() {
  const { users, bikes, rentals, reviews } = useStore()

  const totalRevenue = rentals.reduce((sum, rental) => sum + rental.totalPrice, 0)
  const activeRentals = rentals.filter((r) => r.status === "active").length
  const completedRentals = rentals.filter((r) => r.status === "completed").length
  const totalUsers = users.length
  const totalOwners = users.filter((u) => u.role === "owner").length
  const totalRenters = users.filter((u) => u.role === "renter").length
  const totalBikes = bikes.length
  const availableBikes = bikes.filter((b) => b.available).length
  const avgRating = bikes.reduce((sum, b) => sum + b.rating, 0) / bikes.length || 0

  const recentRentals = rentals.slice(-5).reverse()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{completedRentals} completed rentals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {totalOwners} owners, {totalRenters} renters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bikes</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBikes}</div>
            <p className="text-xs text-muted-foreground">{availableBikes} available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRentals}</div>
            <p className="text-xs text-muted-foreground">Currently rented bikes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
            <CardDescription>Overview of platform performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Average Rating</span>
              </div>
              <span className="font-bold">{avgRating.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm">Total Rentals</span>
              </div>
              <span className="font-bold">{rentals.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm">Avg Rental Price</span>
              </div>
              <span className="font-bold">${(totalRevenue / rentals.length || 0).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Rentals</CardTitle>
            <CardDescription>Latest rental activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRentals.map((rental) => (
                <div key={rental.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{rental.bikeName}</p>
                    <p className="text-xs text-muted-foreground">{rental.renterName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${rental.totalPrice}</p>
                    <p className="text-xs text-muted-foreground capitalize">{rental.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
