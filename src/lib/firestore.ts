import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";

export interface OfflyEvent {
  id?: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  image: string;
  type: string;
  capacity: number;
  joinedCount: number;
}

export async function getEvents() {
  const querySnapshot = await getDocs(collection(db, "events"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as OfflyEvent[];
}

export async function createBooking(userId: string, eventId: string) {
  return await addDoc(collection(db, "bookings"), {
    userId,
    eventId,
    timestamp: Timestamp.now(),
    status: 'confirmed'
  });
}
export async function addEvent(eventData: Omit<OfflyEvent, 'id'>) {
  return await addDoc(collection(db, "events"), eventData);
}
