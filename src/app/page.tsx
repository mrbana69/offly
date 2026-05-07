"use client"

import React, { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import LoginView from "@/components/LoginView"
import { useRouter } from "next/navigation"
import LoadingScreen from "@/components/LoadingScreen"

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push("/home")
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden">
      <LoginView />
    </div>
  )
}
