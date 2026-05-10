import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  doc,
  getDoc,
  orderBy,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { db } from "./firebase";

export interface OfflyEvent {
  id?: string;
  title: string;
  description: string;
  location: string;
  startTime: any; // Can be string or Timestamp
  endTime: any;   // Can be string or Timestamp
  image: string;  // Normalized field (mapped from imageUrl or image)
  imageUrl?: string; // New DB field
  type: string;
  capacity: number;
  joinedCount: number; // Normalized field (mapped from attendeeUIDs.length or joinedCount)
  attendeeUIDs?: string[]; // New DB field
  badgeText?: string;   // New DB field
  createdAt?: any;
}

export async function getEvents() {
  const eventsQuery = query(collection(db, "events"), orderBy("startTime", "asc"));
  const querySnapshot = await getDocs(eventsQuery);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    const attendeeUIDs = data.attendeeUIDs || [];
    const joinedCount = data.attendeeUIDs ? attendeeUIDs.length : (data.joinedCount || 0);
    const capacity = data.capacity || 20;
    
    return {
      id: doc.id,
      ...data,
      // Normalizzazione campi per compatibilità web
      image: data.imageUrl || data.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
      joinedCount,
      badgeText: data.badgeText || (joinedCount >= capacity ? "Sold Out" : undefined),
    } as OfflyEvent;
  });
}

export async function createBooking(userId: string, eventId: string) {
  // 1. Create booking record
  const booking = await addDoc(collection(db, "bookings"), {
    userId,
    eventId,
    timestamp: Timestamp.now(),
    status: 'confirmed'
  });

  // 2. Update attendeeUIDs in event document
  const eventRef = doc(db, "events", eventId);
  await updateDoc(eventRef, {
    attendeeUIDs: arrayUnion(userId)
  });

  return booking;
}

export async function addEvent(eventData: Omit<OfflyEvent, 'id' | 'createdAt' | 'image' | 'joinedCount'>) {
  // Normalizzazione orari per Firestore (Timestamp)
  const startTime = eventData.startTime instanceof Date ? eventData.startTime : new Date(eventData.startTime);
  const endTime = eventData.endTime instanceof Date ? eventData.endTime : new Date(eventData.endTime);

  return await addDoc(collection(db, "events"), {
    ...eventData,
    startTime: Timestamp.fromDate(startTime),
    endTime: Timestamp.fromDate(endTime),
    imageUrl: eventData.imageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
    attendeeUIDs: [],
    createdAt: Timestamp.now()
  });
}
