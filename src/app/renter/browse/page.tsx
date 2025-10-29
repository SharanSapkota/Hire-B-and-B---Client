"use client"

import { BikeBrowser } from "@/components/renter/bike-browser"
import { useRouter } from "next/navigation"
import { RenterSidebar } from "@/components/sidebar/renter-sidebar"
export default function Page() {
    const router = useRouter();

   return  <>
   <RenterSidebar activeView="browse" onViewChange={() => {}} isMobileMenuOpen={false} setIsMobileMenuOpen={() => {}} />
   <BikeBrowser />
   </>;
}



