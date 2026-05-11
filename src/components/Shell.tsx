"use client"

import React from "react"
import SideNavigation from "./SideNavigation"
import { useAuth } from "@/context/AuthContext"
import LoadingScreen from "./LoadingScreen"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/privacy", "/terms"]
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      router.push("/")
    }
  }, [user, loading, isPublicRoute, router])

  if (loading) {
    return <LoadingScreen />
  }

  // If no user and trying to access a private route, we don't show the content (the useEffect will redirect)
  if (!user && !isPublicRoute) {
    return <LoadingScreen />
  }

  // If no user but on a public route, just show the children without the navigation shell
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-surface transition-colors duration-500">
      {/* Desktop Sidebar */}
      <SideNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex-1 flex flex-col w-full">
          {children}
        </div>

        {/* Mobile Bottom Tab Bar */}
        <FloatingTabBar />
      </div>
    </div>
  )
}
