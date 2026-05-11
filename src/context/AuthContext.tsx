"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User, signInWithPopup, signOut, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth, googleProvider, db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"

interface AuthContextType {
  user: User | null
  loading: boolean
  accessToken: string | null
  tokenExpiry: number | null
  isAdmin: boolean
  isDarkMode: boolean
  toggleDarkMode: () => void
  loginWithGoogle: () => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | any>(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null) // timestamp in ms
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
    
    // Don't persist access tokens - they expire and aren't secure to store
    // Tokens should only be used immediately after sign-in
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdmin(true)
          } else {
            setIsAdmin(false)
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const token = credential?.accessToken || null
      // Store token in state only temporarily - it expires after ~1 hour
      // The token should be used immediately for Calendar API calls
      // Do NOT persist to localStorage as expired tokens cause 401 errors
      setAccessToken(token)
      
      // Set token expiry (Google OAuth tokens last ~3600 seconds / 1 hour)
      setTokenExpiry(Date.now() + 3600 * 1000)

      // Create user doc if not exists
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        lastLogin: new Date().toISOString(),
      }, { merge: true })
    } catch (error) {
      console.error("Error signing in with Google", error)
    }
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: name })
      
      // Create user doc
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: name,
        role: "user", // Default role
        createdAt: new Date().toISOString(),
      })

      setUser({ ...result.user, displayName: name })
    } catch (error: any) {
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      throw error
    }
  }

  const logout = async () => {
    try {
      setUser(null)
      setAccessToken(null)
      setTokenExpiry(null)
      localStorage.removeItem("google_access_token")
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out", error)
    }
  }

  const refreshAccessToken = async (): Promise<string | null> => {
    if (!user) {
      console.warn("No user logged in - cannot refresh token");
      return null;
    }

    try {
      console.log("Refreshing access token via backend...");
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Token refresh failed:", error);
        
        if (response.status === 401) {
          // Refresh token expired/invalid - user needs to sign in again
          setAccessToken(null);
          setTokenExpiry(null);
          alert("Your Google session has expired. Please sign in again.");
        }
        return null;
      }

      const data = await response.json();
      const newToken = data.accessToken;
      const expiresIn = data.expiresIn || 3600; // seconds

      if (newToken) {
        setAccessToken(newToken);
        setTokenExpiry(Date.now() + expiresIn * 1000);
        console.log("Access token refreshed successfully");
        return newToken;
      }

      return null;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return null;
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, tokenExpiry, isAdmin, isDarkMode, toggleDarkMode, loginWithGoogle, signUpWithEmail, signInWithEmail, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
