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
  arrayUnion,
  deleteDoc,
  documentId
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

export interface OfflyEvent {
  id?: string;
  title: string;
  description: string;
  location: string;
  startTime: any; 
  endTime: any;   
  image: string;  
  imageUrl?: string; 
  type: string;
  capacity: number;
  joinedCount: number; 
  attendeeUIDs?: string[]; 
  badgeText?: string;   
  createdAt?: any;
  coordinates?: { lat: number, lng: number }; // Nuovi campi per mappa
}

export interface Review {
  id?: string;
  eventId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: any;
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
      image: data.imageUrl || data.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
      joinedCount,
      badgeText: data.badgeText || (joinedCount >= capacity ? "Sold Out" : undefined),
    } as OfflyEvent;
  });
}

export async function createBooking(userId: string, eventId: string) {
  const booking = await addDoc(collection(db, "bookings"), {
    userId,
    eventId,
    timestamp: Timestamp.now(),
    status: 'confirmed'
  });

  const eventRef = doc(db, "events", eventId);
  await updateDoc(eventRef, {
    attendeeUIDs: arrayUnion(userId)
  });

  return booking;
}

export async function addEvent(eventData: Omit<OfflyEvent, 'id' | 'createdAt' | 'image' | 'joinedCount'>) {
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

export async function updateEvent(eventId: string, eventData: Partial<OfflyEvent>) {
  const eventRef = doc(db, "events", eventId);
  const updateData: any = { ...eventData };
  
  if (eventData.startTime) {
    const start = eventData.startTime instanceof Date ? eventData.startTime : new Date(eventData.startTime);
    updateData.startTime = Timestamp.fromDate(start);
  }
  if (eventData.endTime) {
    const end = eventData.endTime instanceof Date ? eventData.endTime : new Date(eventData.endTime);
    updateData.endTime = Timestamp.fromDate(end);
  }

  await updateDoc(eventRef, updateData);
}

export async function deleteEvent(eventId: string) {
  const eventRef = doc(db, "events", eventId);
  await deleteDoc(eventRef);
}

export async function getUsersByIds(uids: string[]) {
  if (!uids || uids.length === 0) return [];
  const chunks = [];
  for (let i = 0; i < uids.length; i += 10) {
    chunks.push(uids.slice(i, i + 10));
  }
  const users: any[] = [];
  for (const chunk of chunks) {
    const q = query(collection(db, "users"), where("uid", "in", chunk));
    const snap = await getDocs(q);
    snap.docs.forEach(doc => users.push(doc.data()));
  }
  return users;
}

export async function uploadEventImage(file: File) {
  if (!storage) throw new Error("Storage non inizializzato");
  const storageRef = ref(storage, `events/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// Funzioni per le Recensioni
export async function addReview(reviewData: Omit<Review, 'id' | 'timestamp'>) {
  return await addDoc(collection(db, "reviews"), {
    ...reviewData,
    timestamp: Timestamp.now()
  });
}

export async function getReviews(eventId: string) {
  const q = query(collection(db, "reviews"), where("eventId", "==", eventId), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
}
