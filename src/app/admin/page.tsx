"use client"

import React, { useState, useEffect, useRef } from "react"
import { Plus, Users, Calendar, Activity, ChevronLeft, Save, Loader2, Trash2, Edit3, Search, Image as ImageIcon, Link as LinkIcon, Upload } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { addEvent, getEvents, OfflyEvent, deleteEvent, updateEvent, uploadEventImage } from "@/lib/firestore"
import { useAuth } from "@/context/AuthContext"
import LoadingScreen from "@/components/LoadingScreen"
import PageTransition from "@/components/PageTransition"

export default function AdminPage() {
  const { isAdmin, loading } = useAuth()
  const [adminMode, setAdminMode] = useState<"list" | "create" | "edit">("list")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [imageSource, setImageSource] = useState<"link" | "file">("link")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    date: "",
    time: "",
    description: "",
    type: "Workshop",
    capacity: 20,
    image: "" 
  })

  const [events, setEvents] = useState<OfflyEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  const fetchEventsData = async () => {
    setLoadingEvents(true)
    try {
      const data = await getEvents()
      setEvents(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingEvents(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      if (!isAdmin) {
        // Not admin - redirect to login
        router.push("/admin/login")
      } else {
        // Is admin - load events
        fetchEventsData()
      }
    }
  }, [isAdmin, loading, router])

  if (loading) return <LoadingScreen />
  if (!isAdmin) return null

  const handleEdit = (event: OfflyEvent) => {
    const start = event.startTime.toDate ? event.startTime.toDate() : new Date(event.startTime)
    const date = start.toISOString().split('T')[0]
    const time = start.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

    setFormData({
      title: event.title,
      location: event.location,
      date,
      time,
      description: event.description,
      type: event.type,
      capacity: event.capacity,
      image: event.imageUrl || event.image || ""
    })
    setEditingId(event.id || null)
    setAdminMode("edit")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare l'evento?")) return
    try {
      await deleteEvent(id)
      fetchEventsData()
    } catch (err) { console.error(err) }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsSaving(true)
    try {
      const url = await uploadEventImage(file)
      setFormData({ ...formData, image: url })
    } catch (err) { alert("Errore caricamento") } finally { setIsSaving(false) }
  }

  const handleSave = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      alert("Compila i campi obbligatori.")
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
        description: formData.description || "",
        type: formData.type,
        capacity: Number(formData.capacity) || 20,
        imageUrl: formData.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b"
      }

      if (adminMode === "edit" && editingId) {
        await updateEvent(editingId, eventData)
      } else {
        await addEvent(eventData as any)
      }
      
      setAdminMode("list")
      setEditingId(null)
      fetchEventsData()
      setFormData({ title: "", location: "", date: "", time: "", description: "", type: "Workshop", capacity: 20, image: "" })
    } catch (error: any) { alert(`Errore: ${error.message}`) } finally { setIsSaving(false) }
  }

  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col bg-surface-container-lowest overflow-x-hidden pb-44">
        <header className="pt-16 px-margin-page pb-8 flex justify-between items-end md:pt-24 lg:pt-32">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => adminMode === "list" ? router.back() : setAdminMode("list")} className="p-1 hover:bg-surface-container rounded-full transition-colors">
                <ChevronLeft size={20} />
              </button>
              <span className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Pannello Controllo</span>
            </div>
            <h1 className="text-[40px] md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-primary leading-tight">Admin</h1>
          </div>
          {adminMode === "list" && (
            <button onClick={() => setAdminMode("create")} className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg active-scale">
              <Plus size={24} />
            </button>
          )}
        </header>

        <main className="px-margin-page space-y-8">
          <AnimatePresence mode="wait">
            {adminMode !== "list" ? (
              <motion.section key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="bg-surface-container-low p-8 rounded-ios-lg space-y-6 shadow-sm border border-outline-variant/10 max-w-4xl">
                  <h2 className="text-2xl font-bold tracking-tight">{adminMode === "edit" ? "Modifica Evento" : "Crea Nuovo Evento"}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Titolo</label><input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full h-14 bg-surface rounded-2xl px-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Luogo</label><input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full h-14 bg-surface rounded-2xl px-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Data</label><input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full h-14 bg-surface rounded-2xl px-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" /></div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Orario</label><input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full h-14 bg-surface rounded-2xl px-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Posti Max</label><input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} className="w-full h-14 bg-surface rounded-2xl px-6 border-2 border-primary/20 focus:border-primary outline-none font-bold text-lg transition-all" /></div>
                    </div>
                    
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center justify-between"><label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Immagine</label><div className="flex bg-surface-container rounded-full p-1 text-[10px] font-bold"><button onClick={() => setImageSource("link")} className={cn("px-4 py-1.5 rounded-full transition-all", imageSource === "link" ? "bg-primary text-on-primary" : "text-on-surface-variant")}>Link</button><button onClick={() => setImageSource("file")} className={cn("px-4 py-1.5 rounded-full transition-all", imageSource === "file" ? "bg-primary text-on-primary" : "text-on-surface-variant")}>Upload</button></div></div>
                      {imageSource === "link" ? (<input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} placeholder="https://..." className="w-full h-14 bg-surface rounded-2xl px-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" />) : (<div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-container transition-all"><input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" /><Upload size={24} className="text-on-surface-variant opacity-40" /><span className="text-sm font-bold text-on-surface-variant">Clicca per caricare</span>{formData.image && <span className="text-[10px] text-green-600 font-bold">Immagine caricata!</span>}</div>)}
                    </div>
                    <div className="space-y-1 md:col-span-2"><label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Descrizione</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full h-32 bg-surface rounded-2xl p-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all resize-none" /></div>
                  </div>
                  <div className="flex gap-4 pt-4"><button onClick={() => setAdminMode("list")} disabled={isSaving} className="flex-1 h-16 rounded-full font-bold bg-surface-container-highest text-primary">Annulla</button><button onClick={handleSave} disabled={isSaving} className="flex-2 h-16 rounded-full font-bold bg-primary text-on-primary flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}{adminMode === "edit" ? "Aggiorna" : "Salva"}</button></div>
                </div>
              </motion.section>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Stats & List code... */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-surface-container-low p-8 rounded-ios-lg flex flex-col items-center justify-center gap-4 border border-outline-variant/5"><div className="text-primary p-4 bg-surface rounded-2xl shadow-sm"><Users size={24} /></div><div className="text-center"><div className="text-4xl font-black tracking-tighter">{events.length}</div><div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Eventi</div></div></div>
                  <div className="bg-surface-container-low p-8 rounded-ios-lg flex flex-col items-center justify-center gap-4 border border-outline-variant/5"><div className="text-primary p-4 bg-surface rounded-2xl shadow-sm"><Activity size={24} /></div><div className="text-center"><div className="text-4xl font-black tracking-tighter">Live</div><div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Status</div></div></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2"><h2 className="text-2xl font-black tracking-tighter">Eventi</h2><div className="relative w-full max-w-xs"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" /><input type="text" placeholder="Cerca..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-11 pl-12 pr-4 bg-surface-container rounded-full text-sm font-medium outline-none" /></div></div>
                  <div className="space-y-3">
                    {filteredEvents.map(event => (
                      <div key={event.id} className="flex items-center justify-between p-5 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                        <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl overflow-hidden"><img src={event.imageUrl || event.image} className="w-full h-full object-cover" /></div><div className="flex flex-col"><span className="font-bold text-primary">{event.title}</span><span className="text-[10px] text-on-surface-variant font-bold uppercase">{event.location}</span></div></div>
                        <div className="flex items-center gap-2"><div className="px-3 py-1 bg-surface rounded-full text-xs font-black">{event.joinedCount}/{event.capacity}</div><button onClick={() => handleEdit(event)} className="p-2 text-primary"><Edit3 size={18} /></button><button onClick={() => handleDelete(event.id!)} className="p-2 text-red-500"><Trash2 size={18} /></button></div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </PageTransition>
  )
}

function cn(...classes: any[]) { return classes.filter(Boolean).join(" ") }
