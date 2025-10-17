"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Bike, Review, Rental, Category, Permissions } from "./types"
import { mockUsers, mockBikes, mockReviews, mockRentals, mockCategories } from "./mock-data"

interface AppState {
  currentUser: User | null
  users: User[]
  bikes: Bike[]
  reviews: Review[]
  rentals: Rental[]
  categories: Category[]
  permissions: Permissions

  // Auth actions
  login: (email: string, password: string) => { success: boolean; error?: string }
  signup: (
    firstName: string,
    secondName: string | undefined,
    lastName: string,
    dob: string,
    phone: string,
    email: string,
    password: string,
    role: "owner" | "renter",
  ) => { success: boolean; error?: string }
  logout: () => void
  setCurrentUser: (user: User | null) => void
  verifyAccount: () => void
  skipVerification: () => void
  updateProfile: (updates: Partial<User>) => { success: boolean; error?: string }

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

  // Admin actions
  addCategory: (category: Omit<Category, "id">) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  updateUserRole: (userId: string, role: "owner" | "renter") => void
  deleteUser: (userId: string) => void
  updatePermissions: (role: "renter" | "owner", feature: string, enabled: boolean) => void

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
      categories: [],
      permissions: {
        renter: {
          browseBikes: true,
          map: true,
          dashboard: true,
          rentals: true,
          profile: true,
        },
        owner: {
          dashboard: true,
          bikes: true,
          rentals: true,
          profile: true,
        },
      },

      login: (email, password) => {
        const user = get().users.find((u) => u.email === email)

        if (!user) {
          return { success: false, error: "User not found" }
        }

        // In a real app, you'd verify the password hash
        // For demo purposes, we'll just check if password is not empty
        if (!password || password.length < 6) {
          return { success: false, error: "Invalid password" }
        }

        set({ currentUser: user })
        return { success: true }
      },

      signup: (firstName, secondName, lastName, dob, phone, email, password, role) => {
        const existingUser = get().users.find((u) => u.email === email)

        if (existingUser) {
          return { success: false, error: "Email already exists" }
        }

        if (password.length < 6) {
          return { success: false, error: "Password must be at least 6 characters" }
        }

        const name = `${firstName}${secondName ? ` ${secondName}` : ''} ${lastName}`.trim()

        const newUser: User = {
          id: Date.now().toString(),
          name,
          firstName,
          secondName,
          lastName,
          dob,
          phone,
          email,
          role,
          rating: 5,
          totalRentals: 0,
          verified: false,
        }

        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser,
        }))

        return { success: true }
      },

     

      logout: () => set({ currentUser: null }),

      setCurrentUser: (user) => set({ currentUser: user }),

      verifyAccount: () => {
        const currentUser = get().currentUser
        if (!currentUser) return

        const updatedUser = { ...currentUser, verified: true }
        set((state) => ({
          currentUser: updatedUser,
          users: state.users.map((u) => (u.id === currentUser.id ? updatedUser : u)),
        }))
      },

      skipVerification: () => {
        const currentUser = get().currentUser
        if (!currentUser) return

        const updatedUser = { ...currentUser, verified: true }
        set((state) => ({
          currentUser: updatedUser,
          users: state.users.map((u) => (u.id === currentUser.id ? updatedUser : u)),
        }))
      },

      updateProfile: (updates) => {
        const currentUser = get().currentUser
        if (!currentUser) {
          return { success: false, error: "No user logged in" }
        }

        // Validate email if being updated
        if (updates.email && updates.email !== currentUser.email) {
          const emailExists = get().users.some((u) => u.email === updates.email && u.id !== currentUser.id)
          if (emailExists) {
            return { success: false, error: "Email already in use" }
          }
        }

        const updatedUser = { ...currentUser, ...updates }
        set((state) => ({
          currentUser: updatedUser,
          users: state.users.map((u) => (u.id === currentUser.id ? updatedUser : u)),
        }))

        return { success: true }
      },

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

      addCategory: (category) =>
        set((state) => ({
          categories: [
            ...state.categories,
            {
              ...category,
              id: Date.now().toString(),
            },
          ],
        })),

      updateCategory: (id, updatedCategory) =>
        set((state) => ({
          categories: state.categories.map((cat) => (cat.id === id ? { ...cat, ...updatedCategory } : cat)),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
        })),

      updateUserRole: (userId, role) =>
        set((state) => ({
          users: state.users.map((user) => (user.id === userId ? { ...user, role } : user)),
        })),

      deleteUser: (userId) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId),
          bikes: state.bikes.filter((bike) => bike.ownerId !== userId),
        })),

      updatePermissions: (role, feature, enabled) =>
        set((state) => ({
          permissions: {
            ...state.permissions,
            [role]: {
              ...state.permissions[role],
              [feature]: enabled,
            },
          },
        })),

      initializeMockData: () =>
        set({
          users: mockUsers,
          bikes: mockBikes,
          reviews: mockReviews,
          rentals: mockRentals,
          categories: mockCategories,
          currentUser: null,
          permissions: {
            renter: {
              browseBikes: true,
              map: true,
              dashboard: true,
              rentals: true,
              profile: true,
            },
            owner: {
              dashboard: true,
              bikes: true,
              rentals: true,
              profile: true,
            },
          },
        }),
    }),
    {
      name: "bike-rental-storage",
    },
  ),
)
