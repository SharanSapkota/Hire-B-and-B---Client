"use client"

import { cn } from "@/lib/utils"
import { LayoutDashboard, Bike, History, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

type View = "dashboard" | "bikes" | "rentals" | "profile"

interface OwnerSidebarProps {
  activeView: View
  onViewChange: (view: View) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export function OwnerSidebar({ activeView, onViewChange, isMobileMenuOpen, setIsMobileMenuOpen }: OwnerSidebarProps) {
  const permissions = useStore((state) => state.permissions)

  const menuItems = [
    { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
    { id: "bikes" as View, label: "My Bikes", icon: Bike, permission: "bikes" },
    { id: "rentals" as View, label: "Rental History", icon: History, permission: "rentals" },
    { id: "profile" as View, label: "Profile", icon: User, permission: "profile" },
  ]

  const visibleMenuItems = menuItems.filter(
    (item) => permissions.owner[item.permission as keyof typeof permissions.owner],
  )

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 border-r bg-background transition-transform duration-300 ease-in-out z-40",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <h3 className="font-semibold">Menu</h3>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id)
                  setIsMobileMenuOpen(false)
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  activeView === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-[73px] bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
