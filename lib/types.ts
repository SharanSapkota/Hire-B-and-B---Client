export type UserRole = "owner" | "renter" | "admin"

export interface User {
  id: string
  name: string
  firstName?: string
  secondName?: string
  lastName?: string
  dob?: string
  email: string
  role: UserRole
  rating: number
  totalRentals: number
  avatar?: string
  verified?: boolean
  phone?: string
  bio?: string
}

export interface Bike {
  id: string
  ownerId: string
  name: string
  description: string
  price: number
  rating: number
  likes: number
  images: string[]
  location: {
    lat: number
    lng: number
    address: string
  }
  available: boolean
  category: string
  totalRentals: number
  condition: "Excellent" | "Good" | "Fair" | "Needs Maintenance"
  dateAdded: string
}

export interface Review {
  id: string
  bikeId: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
}

export interface Rental {
  id: string
  bikeId: string
  bikeName: string
  renterId: string
  renterName: string
  ownerId: string
  startDate: string
  endDate: string
  status: "active" | "completed" | "cancelled"
  totalPrice: number
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
}

export interface Permissions {
  renter: {
    browseBikes: boolean
    map: boolean
    dashboard: boolean
    rentals: boolean
    profile: boolean
  }
  owner: {
    dashboard: boolean
    bikes: boolean
    rentals: boolean
    profile: boolean
  }
}
