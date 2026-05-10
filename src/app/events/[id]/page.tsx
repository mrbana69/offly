"use client"

import React, { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Share2, Calendar as CalendarIcon, MapPin, Users, Bolt, Heart, Check, ShieldCheck, Trash2, Edit3, Mail, Download, Star, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { addEventToGoogleCalendar } from "@/lib/calendar"
import { cn, formatDate } from "@/lib/utils"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createBooking, OfflyEvent, deleteEvent, getUsersByIds, addReview, getReviews, Review } from "@/lib/firestore"
import LoadingScreen from "@/components/LoadingScreen"

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, accessToken, isAdmin } = useAuth()
  const [eventDetails, setEventDetails] = useState<OfflyEvent | null>(null)
  const [attendees, setAttendees] = useState<any[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const docRef = doc(db, "events", id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data();
          const attendeeUIDs = data.attendeeUIDs || [];
          const joinedCount = data.attendeeUIDs ? attendeeUIDs.length : (data.joinedCount || 0);
          const capacity = data.capacity || 20;

          const normalizedEvent = { 
            id: docSnap.id, 
            ...data,
            image: data.imageUrl || data.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
            joinedCount,
            badgeText: data.badgeText || (joinedCount >= capacity ? "Sold Out" : undefined),
            attendeeUIDs 
          } as OfflyEvent;

          setEventDetails(normalizedEvent)
          const reviewsData = await getReviews(id)
          setReviews(reviewsData)

          if (isAdmin && attendeeUIDs.length > 0) {
            const users = await getUsersByIds(attendeeUIDs);
            setAttendees(users);
          }
        }

        if (user && !isAdmin) {
          const q = query(collection(db, "bookings"), where("userId", "==", user.uid), where("eventId", "==", id))
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
  }, [id, user, isAdmin])

  const handleBooking = async () => {
    if (!user) { router.push('/'); return; }
    if (isAdmin) return;
    if (!accessToken) { alert("Token scaduto, effettua il login."); return; }
    
    setIsBooking(true)
    try {
      if (!eventDetails) throw new Error("Evento non trovato")

      // FIX CALENDAR: Convertiamo i timestamp in ISO string pulite
      const startISO = eventDetails.startTime.toDate 
        ? eventDetails.startTime.toDate().toISOString() 
        : new Date(eventDetails.startTime).toISOString();
      
      const endISO = eventDetails.endTime.toDate 
        ? eventDetails.endTime.toDate().toISOString() 
        : new Date(eventDetails.endTime).toISOString();

      await addEventToGoogleCalendar(accessToken, {
        title: `Offly: ${eventDetails.title}`,
        description: eventDetails.description,
        location: eventDetails.location,
        startTime: startISO,
        endTime: endISO,
      })

      await createBooking(user.uid, id)
      setIsBooked(true)
      alert("Prenotazione completata e aggiunta al tuo Google Calendar!")
    } catch (error: any) {
      console.error("Calendar Error Details:", error);
      alert(`Errore durante la prenotazione: ${error.message}`);
    } finally { setIsBooking(false) }
  }

  const handleShare = async () => {
    const shareData = {
      title: `Offly: ${eventDetails?.title}`,
      text: `Guarda questo evento su Offly: ${eventDetails?.title}`,
      url: window.location.href,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch (err) { console.error(err) }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copiato negli appunti!")
    }
  }

  const exportToCSV = () => {
    if (attendees.length === 0) return;
    const headers = ["Nome", "Email", "UID"];
    const rows = attendees.map(a => [a.displayName || "N/A", a.email || "N/A", a.uid]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `partecipanti_${eventDetails?.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleReviewSubmit = async () => {
    if (!user || !eventDetails) return;
    setIsSubmittingReview(true)
    try {
      await addReview({
        eventId: id,
        userId: user.uid,
        userName: user.displayName || "Anonimo",
        rating,
        comment
      })
      setComment("")
      setShowReviewForm(false)
      const updatedReviews = await getReviews(id)
      setReviews(updatedReviews)
      alert("Recensione pubblicata!")
    } catch (err) {
      console.error(err); alert("Errore invio recensione.");
    } finally { setIsSubmittingReview(false) }
  }

  const handleDelete = async () => {
    if (!confirm("Eliminare definitivamente questo evento?")) return
    try {
      await deleteEvent(id)
      router.push('/admin')
    } catch (err) {
      alert("Errore durante l'eliminazione.")
    }
  }

  if (loadingEvent) return <LoadingScreen />
  if (!eventDetails) return <div>Evento non trovato</div>

  const isEventOver = eventDetails.endTime.toDate ? eventDetails.endTime.toDate() < new Date() : new Date(eventDetails.endTime) < new Date();
  const canReview = isBooked && isEventOver && !reviews.some(r => r.userId === user?.uid);
  const progressValue = (eventDetails.joinedCount / eventDetails.capacity) * 100

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-x-hidden md:flex-row md:items-start relative pb-20">
      <button onClick={() => router.back()} className="hidden md:flex fixed top-8 left-8 z-[60] w-12 h-12 bg-white/80 backdrop-blur-md rounded-full items-center justify-center text-primary shadow-lg active-scale hover:bg-white transition-all border border-black/5">
        <ChevronLeft size={24} />
      </button>

      <div className="w-full h-[45vh] md:h-screen md:w-1/2 sticky top-0 overflow-hidden">
        <img alt={eventDetails.title} className="w-full h-full object-cover" src={eventDetails.image} />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent md:hidden" />
      </div>

      <main className="flex-1 px-margin-page pt-8 pb-40 md:pt-32 md:pb-32 space-y-8 -mt-12 md:mt-0 relative z-10 md:z-auto bg-surface md:bg-transparent rounded-t-ios-xl md:rounded-none">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex px-3 py-1 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest">
              {eventDetails.type || "Evento"}
            </div>
            <div className="flex gap-2">
              <button onClick={handleShare} className="p-3 bg-surface-container rounded-full active-scale transition-colors shadow-sm"><Share2 size={20} /></button>
              {isAdmin && (
                <>
                  <button onClick={exportToCSV} className="p-3 bg-green-50 text-green-600 rounded-full active-scale transition-colors hover:bg-green-100 shadow-sm"><Download size={20} /></button>
                  <button onClick={handleDelete} className="p-3 bg-red-50 text-red-600 rounded-full active-scale transition-colors hover:bg-red-100 shadow-sm"><Trash2 size={20} /></button>
                  <button onClick={() => router.push('/admin')} className="p-3 bg-primary text-on-primary rounded-full active-scale shadow-lg"><Edit3 size={20} /></button>
                </>
              )}
            </div>
          </div>
          <h2 className="text-[40px] md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-primary leading-tight">{eventDetails.title}</h2>
          <div className="flex flex-col md:flex-row gap-4 text-on-surface-variant">
            <div className="flex items-center gap-2"><CalendarIcon size={20} className="text-primary" /><span className="font-bold">{formatDate(eventDetails.startTime)}</span></div>
            <div className="flex items-center gap-2"><MapPin size={20} className="text-primary" /><span className="font-medium">{eventDetails.location}</span></div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-primary border-b border-surface-container pb-2">Descrizione</h3>
              <p className="text-on-surface-variant leading-relaxed">{eventDetails.description}</p>
            </section>

            <section className="space-y-6 pt-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2"><Star size={20} className="text-amber-400 fill-amber-400" /> Recensioni ({reviews.length})</h3>
                  {canReview && (
                    <button onClick={() => setShowReviewForm(true)} className="text-xs font-bold text-primary underline">Lascia una recensione</button>
                  )}
               </div>

               <AnimatePresence>
                 {showReviewForm && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6 bg-surface-container-low rounded-2xl space-y-4 border border-primary/10 shadow-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">Com'è andato l'evento?</span>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => (
                            <button key={s} onClick={() => setRating(s)} className="p-1">
                              <Star size={20} className={cn(s <= rating ? "text-amber-400 fill-amber-400" : "text-surface-container-highest")} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Scrivi un commento..." className="w-full h-24 bg-surface rounded-xl p-4 text-sm outline-none border border-outline-variant/20 focus:border-primary/40 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => setShowReviewForm(false)} className="flex-1 h-10 rounded-full font-bold text-xs bg-surface-container text-on-surface-variant">Annulla</button>
                        <button onClick={handleReviewSubmit} disabled={isSubmittingReview || !comment} className="flex-2 h-10 rounded-full font-bold text-xs bg-primary text-on-primary">Invia</button>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <div className="space-y-4">
                  {reviews.length > 0 ? reviews.map(rev => (
                    <div key={rev.id} className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/5">
                       <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-primary">{rev.userName}</span>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => <Star key={s} size={12} className={cn(s <= rev.rating ? "text-amber-400 fill-amber-400" : "text-surface-container-highest")} />)}
                          </div>
                       </div>
                       <p className="text-sm text-on-surface-variant italic leading-relaxed">"{rev.comment}"</p>
                    </div>
                  )) : (
                    <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/20">
                       <MessageSquare size={24} className="mx-auto text-on-surface-variant opacity-20 mb-2" />
                       <p className="text-xs text-on-surface-variant font-medium">Nessuna recensione ancora.</p>
                    </div>
                  )}
               </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-surface-container-low rounded-ios-lg p-6 space-y-4 shadow-sm border border-outline-variant/5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Posti Disponibili</span>
                <span className="text-2xl font-black text-primary">{eventDetails.joinedCount}/{eventDetails.capacity}</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressValue}%` }} className="h-full bg-primary rounded-full" />
              </div>
              <p className="text-sm text-on-surface-variant italic">{eventDetails.badgeText || "Affrettati!"}</p>
            </section>
            
            {isAdmin && attendees.length > 0 && (
              <section className="space-y-4">
                 <h3 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2"><Users size={20} /> Iscritti</h3>
                 <div className="space-y-2">
                    {attendees.map((att, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/10">
                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-xs">{att.displayName?.[0]}</div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{att.displayName}</span>
                          <span className="text-[10px] text-on-surface-variant">{att.email}</span>
                        </div>
                      </div>
                    ))}
                 </div>
              </section>
            )}

            {!isAdmin && (
              <button disabled={isBooking || isBooked} onClick={handleBooking} className={cn("w-full h-16 rounded-full font-bold text-lg flex items-center justify-center gap-2 active-scale shadow-xl transition-all", isBooked ? "bg-green-500 text-white" : "bg-primary text-on-primary shadow-black/10")}>
                {isBooking ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : isBooked ? <><Check size={20} /> Prenotato</> : <><Bolt size={20} fill="currentColor" /> Iscriviti Ora</>}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
