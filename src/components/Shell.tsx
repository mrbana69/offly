"use client"

import React from "react"
import SideNavigation from "./SideNavigation"
import FloatingTabBar from "./FloatingTabBar"
import { useAuth } from "@/context/AuthContext"
import LoadingScreen from "./LoadingScreen"

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  // If no user, we don't show the navigation shell (login page logic)
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-surface transition-colors duration-500">
      {/* Desktop Sidebar */}
      <SideNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 flex flex-col w-full max-w-screen-xl mx-auto md:px-8 lg:px-12">
          {children}
        </div>

        {/* Mobile Bottom Tab Bar */}
        <FloatingTabBar />
      </div>
    </div>
  )
}
