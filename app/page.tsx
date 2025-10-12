"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { UserSwitcher } from "@/components/user-switcher"
import { OwnerDashboard } from "@/components/owner/dashboard"
import { OwnerBikeList } from "@/components/owner/bike-list"
import { AddBikeDialog } from "@/components/owner/add-bike-dialog"
import { RenterDashboard } from "@/components/renter/renter-dashboard"
import { BikeBrowser } from "@/components/renter/bike-browser"
import { RentalHistory } from "@/components/renter/rental-history"
import { BikesNearbyMap } from "@/components/renter/bikes-nearby-map"
import { RenterSidebar } from "@/components/sidebar/renter-sidebar"
import { OwnerSidebar } from "@/components/sidebar/owner-sidebar"
import { Bike, Menu } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"

type RenterView = "dashboard" | "map" | "browse" | "rentals"
type OwnerView = "dashboard" | "bikes" | "rentals"

export default function Home() {
  const { currentUser, initializeMockData } = useStore()
  const [renterView, setRenterView] = useState<RenterView>("dashboard")
  const [ownerView, setOwnerView] = useState<OwnerView>("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      initializeMockData()
    }
  }, [currentUser, initializeMockData])

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b fixed top-0 left-0 right-0 bg-background z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Bike className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h1 className="text-lg md:text-2xl font-bold">Hire Bell and Breaks</h1>
            </div>
            <UserSwitcher />
          </div>
        </div>
      </header>

      {currentUser.role === "owner" ? (
        <>
          <OwnerSidebar
            activeView={ownerView}
            onViewChange={setOwnerView}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          <main className="pt-[73px] md:ml-64 min-h-screen">
            <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
              {ownerView === "dashboard" && (
                <div className="space-y-6 md:space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Owner Dashboard</h2>
                      <p className="text-sm md:text-base text-muted-foreground">Manage your bikes and track rentals</p>
                    </div>
                    <AddBikeDialog />
                  </div>
                  <OwnerDashboard />
                </div>
              )}

              {ownerView === "bikes" && (
                <div className="space-y-6 md:space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">My Bikes</h2>
                      <p className="text-sm md:text-base text-muted-foreground">Manage your bike inventory</p>
                    </div>
                    <AddBikeDialog />
                  </div>
                  <OwnerBikeList />
                </div>
              )}

              {ownerView === "rentals" && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Rental History</h2>
                    <p className="text-sm md:text-base text-muted-foreground">View all your bike rentals</p>
                  </div>
                  <RentalHistory />
                </div>
              )}
            </div>
          </main>
        </>
      ) : (
        <>
          <RenterSidebar
            activeView={renterView}
            onViewChange={setRenterView}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          <main className="pt-[73px] md:ml-64 min-h-screen">
            <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
              {renterView === "dashboard" && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Renter Dashboard</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Browse and book bikes for your next adventure
                    </p>
                  </div>
                  <RenterDashboard />
                </div>
              )}

              {renterView === "map" && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Bikes Near You</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Find available bikes on the map</p>
                  </div>
                  <BikesNearbyMap />
                </div>
              )}

              {renterView === "browse" && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Browse Bikes</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Find the perfect bike for your ride</p>
                  </div>
                  <BikeBrowser />
                </div>
              )}

              {renterView === "rentals" && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">My Rentals</h2>
                    <p className="text-sm md:text-base text-muted-foreground">View your rental history</p>
                  </div>
                  <RentalHistory />
                </div>
              )}
            </div>
          </main>
        </>
      )}

      <Toaster />
    </div>
  )
}
