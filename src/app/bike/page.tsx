"use client"

import ProtectedPage from "@/components/ProtectedPage"
import { BikeBrowser } from "@/components/renter/bike-browser"

export default function Page() {
  return (
    <ProtectedPage allowRoles={["renter"]} requiredPermissionKey={{ role: "renter", feature: "browseBikes" }}>
      <BikeBrowser />
    </ProtectedPage>
  )
}


