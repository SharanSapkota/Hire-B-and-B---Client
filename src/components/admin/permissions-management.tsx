"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useStore } from "@/lib/store"

export function PermissionsManagement() {
  const { permissions, updatePermissions } = useStore()

  const renterFeatures = [
    { id: "browseBikes", label: "Browse Bikes", description: "Allow renters to browse available bikes" },
    { id: "map", label: "Map View", description: "Allow renters to view bikes on map" },
    { id: "dashboard", label: "Dashboard", description: "Allow renters to view their dashboard" },
    { id: "rentals", label: "My Rentals", description: "Allow renters to view their rental history" },
    { id: "profile", label: "Profile", description: "Allow renters to view and edit their profile" },
  ]

  const ownerFeatures = [
    { id: "dashboard", label: "Dashboard", description: "Allow owners to view their dashboard" },
    { id: "bikes", label: "My Bikes", description: "Allow owners to manage their bikes" },
    { id: "rentals", label: "Rental History", description: "Allow owners to view rental history" },
    { id: "profile", label: "Profile", description: "Allow owners to view and edit their profile" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Permissions Management</h2>
        <p className="text-muted-foreground">Control what features are visible to different user roles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Renter Permissions</CardTitle>
          <CardDescription>Manage features available to renters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renterFeatures.map((feature) => (
            <div key={feature.id} className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor={`renter-${feature.id}`} className="text-base font-medium">
                  {feature.label}
                </Label>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <Switch
                id={`renter-${feature.id}`}
                checked={permissions.renter[feature.id as keyof typeof permissions.renter]}
                onCheckedChange={(checked) => updatePermissions("renter", feature.id, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Owner Permissions</CardTitle>
          <CardDescription>Manage features available to bike owners</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {ownerFeatures.map((feature) => (
            <div key={feature.id} className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor={`owner-${feature.id}`} className="text-base font-medium">
                  {feature.label}
                </Label>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <Switch
                id={`owner-${feature.id}`}
                checked={permissions.owner[feature.id as keyof typeof permissions.owner]}
                onCheckedChange={(checked) => updatePermissions("owner", feature.id, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
