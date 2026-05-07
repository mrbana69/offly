"use client"

import React, { useState, useEffect } from "react"
import FloatingTabBar from "@/components/FloatingTabBar"
import EventCard from "@/components/EventCard"
import { Search, SlidersHorizontal, Loader2, Calendar, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import PageTransition from "@/components/PageTransition"
import { getEvents, OfflyEvent } from "@/lib/firestore"

export default function EventsPage() {
  const [events, setEvents] = useState<OfflyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("Tutti")
  const router = useRouter()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents()
        setEvents(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col bg-surface-container-lowest overflow-x-hidden pb-44">
        {/* Header */}
        <header className="fixed top-0 w-full max-w-md z-50 glass h-16 flex items-center gap-4 px-margin-page md:hidden">
          <button onClick={() => router.push('/home')} className="p-1 active-scale">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-extrabold tracking-tighter text-primary">Offly</h1>
          <div className="flex-1" />
          <button className="p-2 active-scale">
            <Search size={24} />
          </button>
        </header>

        {/* Desktop Back Button */}
        <button 
          onClick={() => router.push('/home')}
          className="hidden md:flex fixed top-12 left-8 lg:left-12 z-50 p-4 bg-surface-container-low border border-outline-variant/10 rounded-full shadow-lg active-scale group transition-all hover:bg-primary hover:text-on-primary"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <main className="pt-24 md:pt-16 px-margin-page space-y-8 md:pt-24 lg:pt-32">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h1 className="text-[40px] md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-primary leading-tight">Eventi</h1>
            
            {/* Segmented Control */}
            <div className="bg-surface-container-low p-1 rounded-full flex items-center w-full md:w-auto md:min-w-[300px] border border-outline-variant/10">
              {["Tutti", "Prossimi", "I miei"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all active-scale ${
                    activeTab === tab 
                      ? "bg-surface-container-lowest text-primary shadow-sm" 
                      : "text-on-surface-variant/60"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <Loader2 size={40} className="animate-spin text-primary opacity-20" />
               <p className="text-on-surface-variant text-sm font-bold">Caricamento eventi...</p>
            </div>
          ) : events.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4 bg-surface-container-low rounded-ios-lg border-2 border-dashed border-outline-variant/30 mt-8"
            >
               <Calendar size={48} className="text-on-surface-variant opacity-20" />
               <p className="text-on-surface-variant text-sm font-bold">Nessun evento disponibile al momento.</p>
               <button onClick={() => window.location.reload()} className="text-primary font-bold text-xs underline">Riprova a caricare</button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  time={event.startTime}
                  location={event.location}
                  image={event.image}
                  badge={event.joinedCount >= event.capacity ? "Sold Out" : undefined}
                  onClick={() => router.push(`/events/${event.id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  )
}
