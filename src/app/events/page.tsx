"use client"

import React, { useState, useEffect } from "react"
import FloatingTabBar from "@/components/FloatingTabBar"
import EventCard from "@/components/EventCard"
import { Search, SlidersHorizontal, Loader2, Calendar, ChevronLeft, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import PageTransition from "@/components/PageTransition"
import { getEvents, OfflyEvent } from "@/lib/firestore"
import { useAuth } from "@/context/AuthContext"

export default function EventsPage() {
  const [events, setEvents] = useState<OfflyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("Tutti")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "Prossimi") {
      const now = new Date();
      const start = event.startTime.toDate ? event.startTime.toDate() : new Date(event.startTime);
      return matchesSearch && start > now;
    }
    
    if (activeTab === "I miei") {
      return matchesSearch && event.attendeeUIDs?.includes(user?.uid || "");
    }
    
    return matchesSearch;
  })

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col bg-surface-container-lowest overflow-x-hidden pb-44">
        {/* Mobile Header */}
        <header className="fixed top-0 w-full z-50 glass h-16 flex items-center gap-4 px-margin-page md:hidden">
          <AnimatePresence mode="wait">
            {isSearchOpen ? (
              <motion.div 
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 flex items-center gap-2"
              >
                <input 
                  autoFocus
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca evento..." 
                  className="flex-1 h-10 bg-surface-container rounded-full px-4 text-sm font-medium outline-none"
                />
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="p-2">
                  <X size={20} />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <button onClick={() => router.push('/home')} className="p-1 active-scale">
                    <ChevronLeft size={24} />
                  </button>
                  <h1 className="text-2xl font-extrabold tracking-tighter text-primary">Esplora</h1>
                </div>
                <button onClick={() => setIsSearchOpen(true)} className="p-2 active-scale">
                  <Search size={24} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Desktop Back Button */}
        <button 
          onClick={() => router.push('/home')}
          className="hidden md:flex fixed top-12 left-8 lg:left-12 z-50 p-4 bg-surface-container-low border border-outline-variant/10 rounded-full shadow-lg active-scale group transition-all hover:bg-primary hover:text-on-primary"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <main className="pt-24 md:pt-16 px-margin-page space-y-8 md:pt-24 lg:pt-32">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <h1 className="text-[40px] md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-primary leading-tight">Eventi</h1>
            
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
               {/* Desktop Search Bar */}
               <div className="hidden md:flex relative w-full md:w-64">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca per titolo o luogo..." 
                    className="w-full h-11 pl-12 pr-4 bg-surface-container-low border border-outline-variant/10 rounded-full text-sm font-medium outline-none focus:border-primary/20 transition-all"
                  />
               </div>

               {/* Segmented Control */}
               <div className="bg-surface-container-low p-1 rounded-full flex items-center w-full md:w-auto md:min-w-[300px] border border-outline-variant/10 shadow-sm">
                 {["Tutti", "Prossimi", "I miei"].map((tab) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all active-scale ${
                       activeTab === tab 
                         ? "bg-surface-container-lowest text-primary shadow-md" 
                         : "text-on-surface-variant/60"
                     }`}
                   >
                     {tab}
                   </button>
                 ))}
               </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <Loader2 size={40} className="animate-spin text-primary opacity-20" />
               <p className="text-on-surface-variant text-sm font-bold">Caricamento eventi...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4 bg-surface-container-low rounded-ios-lg border-2 border-dashed border-outline-variant/30 mt-8"
            >
               <Calendar size={48} className="text-on-surface-variant opacity-20" />
               <p className="text-on-surface-variant text-sm font-bold">Nessun evento trovato.</p>
               <button onClick={() => {setSearchQuery(""); setActiveTab("Tutti")}} className="text-primary font-bold text-xs underline">Resetta filtri</button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
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
