"use client"

import React from "react"
import { Home, Calendar, User, ShieldCheck } from "lucide-react"
import { usePathname } from "next/navigation"
import TabBarIcon from "./TabBarIcon"
import { useAuth } from "@/context/AuthContext"

export default function FloatingTabBar() {
  const pathname = usePathname()
  const { isAdmin } = useAuth()

  // Nascondi la tab bar solo nelle pagine di dettaglio dell'evento
  if (pathname.startsWith("/events/")) {
    return null
  }

  return (
    <nav
      className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass rounded-full border border-white/20 shadow-2xl px-6 py-3 flex justify-around items-center z-50 md:hidden"
      aria-label="Main navigation"
    >
      <TabBarIcon 
        icon={<Home size={24} />} 
        label="Home" 
        href="/home" 
        active={pathname === "/home" || pathname === "/"} 
      />
      <TabBarIcon 
        icon={<Calendar size={24} />} 
        label="Eventi" 
        href="/events" 
        active={pathname === "/events"} 
      />
      <TabBarIcon 
        icon={<User size={24} />} 
        label="Profilo" 
        href="/profile" 
        active={pathname === "/profile"} 
      />
      {isAdmin && (
        <TabBarIcon 
          icon={<ShieldCheck size={24} />} 
          label="Admin" 
          href="/admin" 
          active={pathname === "/admin"} 
        />
      )}
    </nav>
  )
}
