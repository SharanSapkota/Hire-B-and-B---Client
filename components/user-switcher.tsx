"use client"

import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown } from "lucide-react"

export function UserSwitcher() {
  const { currentUser, users, setCurrentUser } = useStore()

  if (!currentUser) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Avatar className="h-6 w-6">
            <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{currentUser.name}</span>
          <span className="text-muted-foreground text-xs">({currentUser.role})</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch User</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {users.map((user) => (
          <DropdownMenuItem key={user.id} onClick={() => setCurrentUser(user)} className="gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.role}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
