"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Login } from "@/components/auth/login"

export default function Page() {
  const router = useRouter()
  const { currentUser } = useStore()

  useEffect(() => {
    if (currentUser) {
      if(currentUser.role === "renter") {
        router.replace("/renter/browse")
      } else if(currentUser.role === "owner") {
        router.replace("/owner/dashboard")
      } else if(currentUser.role === "admin") {
        router.replace("/admin/dashboard")
      }
    }
  }, [currentUser, router])

  return <Login onSwitchToSignup={() => router.push("/signup")} />
}


