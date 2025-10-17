"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Shield, User, Store } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function UserManagement() {
  const { users, updateUserRole, deleteUser, currentUser } = useStore()

  const handleRoleChange = (userId: string, role: "owner" | "renter" | "admin") => {
    updateUserRole(userId, role)
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUser(userId)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">User Management</h3>
        <p className="text-sm text-muted-foreground">Manage all users on the platform</p>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {user.role === "admin" ? (
                      <Shield className="h-6 w-6 text-primary" />
                    ) : user.role === "owner" ? (
                      <Store className="h-6 w-6 text-primary" />
                    ) : (
                      <User className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.verified ? "default" : "secondary"}>
                    {user.verified ? "Verified" : "Unverified"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Rating: </span>
                    <span className="font-medium">{user.rating.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rentals: </span>
                    <span className="font-medium">{user.totalRentals}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value as any)}
                    disabled={user.id === currentUser?.id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="renter">Renter</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.id === currentUser?.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
