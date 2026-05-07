"use client"

import React from "react"
import { Home, Calendar, User, ShieldCheck, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

export default function SideNavigation() {
  const pathname = usePathname()
  const { logout, user, isAdmin } = useAuth()

  const navItems = [
    { icon: <Home size={22} />, label: "Home", href: "/home", active: pathname === "/home" || pathname === "/" },
    { icon: <Calendar size={22} />, label: "Eventi", href: "/events", active: pathname === "/events" },
    { icon: <User size={22} />, label: "Profilo", href: "/profile", active: pathname === "/profile" },
    ...(isAdmin ? [{ icon: <ShieldCheck size={22} />, label: "Admin", href: "/admin", active: pathname === "/admin" }] : []),
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-surface-container-low border-r border-outline-variant/10 p-6">
      <div className="mb-12 px-2">
        <h1 className="text-3xl font-black tracking-tighter text-primary">Offly</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold",
              item.active 
                ? "bg-primary text-on-primary shadow-lg shadow-black/5" 
                : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {user && (
        <div className="mt-auto pt-6 border-t border-outline-variant/10">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
              {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold truncate max-w-[120px]">{user.displayName}</span>
              <span className="text-[10px] text-on-surface-variant truncate max-w-[120px]">{user.email}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 text-error font-bold hover:bg-error/5 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span>Esci</span>
          </button>
        </div>
      )}
    </aside>
  )
}
