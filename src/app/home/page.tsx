"use client"

import React from "react"
import { motion } from "framer-motion"
import { Calendar, Activity } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import EventCard from "@/components/EventCard"
import PageTransition from "@/components/PageTransition"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) return null

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
            Bentornato, {user.displayName?.split(' ')[0] || "Ospite"}
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
              <button className="text-primary font-bold text-sm">Vedi tutto</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-surface-container-low p-6 rounded-ios-lg flex items-center gap-4 border border-outline-variant/5 shadow-sm active-scale"
              >
                <div className="p-3 bg-primary text-on-primary rounded-2xl">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-primary">Prossimo Evento</h3>
                  <p className="text-sm text-on-surface-variant font-medium">Yoga - Domani, 18:30</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-surface-container-low p-6 rounded-ios-lg flex items-center gap-4 border border-outline-variant/5 shadow-sm active-scale"
              >
                <div className="p-3 bg-secondary-container text-on-secondary-container rounded-2xl">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-primary">Statistiche Club</h3>
                  <p className="text-sm text-on-surface-variant font-medium">12 attività completate</p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Discover Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight">Consigliati per te</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <EventCard 
                title="Workshop Ceramica" 
                time="Sabato 24 Maggio" 
                location="Spazio Isola, Milano"
                image="https://images.unsplash.com/photo-1565193998248-d500a72183b1?q=80&w=2070&auto=format&fit=crop"
                badge="Nuovo"
                badgeColor="bg-primary text-on-primary"
              />
              <EventCard 
                title="Torneo Padel" 
                time="Domenica 25 Maggio" 
                location="City Padel, Milano"
                image="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070&auto=format&fit=crop"
                badge="Popolare"
              />
            </div>
          </section>
        </main>
      </div>
    </PageTransition>
  )
}
