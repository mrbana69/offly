"use client"

import React from "react"
import { motion } from "framer-motion"
import { Calendar, Activity } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import EventCard from "@/components/EventCard"
import PageTransition from "@/components/PageTransition"

import { getEvents, OfflyEvent } from "@/lib/firestore"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [events, setEvents] = React.useState<OfflyEvent[]>([])
  const [loadingEvents, setLoadingEvents] = React.useState(true)

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents()
        // Prendi solo i primi 3 per la home
        setEvents(data.slice(0, 3))
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingEvents(false)
      }
    }
    fetchEvents()
  }, [])

  if (authLoading || !user) return null

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col bg-surface overflow-x-hidden pb-44">
        {/* Header */}
        <header className="pt-16 px-margin-page pb-8 md:pt-24 lg:pt-32">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-on-surface-variant text-sm font-bold uppercase tracking-widest mb-1"
          >
            Bentornato, {user.displayName?.split(' ')[0] || "Utente"}
          </motion.p>
          <h1 className="text-[40px] md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-primary leading-tight">
            Scopri cosa c'è <br className="md:hidden" /> di nuovo
          </h1>
        </header>

        <main className="px-margin-page space-y-12">
          {/* Quick Actions / Activity */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Le tue attività</h2>
              <button onClick={() => router.push('/events')} className="text-primary font-bold text-sm">Vedi tutto</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => router.push('/events')}
                className="bg-surface-container-low p-6 rounded-ios-lg flex items-center gap-4 border border-outline-variant/5 shadow-sm active-scale cursor-pointer"
              >
                <div className="p-3 bg-primary text-on-primary rounded-2xl">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-primary">Prossimi Eventi</h3>
                  <p className="text-sm text-on-surface-variant font-medium">Controlla il calendario</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-surface-container-low p-6 rounded-ios-lg flex items-center gap-4 border border-outline-variant/5 shadow-sm active-scale cursor-pointer"
              >
                <div className="p-3 bg-secondary-container text-on-secondary-container rounded-2xl">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-primary">Esplora Club</h3>
                  <p className="text-sm text-on-surface-variant font-medium">Trova nuove attività</p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Discover Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight">Consigliati per te</h2>
            
            {loadingEvents ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary opacity-20" size={32} />
              </div>
            ) : events.length === 0 ? (
              <p className="text-on-surface-variant text-sm font-medium italic">Nessun evento disponibile al momento.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard 
                    key={event.id}
                    title={event.title} 
                    time={event.startTime} 
                    location={event.location}
                    image={event.image}
                    onClick={() => router.push(`/events/${event.id}`)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </PageTransition>
  )
}
