"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign } from "lucide-react"

export function RentalHistory() {
  const { currentUser, rentals } = useStore()

  const userRentals = rentals.filter((rental) => rental.renterId === currentUser?.id)

  if (userRentals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No rental history yet. Book your first bike!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {userRentals.map((rental) => (
        <Card key={rental.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{rental.bikeName}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Rental ID: {rental.id}</p>
              </div>
              <Badge
                variant={
                  rental.status === "active" ? "default" : rental.status === "completed" ? "secondary" : "destructive"
                }
              >
                {rental.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium">{new Date(rental.startDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="text-sm font-medium">{new Date(rental.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Price</p>
                  <p className="text-sm font-medium">${rental.totalPrice}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
