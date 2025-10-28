"use client"

import { LayoutDashboard, Users, FolderTree, X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

type AdminView = "dashboard" | "users" | "categories" | "permissions"

interface AdminSidebarProps {
  activeView: AdminView
  onViewChange: (view: AdminView) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export function AdminSidebar({ activeView, onViewChange, isMobileMenuOpen, setIsMobileMenuOpen }: AdminSidebarProps) {
  const menuItems = [
    { id: "dashboard" as AdminView, label: "Dashboard", icon: LayoutDashboard },
    { id: "users" as AdminView, label: "User Management", icon: Users },
    { id: "categories" as AdminView, label: "Categories", icon: FolderTree },
    { id: "permissions" as AdminView, label: "Permissions", icon: Shield },
  ]

  return (
    <>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 bg-card border-r z-40 transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 md:hidden border-b">
          <h2 className="font-semibold">Admin Menu</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => {
                  onViewChange(item.id)
                  setIsMobileMenuOpen(false)
                }}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
