"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import LoadingScreen from "@/components/LoadingScreen"
import PageTransition from "@/components/PageTransition"
import EventCard from "@/components/EventCard"
import { getEvents, OfflyEvent } from "@/lib/firestore"
import { Loader2, Calendar, Search, LogIn } from "lucide-react"
import { motion } from "framer-motion"

export default function LandingPage() {
  const { user, loading: authLoading } = useAuth()
  const [events, setEvents] = useState<OfflyEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/home")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents()
        setEvents(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingEvents(false)
      }
    }
    fetchEvents()
  }, [])

  if (authLoading) {
    return <LoadingScreen />
  }

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col bg-surface-container-lowest overflow-x-hidden min-h-screen">
        {/* Guest Header */}
        <header className="fixed top-0 w-full z-50 glass h-16 flex items-center justify-between px-margin-page">
          <h1 className="text-2xl font-extrabold tracking-tighter text-primary">Offly</h1>
          <button 
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-bold active-scale shadow-md"
          >
            <LogIn size={18} />
            <span>Accedi</span>
          </button>
        </header>

        <main className="pt-24 pb-20 px-margin-page max-w-screen-xl mx-auto w-full">
          {/* Hero Section */}
          <section className="mb-12 md:mb-20 text-center md:text-left">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-primary leading-none mb-6"
            >
              Vivi il mondo <br /> reale. <span className="text-on-surface-variant/40 italic">Offline.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-on-surface-variant text-lg md:text-xl max-w-2xl font-medium"
            >
              Scopri eventi esclusivi, workshops e attività nel tuo quartiere. Guarda cosa c'è in programma oggi.
            </motion.p>
          </section>

          {/* Events List */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold tracking-tight">Prossimi Eventi</h3>
              <div className="p-2 bg-surface-container-low rounded-full">
                <Search size={20} className="text-on-surface-variant" />
              </div>
            </div>

            {loadingEvents ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                 <Loader2 size={40} className="animate-spin text-primary opacity-20" />
                 <p className="text-on-surface-variant text-sm font-bold">Caricamento eventi...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-surface-container-low rounded-ios-lg border-2 border-dashed border-outline-variant/30">
                 <Calendar size={48} className="text-on-surface-variant opacity-20" />
                 <p className="text-on-surface-variant text-sm font-bold">Nessun evento disponibile.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="relative group">
                    <EventCard
                      title={event.title}
                      time={event.startTime}
                      location={event.location}
                      image={event.image}
                      badge={event.joinedCount >= event.capacity ? "Sold Out" : undefined}
                      onClick={() => router.push('/login')}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-ios-lg pointer-events-none">
                      <span className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg">
                        Accedi per partecipare
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Final CTA */}
          <section className="mt-20 py-20 px-8 bg-primary rounded-ios-xl text-center text-on-primary">
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tighter mb-4">Pronto a staccare?</h3>
            <p className="text-on-primary/80 mb-8 max-w-md mx-auto">Unisciti alla community di Offly e inizia a vivere esperienze reali.</p>
            <button 
              onClick={() => router.push('/login')}
              className="bg-white text-primary px-10 h-16 rounded-full font-bold text-lg active-scale shadow-xl"
            >
              Inizia Ora
            </button>
          </section>
        </main>

        <footer className="py-12 border-t border-outline-variant/10 text-center">
          <p className="text-on-surface-variant/40 text-sm font-bold uppercase tracking-widest">Offly Club © 2026</p>
        </footer>
      </div>
    </PageTransition>
  )
}
