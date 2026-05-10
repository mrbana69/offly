"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User, signInWithPopup, signOut, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  accessToken: string | null
  isAdmin: boolean
  isDarkMode: boolean
  toggleDarkMode: () => void
  loginWithGoogle: () => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | any>(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
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

  const adminEmails = ["admin@offly.club", "emiliano@offly.club"] // Aggiungi qui gli email admin
  const isAdmin = user ? adminEmails.includes(user.email || "") : false

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const token = credential?.accessToken || null
      setAccessToken(token)
    } catch (error) {
      console.error("Error signing in with Google", error)
    }
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: name })
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
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, isAdmin, isDarkMode, toggleDarkMode, loginWithGoogle, signUpWithEmail, signInWithEmail, logout }}>
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
