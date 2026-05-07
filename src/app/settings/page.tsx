"use client"

import React from "react"
import { ChevronLeft, Bell, Moon, Smartphone, ShieldCheck, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import PageTransition from "@/components/PageTransition"

export default function SettingsPage() {
  const router = useRouter()
  const { isDarkMode, toggleDarkMode } = useAuth()

  const settingsItems = [
    { id: 'push', icon: <Bell size={20} />, label: "Notifiche Push", description: "Gestisci avvisi eventi", type: "toggle" },
    { id: 'dark', icon: <Moon size={20} />, label: "Modalità Scura", description: "Tema dell'applicazione", type: "toggle", active: isDarkMode, action: toggleDarkMode },
    { id: 'sync', icon: <Smartphone size={20} />, label: "Sincronizzazione Calendario", description: "Integrazione Google Calendar", type: "toggle" },
    { id: 'lang', icon: <Globe size={20} />, label: "Lingua", description: "Italiano", type: "link" },
  ]

  return (
    <PageTransition>
      <div className="flex-1 min-h-screen flex flex-col bg-surface-container-lowest overflow-x-hidden pb-44">
        <header className="pt-16 px-margin-page pb-8 md:pt-24 lg:pt-32">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => router.back()} className="p-2 hover:bg-surface-container rounded-full active-scale">
              <ChevronLeft size={24} />
            </button>
            <span className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Account</span>
          </div>
          <h1 className="text-[40px] md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-primary leading-tight">Impostazioni</h1>
        </header>

      <main className="px-margin-page space-y-8 max-w-4xl">
        <div className="bg-surface-container-low rounded-ios-lg overflow-hidden border border-outline-variant/10 shadow-sm">
          {settingsItems.map((item, i) => (
            <div 
              key={i} 
              onClick={() => item.action && item.action()}
              className="flex items-center justify-between p-6 border-b border-outline-variant/5 last:border-none hover:bg-surface-container/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-surface rounded-xl text-primary shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-primary">{item.label}</h3>
                  <p className="text-sm text-on-surface-variant">{item.description}</p>
                </div>
              </div>
              {item.type === "toggle" ? (
                <div className={cn(
                  "w-12 h-7 rounded-full relative transition-colors duration-300",
                  item.active ? "bg-primary" : "bg-primary/10"
                )}>
                  <motion.div 
                    animate={{ x: item.active ? 20 : 0 }}
                    className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm" 
                  />
                </div>
              ) : (
                <ChevronLeft size={20} className="rotate-180 text-on-surface-variant" />
              )}
            </div>
          ))}
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight px-2">Supporto</h2>
          <div className="bg-surface-container-low rounded-ios-lg p-6 border border-outline-variant/10 space-y-4">
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Hai bisogno di aiuto con il tuo account o con la prenotazione di un evento?
            </p>
            <button className="w-full h-14 bg-primary text-on-primary rounded-full font-bold active-scale shadow-md">
              Contatta il Supporto
            </button>
          </div>
        </section>
      </main>
      </div>
    </PageTransition>
  )
}
