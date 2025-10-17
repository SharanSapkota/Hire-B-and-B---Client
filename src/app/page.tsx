"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { Login } from "@/components/auth/login"
import { Signup } from "@/components/auth/signup"
import { VerifyAccount } from "@/components/auth/verify-account"
import { UserProfile } from "@/components/profile/user-profile"
import { OwnerDashboard } from "@/components/owner/dashboard"
import { OwnerBikeList } from "@/components/owner/bike-list"
import { AddBikeDialog } from "@/components/owner/add-bike-dialog"
import { RenterDashboard } from "@/components/renter/renter-dashboard"
import { BikeBrowser } from "@/components/renter/bike-browser"
import { RentalHistory } from "@/components/renter/rental-history"
import { BikesNearbyMap } from "@/components/renter/bikes-nearby-map"
import { RenterSidebar } from "@/components/sidebar/renter-sidebar"
import { OwnerSidebar } from "@/components/sidebar/owner-sidebar"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { CategoryManagement } from "@/components/admin/category-management"
import { UserManagement } from "@/components/admin/user-management"
import { PermissionsManagement } from "@/components/admin/permissions-management"
import { AdminSidebar } from "@/components/sidebar/admin-sidebar"
import { Bike, Menu, LogOut } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"

type RenterView = "dashboard" | "map" | "browse" | "rentals" | "profile"
type OwnerView = "dashboard" | "bikes" | "rentals" | "profile"
type AdminView = "dashboard" | "users" | "categories" | "permissions"

export default function Home() {
  const { currentUser, initializeMockData, logout, permissions } = useStore()
  const [renterView, setRenterView] = useState<RenterView>("browse")
  const [ownerView, setOwnerView] = useState<OwnerView>("dashboard")
  const [adminView, setAdminView] = useState<AdminView>("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [authView, setAuthView] = useState<"login" | "signup">("login")

  useEffect(() => {
    initializeMockData()
  }, [initializeMockData])

  useEffect(() => {
    if (currentUser?.role === "renter") {
      const viewPermissionMap: Record<RenterView, keyof typeof permissions.renter> = {
        browse: "browseBikes",
        map: "map",
        dashboard: "dashboard",
        rentals: "rentals",
        profile: "profile",
      }

      const currentPermission = viewPermissionMap[renterView]
      if (!permissions.renter[currentPermission]) {
        // Find first available view
        const availableView = (Object.keys(viewPermissionMap) as RenterView[]).find(
          (view) => permissions.renter[viewPermissionMap[view]],
        )
        if (availableView) {
          setRenterView(availableView)
        }
      }
    }
  }, [currentUser, renterView, permissions.renter])

  useEffect(() => {
    if (currentUser?.role === "owner") {
      const viewPermissionMap: Record<OwnerView, keyof typeof permissions.owner> = {
        dashboard: "dashboard",
        bikes: "bikes",
        rentals: "rentals",
        profile: "profile",
      }

      const currentPermission = viewPermissionMap[ownerView]
      if (!permissions.owner[currentPermission]) {
        // Find first available view
        const availableView = (Object.keys(viewPermissionMap) as OwnerView[]).find(
          (view) => permissions.owner[viewPermissionMap[view]],
        )
        if (availableView) {
          setOwnerView(availableView)
        }
      }
    }
  }, [currentUser, ownerView, permissions.owner])

  if (currentUser && !currentUser.verified) {
    return <VerifyAccount />
  }

  if (!currentUser) {
    if (authView === "login") {
      return <Login onSwitchToSignup={() => setAuthView("signup")} />
    }
    return <Signup onSwitchToLogin={() => setAuthView("login")} />
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
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {currentUser.role === "admin" ? (
        <>
          <AdminSidebar
            activeView={adminView}
            onViewChange={setAdminView}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          <main className="pt-[73px] md:ml-64 min-h-screen">
            <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
              {adminView === "dashboard" && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Platform analytics and management</p>
                  </div>
                  <AdminDashboard />
                </div>
              )}

              {adminView === "users" && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Manage all users and their permissions</p>
                  </div>
                  <UserManagement />
                </div>
              )}

              {adminView === "categories" && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Category Management</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Manage bike categories for the platform
                    </p>
                  </div>
                  <CategoryManagement />
                </div>
              )}

              {adminView === "permissions" && (
                <div className="space-y-6 md:space-y-8">
                  <PermissionsManagement />
                </div>
              )}
            </div>
          </main>
        </>
      ) : currentUser.role === "owner" ? (
        <>
          <OwnerSidebar
            activeView={ownerView}
            onViewChange={setOwnerView}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          <main className="pt-[73px] md:ml-64 min-h-screen">
            <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
              {ownerView === "dashboard" && permissions.owner.dashboard && (
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

              {ownerView === "bikes" && permissions.owner.bikes && (
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

              {ownerView === "rentals" && permissions.owner.rentals && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Rental History</h2>
                    <p className="text-sm md:text-base text-muted-foreground">View all your bike rentals</p>
                  </div>
                  <RentalHistory />
                </div>
              )}

              {ownerView === "profile" && permissions.owner.profile && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">My Profile</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Manage your account settings</p>
                  </div>
                  <UserProfile />
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
              {renterView === "dashboard" && permissions.renter.dashboard && (
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

              {renterView === "map" && permissions.renter.map && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Bikes Near You</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Find available bikes on the map</p>
                  </div>
                  <BikesNearbyMap />
                </div>
              )}

              {renterView === "browse" && permissions.renter.browseBikes && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Browse Bikes</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Find the perfect bike for your ride</p>
                  </div>
                  <BikeBrowser />
                </div>
              )}

              {renterView === "rentals" && permissions.renter.rentals && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">My Rentals</h2>
                    <p className="text-sm md:text-base text-muted-foreground">View your rental history</p>
                  </div>
                  <RentalHistory />
                </div>
              )}

              {renterView === "profile" && permissions.renter.profile && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">My Profile</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Manage your account settings</p>
                  </div>
                  <UserProfile />
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
