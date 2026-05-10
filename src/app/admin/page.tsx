"use client"

import React, { useState, useEffect } from "react"
import { Plus, Users, Calendar, Activity, ChevronLeft, Save, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { addEvent, getEvents, OfflyEvent } from "@/lib/firestore"
import { useAuth } from "@/context/AuthContext"
import LoadingScreen from "@/components/LoadingScreen"
import PageTransition from "@/components/PageTransition"

export default function AdminPage() {
  const { isAdmin, loading } = useAuth()
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/home")
    }
  }, [isAdmin, loading, router])

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    date: "",
    time: "",
    description: "",
    type: "Workshop",
    capacity: 20,
    image: "" // Nuovo campo immagine
  })

  const [events, setEvents] = useState<OfflyEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  const fetchEventsData = async () => {
    setLoadingEvents(true)
    try {
      const data = await getEvents()
      setEvents(data)
      setEventCount(data.length)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingEvents(false)
    }
  }

  useEffect(() => {
    fetchEventsData()
  }, [])

  if (loading) return <LoadingScreen />
  if (!isAdmin) return null

  const handleSave = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      alert("Per favore, compila i campi obbligatori (Titolo, Data, Orario).")
      return
    }

    setIsSaving(true)
    try {
      const startTime = `${formData.date}T${formData.time}:00`
      const [h, m] = formData.time.split(':')
      const endTime = `${formData.date}T${(parseInt(h) + 1).toString().padStart(2, '0')}:${m}:00`
      
      const eventData = {
        title: formData.title,
        location: formData.location || "TBD",
        startTime,
        endTime,
        description: formData.description || "Nessuna descrizione fornita.",
        type: formData.type,
        capacity: Number(formData.capacity) || 20,
        joinedCount: 0,
        image: formData.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop"
      }

      await addEvent(eventData)
      
      setIsAddingEvent(false)
      alert("Evento creato con successo!")
      fetchEventsData() // Ricarica la lista
      setFormData({
        title: "",
        location: "",
        date: "",
        time: "",
        description: "",
        type: "Workshop",
        capacity: 20,
        image: ""
      })
    } catch (error: any) {
      console.error("Save error:", error)
      alert(`Errore nella creazione dell'evento: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const stats = [
    { icon: <Users size={24} />, label: "Utenti Totali", value: "1" },
    { icon: <Calendar size={24} />, label: "Eventi Creati", value: events.length.toString() },
    { icon: <Activity size={24} />, label: "Status Sistema", value: "Online" },
  ]

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col bg-surface-container-lowest overflow-x-hidden pb-44">
        <header className="pt-16 px-margin-page pb-8 flex justify-between items-end md:pt-24 lg:pt-32">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => router.back()} className="p-1 hover:bg-surface-container rounded-full transition-colors">
                <ChevronLeft size={20} />
              </button>
              <span className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Pannello Controllo</span>
            </div>
            <h1 className="text-[40px] md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-primary leading-tight">Admin</h1>
          </div>
          {!isAddingEvent && (
            <button 
              onClick={() => setIsAddingEvent(true)}
              className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg active-scale"
            >
              <Plus size={24} />
            </button>
          )}
        </header>

        <main className="px-margin-page space-y-8">
          <AnimatePresence mode="wait">
            {isAddingEvent ? (
              <motion.section
                key="add-event"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-surface-container-low p-8 rounded-ios-lg space-y-6 shadow-sm border border-outline-variant/10 max-w-4xl">
                  <h2 className="text-2xl font-bold tracking-tight">Crea Nuovo Evento</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Titolo Evento</label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Es. Yoga al Tramonto" 
                        className="w-full h-14 bg-surface rounded-2xl px-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Luogo</label>
                      <input 
                        type="text" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Es. Parco Sempione" 
                        className="w-full h-14 bg-surface rounded-2xl px-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Data</label>
                      <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full h-14 bg-surface rounded-2xl px-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Orario</label>
                      <input 
                        type="time" 
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full h-14 bg-surface rounded-2xl px-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" 
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">URL Immagine (Opzionale)</label>
                      <input 
                        type="text" 
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        placeholder="https://images.unsplash.com/..." 
                        className="w-full h-14 bg-surface rounded-2xl px-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4 md:max-w-md">
                    <button 
                      onClick={() => setIsAddingEvent(false)} 
                      disabled={isSaving}
                      className="flex-1 h-16 rounded-full font-bold bg-surface-container-highest text-primary active-scale disabled:opacity-50"
                    >
                      Annulla
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-2 h-16 rounded-full font-bold bg-primary text-on-primary flex items-center justify-center gap-2 active-scale shadow-lg disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                      Salva Evento
                    </button>
                  </div>
                </div>
              </motion.section>
            ) : (
              <motion.div
                key="stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-surface-container-low p-8 rounded-ios-lg flex flex-col items-center justify-center gap-4 border border-outline-variant/5 shadow-sm">
                      <div className="text-primary p-4 bg-surface rounded-2xl shadow-sm">{stat.icon}</div>
                      <div className="text-center">
                        <div className="text-4xl font-black tracking-tighter">{stat.value}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* Quick Actions */}
                  <section className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight px-2">Azioni Rapide</h2>
                    <div className="grid grid-cols-1 gap-4">
                      <button onClick={() => setIsAddingEvent(true)} className="flex items-center gap-4 p-6 bg-primary text-on-primary rounded-2xl active-scale shadow-lg">
                        <Plus size={24} />
                        <span className="font-bold text-lg">Nuovo Evento</span>
                      </button>
                    </div>
                  </section>
                  
                  {/* Events List */}
                  <section className="space-y-4 pb-8">
                     <h2 className="text-xl font-bold tracking-tight px-2">I tuoi eventi</h2>
                     {loadingEvents ? (
                       <div className="flex justify-center py-10">
                         <Loader2 className="animate-spin text-primary opacity-20" size={32} />
                       </div>
                     ) : events.length === 0 ? (
                       <div className="p-12 text-center bg-surface-container-low rounded-ios-lg border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-2">
                          <Calendar size={32} className="text-on-surface-variant opacity-20 mb-2" />
                          <p className="text-on-surface-variant text-sm font-medium">Nessun evento creato.</p>
                          <button onClick={() => setIsAddingEvent(true)} className="text-primary font-bold text-xs mt-2 underline">Crea il primo evento</button>
                       </div>
                     ) : (
                       <div className="space-y-3">
                         {events.map((event) => (
                           <div key={event.id} className="flex items-center justify-between p-5 bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-sm">
                             <div className="flex flex-col">
                               <span className="font-bold text-primary">{event.title}</span>
                               <span className="text-xs text-on-surface-variant font-medium">{event.location}</span>
                             </div>
                             <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-full border border-outline-variant/5">
                               <Users size={14} className="text-primary" />
                               <span className="text-sm font-black">{event.joinedCount}</span>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                  </section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </PageTransition>
  )
}
