import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const isProd = process.env.NEXT_PUBLIC_ENV === "production";

const firebaseConfig = {
  apiKey: isProd ? process.env.NEXT_PUBLIC_PROD_API_KEY : process.env.NEXT_PUBLIC_DEV_API_KEY,
  authDomain: isProd ? process.env.NEXT_PUBLIC_PROD_AUTH_DOMAIN : process.env.NEXT_PUBLIC_DEV_AUTH_DOMAIN,
  projectId: isProd ? process.env.NEXT_PUBLIC_PROD_PROJECT_ID : process.env.NEXT_PUBLIC_DEV_PROJECT_ID,
  storageBucket: isProd ? process.env.NEXT_PUBLIC_PROD_STORAGE_BUCKET : process.env.NEXT_PUBLIC_DEV_STORAGE_BUCKET,
  messagingSenderId: isProd ? process.env.NEXT_PUBLIC_PROD_MESSAGING_SENDER_ID : process.env.NEXT_PUBLIC_DEV_MESSAGING_SENDER_ID,
  appId: isProd ? process.env.NEXT_PUBLIC_PROD_APP_ID : process.env.NEXT_PUBLIC_DEV_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

export { app, auth, db, storage, googleProvider };
