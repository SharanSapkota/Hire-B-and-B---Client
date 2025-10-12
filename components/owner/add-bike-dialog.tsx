"use client"

import type React from "react"

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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

export function AddBikeDialog() {
  const { currentUser, addBike } = useStore()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Mountain",
    condition: "Excellent" as "Excellent" | "Good" | "Fair" | "Needs Maintenance",
    address: "",
    imageQuery: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addBike({
      ownerId: currentUser!.id,
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      category: formData.category,
      condition: formData.condition,
      images: [
        `/placeholder.svg?height=400&width=600&query=${formData.imageQuery || formData.name}`,
        `/placeholder.svg?height=400&width=600&query=${formData.imageQuery || formData.name} side view`,
      ],
      location: {
        lat: 40.7128 + Math.random() * 0.1,
        lng: -74.006 + Math.random() * 0.1,
        address: formData.address,
      },
      available: true,
    })

    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Mountain",
      condition: "Excellent",
      address: "",
      imageQuery: "",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Bike
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Bike</DialogTitle>
          <DialogDescription>Fill in the details to add a new bike to your inventory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Bike Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mountain Explorer Pro"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="High-performance mountain bike perfect for trails"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price per Day ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="25"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mountain">Mountain</SelectItem>
                    <SelectItem value="Road">Road</SelectItem>
                    <SelectItem value="City">City</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value: any) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Needs Maintenance">Needs Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Location Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Bike Lane, New York, NY"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imageQuery">Image Description (optional)</Label>
              <Input
                id="imageQuery"
                value={formData.imageQuery}
                onChange={(e) => setFormData({ ...formData, imageQuery: e.target.value })}
                placeholder="red mountain bike"
              />
              <p className="text-xs text-muted-foreground">Describe the bike appearance for placeholder images</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Bike</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
