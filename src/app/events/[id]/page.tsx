"use client"

import React, { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Share2, Calendar as CalendarIcon, MapPin, Users, Bolt, Heart, Check } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { addEventToGoogleCalendar } from "@/lib/calendar"
import { cn, formatDate } from "@/lib/utils"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createBooking, OfflyEvent } from "@/lib/firestore"
import LoadingScreen from "@/components/LoadingScreen"

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, accessToken } = useAuth()
  const [eventDetails, setEventDetails] = useState<OfflyEvent | null>(null)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [isBooked, setIsBooked] = useState(false)

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // 1. Fetch event details
        const docRef = doc(db, "events", id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setEventDetails({ id: docSnap.id, ...docSnap.data() } as OfflyEvent)
        }

        // 2. Check if user already booked this event
        if (user) {
          const q = query(
            collection(db, "bookings"), 
            where("userId", "==", user.uid), 
            where("eventId", "==", id)
          )
          const bookingSnap = await getDocs(q)
          if (!bookingSnap.empty) {
            setIsBooked(true)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingEvent(false)
      }
    }
    fetchEventData()
  }, [id, user])

  const handleBooking = async () => {
    if (!user) {
      router.push('/')
      return
    }

    if (!accessToken) {
      alert("Token di accesso scaduto. Per favore, effettua nuovamente l'accesso.")
      return
    }

    setIsBooking(true)
    try {
      if (!eventDetails) throw new Error("Evento non trovato")

      // 1. Add to Google Calendar
      await addEventToGoogleCalendar(accessToken, {
        title: `Offly: ${eventDetails.title}`,
        description: eventDetails.description,
        location: eventDetails.location,
        startTime: eventDetails.startTime,
        endTime: eventDetails.endTime,
      })

      // 2. Add to Firestore 'bookings'
      await createBooking(user.uid, id)
      
      setIsBooked(true)
      alert("Prenotazione confermata e aggiunta al calendario!")
    } catch (error) {
      console.error("Booking error:", error)
      alert("Si è verificato un errore durante la prenotazione.")
    } finally {
      setIsBooking(false)
    }
  }

  if (loadingEvent) return <LoadingScreen />
  if (!eventDetails) return <div>Evento non trovato</div>

  const progressValue = (eventDetails.joinedCount / eventDetails.capacity) * 100

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-x-hidden md:flex-row md:items-start relative">
      {/* Desktop Back Button (Floating) */}
      <button 
        onClick={() => router.back()} 
        className="hidden md:flex fixed top-8 left-8 z-[60] w-12 h-12 bg-white/80 backdrop-blur-md rounded-full items-center justify-center text-primary shadow-lg active-scale hover:bg-white transition-all border border-black/5"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Mobile Top Bar */}
      <nav className="fixed top-0 w-full z-50 glass h-16 flex items-center justify-between px-margin-page md:hidden">
        <button onClick={() => router.back()} className="p-2 active-scale text-primary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-extrabold tracking-tighter text-primary">Dettagli</h1>
        <button className="p-2 active-scale text-primary">
          <Share2 size={24} />
        </button>
      </nav>

      {/* Hero Image - Desktop Left Column */}
      <div className="w-full h-[45vh] md:h-screen md:w-1/2 sticky top-0 overflow-hidden">
        <img 
          alt={eventDetails.title} 
          className="w-full h-full object-cover" 
          src={eventDetails.image} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent md:hidden" />
      </div>

      {/* Content Canvas - Desktop Right Column */}
      <main className="flex-1 px-margin-page pt-8 pb-40 md:pt-32 md:pb-32 space-y-8 -mt-12 md:mt-0 relative z-10 md:z-auto bg-surface md:bg-transparent rounded-t-ios-xl md:rounded-none">
        {/* Header Info */}
        <header className="space-y-4">
          <div className="inline-flex px-3 py-1 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest">
            {eventDetails.type}
          </div>
          <h2 className="text-[40px] md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-primary leading-tight">
            {eventDetails.title}
          </h2>
          <div className="flex flex-col md:flex-row gap-4 text-on-surface-variant">
            <div className="flex items-center gap-2">
              <CalendarIcon size={20} className="text-primary" />
              <span className="font-bold">{formatDate(eventDetails.startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              <span className="font-medium">{eventDetails.location}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Description */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-primary border-b border-surface-container pb-2">
                Descrizione
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                {eventDetails.description}
              </p>
            </section>
          </div>

          <div className="space-y-8">
            {/* Capacity Section */}
            <section className="bg-surface-container-low rounded-ios-lg p-6 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Posti Disponibili</span>
                <span className="text-2xl font-black text-primary">
                  {eventDetails.joinedCount}/{eventDetails.capacity} <span className="text-sm font-medium text-on-surface-variant">iscritti</span>
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressValue}%` }}
                  className="h-full bg-primary rounded-full" 
                />
              </div>
              <p className="text-sm text-on-surface-variant italic">
                Affrettati, restano solo pochi posti per questo evento esclusivo.
              </p>
            </section>
            
            {/* Desktop Action Section (Instead of sticky bar) */}
            <div className="hidden md:flex flex-col gap-4">
               <button 
                disabled={isBooking || isBooked}
                onClick={handleBooking}
                className={cn(
                  "w-full h-16 rounded-full font-bold text-lg flex items-center justify-center gap-2 active-scale shadow-xl transition-all",
                  isBooked ? "bg-green-500 text-white" : "bg-primary text-on-primary shadow-black/10"
                )}
              >
                {isBooking ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isBooked ? (
                  <>
                    <span>Prenotato con successo</span>
                    <Check size={20} />
                  </>
                ) : (
                  <>
                    <span>Iscriviti Ora</span>
                    <Bolt size={20} fill="currentColor" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-margin-page glass border-t border-surface-container md:hidden">
        <div className="max-w-md mx-auto flex gap-4">
          <button 
            disabled={isBooking || isBooked}
            onClick={handleBooking}
            className={cn(
              "flex-1 h-16 rounded-full font-bold text-lg flex items-center justify-center gap-2 active-scale shadow-xl transition-all",
              isBooked ? "bg-green-500 text-white" : "bg-primary text-on-primary shadow-black/10"
            )}
          >
            {isBooking ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isBooked ? (
              <>
                <span>Prenotato!</span>
                <Check size={20} />
              </>
            ) : (
              <>
                <span>Iscriviti</span>
                <Bolt size={20} fill="currentColor" />
              </>
            )}
          </button>
          <button className="w-16 h-16 rounded-full border-2 border-primary text-primary flex items-center justify-center active-scale">
            <Heart size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}
