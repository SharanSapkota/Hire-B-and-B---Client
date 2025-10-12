"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"

interface BookBikeDialogProps {
  bikeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookBikeDialog({ bikeId, open, onOpenChange }: BookBikeDialogProps) {
  const { bikes, currentUser, createRental } = useStore()
  const { toast } = useToast()
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const bike = bikes.find((b) => b.id === bikeId)

  if (!bike) return null

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return days * bike.price
  }

  const handleBook = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      })
      return
    }

    createRental({
      bikeId: bike.id,
      bikeName: bike.name,
      renterId: currentUser!.id,
      renterName: currentUser!.name,
      ownerId: bike.ownerId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: "active",
      totalPrice: calculateTotal(),
    })

    toast({
      title: "Booking Confirmed!",
      description: `You've successfully booked ${bike.name}`,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Book {bike.name}</DialogTitle>
          <DialogDescription>Select your rental dates to complete the booking</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => !startDate || date <= startDate}
                className="rounded-md border"
              />
            </div>
          </div>

          {startDate && endDate && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per day:</span>
                <span className="font-medium">${bike.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Number of days:</span>
                <span className="font-medium">
                  {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleBook}>Confirm Booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
