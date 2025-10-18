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
import { Plus, X, Upload, LinkIcon } from "lucide-react"

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
  })
  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState("")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    e.target.value = ""
  }

  const handleAddImageUrl = () => {
    if (imageUrl.trim()) {
      setImages((prev) => [...prev, imageUrl.trim()])
      setImageUrl("")
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const bikeImages =
      images.length > 0
        ? images
        : [
            `/placeholder.svg?height=400&width=600&query=${formData.name}`,
            `/placeholder.svg?height=400&width=600&query=${formData.name} side view`,
          ]

    addBike({
      ownerId: currentUser!.id,
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      category: formData.category,
      condition: formData.condition,
      images: bikeImages,
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
    })
    setImages([])
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

            <div className="grid gap-3 border rounded-lg p-4 bg-muted/30">
              <Label>Bike Images</Label>

              {/* File upload */}
              <div className="grid gap-2">
                <Label htmlFor="file-upload" className="text-sm font-normal">
                  Upload from device
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* URL input */}
              <div className="grid gap-2">
                <Label htmlFor="image-url" className="text-sm font-normal">
                  Or add image URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/bike-image.jpg"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddImageUrl()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={handleAddImageUrl}>
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Image preview */}
              {images.length > 0 && (
                <div className="grid gap-2">
                  <Label className="text-sm font-normal">
                    Preview ({images.length} image{images.length !== 1 ? "s" : ""})
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className="relative group aspect-video rounded-lg overflow-hidden border bg-background"
                      >
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Bike ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {images.length === 0
                  ? "Add at least one image. If no images are added, placeholder images will be used."
                  : "You can add more images or remove existing ones by hovering over them."}
              </p>
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
