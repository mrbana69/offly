"use client"

import React, { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import FloatingTabBar from "@/components/FloatingTabBar"
import { LogOut, Settings, ChevronRight, Bell, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import PageTransition from "@/components/PageTransition"

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading || !user) return null

  const sections = [
    { icon: <Bell size={20} />, label: "Notifiche", value: "Sempre attive", href: "/settings" },
    { icon: <Shield size={20} />, label: "Privacy & Sicurezza", value: "", href: "/privacy" },
    { icon: <Settings size={20} />, label: "Impostazioni", value: "", href: "/settings" },
  ]

  return (
    <PageTransition>
      <div className="flex-1 min-h-screen flex flex-col bg-surface-container-lowest overflow-x-hidden pb-44">
        <header className="pt-16 px-margin-page pb-8 md:pt-24 lg:pt-32">
          <h1 className="text-[40px] md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-primary leading-tight">Profilo</h1>
        </header>

      <main className="px-margin-page space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Profile Card */}
          <div className="flex items-center gap-6 p-8 bg-surface-container-low rounded-ios-lg shadow-sm">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-surface-container-highest overflow-hidden shadow-inner ring-4 ring-white">
              {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />}
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight text-primary">{user.displayName || "Utente"}</h2>
              <p className="text-on-surface-variant font-medium">{user.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Menu Sections */}
            <div className="space-y-2">
              {sections.map((item, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(item.href)}
                  className="w-full flex items-center justify-between p-6 bg-surface-container-low rounded-2xl active-scale transition-colors hover:bg-surface-container border border-outline-variant/10"
                >
                  <div className="flex items-center gap-4 text-primary">
                    <div className="p-2 bg-surface rounded-xl">
                      {item.icon}
                    </div>
                    <span className="font-bold text-lg">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="text-sm font-medium">{item.value}</span>
                    <ChevronRight size={18} />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Logout Button */}
            <button
              onClick={async () => {
                await logout()
                router.push("/")
              }}
              className="w-full flex items-center justify-center gap-3 p-6 text-red-600 font-bold bg-red-50 rounded-2xl active-scale transition-colors hover:bg-red-100"
            >
              <LogOut size={20} />
              Esci dall'account
            </button>
          </div>
        </div>
      </main>

    </div>
  </PageTransition>
  )
}
