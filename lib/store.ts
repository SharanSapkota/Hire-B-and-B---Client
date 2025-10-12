"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Bike, Review, Rental } from "./types"
import { mockUsers, mockBikes, mockReviews, mockRentals } from "./mock-data"

interface AppState {
  currentUser: User | null
  users: User[]
  bikes: Bike[]
  reviews: Review[]
  rentals: Rental[]

  // Auth actions
  setCurrentUser: (user: User | null) => void

  // Bike actions
  addBike: (bike: Omit<Bike, "id" | "rating" | "likes" | "totalRentals" | "dateAdded">) => void
  updateBike: (id: string, bike: Partial<Bike>) => void
  deleteBike: (id: string) => void
  likeBike: (bikeId: string) => void

  // Review actions
  addReview: (review: Omit<Review, "id">) => void

  // Rental actions
  createRental: (rental: Omit<Rental, "id">) => void
  updateRentalStatus: (id: string, status: Rental["status"]) => void

  // Initialize with mock data
  initializeMockData: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      bikes: [],
      reviews: [],
      rentals: [],

      setCurrentUser: (user) => set({ currentUser: user }),

      addBike: (bike) =>
        set((state) => ({
          bikes: [
            ...state.bikes,
            {
              ...bike,
              id: Date.now().toString(),
              rating: 0,
              likes: 0,
              totalRentals: 0,
              dateAdded: new Date().toISOString().split("T")[0],
            },
          ],
        })),

      updateBike: (id, updatedBike) =>
        set((state) => ({
          bikes: state.bikes.map((bike) => (bike.id === id ? { ...bike, ...updatedBike } : bike)),
        })),

      deleteBike: (id) =>
        set((state) => ({
          bikes: state.bikes.filter((bike) => bike.id !== id),
        })),

      likeBike: (bikeId) =>
        set((state) => ({
          bikes: state.bikes.map((bike) => (bike.id === bikeId ? { ...bike, likes: bike.likes + 1 } : bike)),
        })),

      addReview: (review) =>
        set((state) => {
          const newReview = { ...review, id: Date.now().toString() }
          const bikeReviews = [...state.reviews.filter((r) => r.bikeId === review.bikeId), newReview]
          const avgRating = bikeReviews.reduce((sum, r) => sum + r.rating, 0) / bikeReviews.length

          return {
            reviews: [...state.reviews, newReview],
            bikes: state.bikes.map((bike) => (bike.id === review.bikeId ? { ...bike, rating: avgRating } : bike)),
          }
        }),

      createRental: (rental) =>
        set((state) => ({
          rentals: [...state.rentals, { ...rental, id: Date.now().toString() }],
          bikes: state.bikes.map((bike) =>
            bike.id === rental.bikeId ? { ...bike, available: false, totalRentals: bike.totalRentals + 1 } : bike,
          ),
        })),

      updateRentalStatus: (id, status) =>
        set((state) => {
          const rental = state.rentals.find((r) => r.id === id)
          return {
            rentals: state.rentals.map((r) => (r.id === id ? { ...r, status } : r)),
            bikes:
              rental && status === "completed"
                ? state.bikes.map((bike) => (bike.id === rental.bikeId ? { ...bike, available: true } : bike))
                : state.bikes,
          }
        }),

      initializeMockData: () =>
        set({
          users: mockUsers,
          bikes: mockBikes,
          reviews: mockReviews,
          rentals: mockRentals,
          currentUser: mockUsers[0], // Default to owner
        }),
    }),
    {
      name: "bike-rental-storage",
    },
  ),
)
