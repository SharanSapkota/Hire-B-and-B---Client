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
import { createBike, getPreSignedUrl } from "@/services/bikeService"
import GoogleMapPicker from "@/components/maps/google-map-picker"
import axiosCall, { uploadToS3 } from "../axios/app"

export function AddBikeDialog() {
  const { currentUser } = useStore()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Mountain",
    condition: "Excellent" as "Excellent" | "Good" | "Fair" | "Needs Maintenance",
    address: "",
    city: "",
    street: "",
    country: "",
    state: "",
    postalCode: "",
    town: "",
    village: ""
  })
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [images, setImages] = useState<string[]>([])
  const [files, setFiles] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [presigned, setPresigned] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [geocoding, setGeocoding] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    const maxSize = 2 * 1024 * 1024 // 2MB
      const presigned = await getPreSignedUrl(files[0].name, files[0].type);
      setPresigned(presigned.data?.uploadURL);
      Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        setErrors((s) => ({ ...s, images: "Only PNG, JPG or WEBP images are allowed" }))
        return
      }
      if (file.size > maxSize) {
        setErrors((s) => ({ ...s, images: "Each image must be under 2MB" }))
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string])
        setErrors((s) => ({ ...s, images: undefined }))
      }
      reader.readAsDataURL(file)
      setFiles(file)
    })

    e.target.value = ""
  }

  const addBike = async (payload: any) => {
    const bike = await axiosCall.post('bikes', payload);

  }
  const handleAddImageUrl = () => {
    const url = imageUrl.trim()
    if (!url) return

    // basic URL validation
    try {
      const parsed = new URL(url)
      const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"]
      if (!allowedExtensions.some((ext) => parsed.pathname.toLowerCase().endsWith(ext))) {
        setErrors((s) => ({ ...s, images: "Image URL must point to a PNG/JPG/WEBP file" }))
        return
      }

      setImages((prev) => [...prev, url])
      setImageUrl("")
      setErrors((s) => ({ ...s, images: undefined }))
    } catch (err) {
      setErrors((s) => ({ ...s, images: "Please enter a valid URL" }))
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const validateInputFields = ()  => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.price.trim()) newErrors.price = "Price is required"
    else if (Number.isNaN(Number(formData.price)) || Number(formData.price) <= 0)
      newErrors.price = "Price must be a number greater than 0"
    if (!formData.address.trim()) newErrors.address = "Address is required"

    if (images.length === 0) {
      newErrors.images = "Please add at least one image"
    }

    // require a selected location (address will be filled via map or manually)
    if (!formData.address.trim() && !selectedLocation) {
      newErrors.address = "Please pick a location on the map or enter an address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    validateInputFields()
    const bikeImages = images.length > 0 ? images : [
      `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(formData.name)}`,
      `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(formData.name)}%20side%20view`,
    ]

    console.log(images)

    const payload = {
      ownerId: currentUser!.id,
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      category: formData.category,
      address: formData.address,
      city: formData.city,
      street: formData.street,
      country: formData.country,
      state: formData.state,
      postalCode: formData.postalCode,
      town: formData.town,
      village: formData.village,
      condition: formData.condition,
      images: bikeImages,
      location: selectedLocation
        ? { lat: selectedLocation.lat, lng: selectedLocation.lng, address: formData.address }
        : {
            lat: 40.7128 + Math.random() * 0.1,
            lng: -74.006 + Math.random() * 0.1,
            address: formData.address,
          },
      available: true,
    }

    if(!validateInputFields()) {
      return
    }

    setIsSubmitting(true)
    try {
       const response = await uploadToS3(files!, presigned)
      console.log(response)
      // console.log(preSigned)
// 
      addBike(payload)

      setFormData({
        name: "test",
        description: "test",
        price: "22",
        village: "",
        city: "",
        street: "",
        country: "",
        state: "",
        postalCode: "",
        town: "",
        category: "Mountain",
        condition: "Excellent",
        address: "",
      })
      setImages([])
      setErrors({})
      // setOpen(false)
    } catch (err: any) {
      setErrors((s) => ({ ...s, submit: err?.message || 'Failed to create bike on server' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return

    ;(async () => {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject),
        )
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude

        setSelectedLocation({ lat, lng })

        try {
          setGeocoding(true)
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          const res = await fetch(url)
          if (res.ok) {
            const json = await res.json()
            if (json && json.address) {
              const { road, city, town, village, state, postalCode, country } = json.address
              setFormData((f) => ({ ...f, city, street: road, state, postalCode, country, town, village, address: json.display_name }))
              setErrors((s) => ({ ...s, address: undefined }))
            }
          }
        } catch (e) {
          // ignore geocoding errors
        } finally {
          setGeocoding(false)
        }
      } catch (err) {
        // geolocation permission denied or unavailable
      }
    })()
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
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
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
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
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
                {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
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
              {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  className="text-sm text-primary underline"
                  onClick={() => useMyLocation()}
                >
                  Use my current location
                </button>
                {geocoding && <span className="text-xs text-muted-foreground">Looking up address…</span>}
              </div>
              <div className="mt-2">
                <GoogleMapPicker center={selectedLocation ?? undefined} marker={selectedLocation} onSelect={(loc) => {
                  setSelectedLocation({ lat: loc.lat, lng: loc.lng })
                  setFormData((f) => ({ ...f, address: loc.address ?? f.address }))
                }} />
              </div>
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
              {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <div className="flex flex-col items-end gap-2">
              {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Bike'}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
