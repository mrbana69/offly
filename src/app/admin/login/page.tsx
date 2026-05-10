"use client"

import React, { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"
import PageTransition from "@/components/PageTransition"

export default function AdminLoginPage() {
  const { signInWithEmail, isAdmin, user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ email: "", password: "" })
  const router = useRouter()

  // Redirect if already admin
  React.useEffect(() => {
    if (user && isAdmin) {
      router.push("/admin")
    }
  }, [user, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await signInWithEmail(formData.email, formData.password)
      // Check if the user is actually an admin after login
      // Note: isAdmin is calculated in AuthContext based on email
    } catch (err: any) {
      setError("Credenziali non valide o accesso non autorizzato.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-ios-xl p-8 md:p-12 shadow-2xl border border-white/5">
          <button 
            onClick={() => router.push('/')}
            className="mb-8 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold active-scale"
          >
            <ChevronLeft size={16} />
            Torna al sito
          </button>

          <header className="mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-primary leading-tight">Admin Portal</h1>
            <p className="text-on-surface-variant font-medium mt-2">Area riservata agli organizzatori</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email Istituzionale</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="admin@offly.club" 
                  className="w-full h-14 bg-surface-container-low rounded-2xl pl-12 pr-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Password di Sicurezza</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  required
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full h-14 bg-surface-container-low rounded-2xl pl-12 pr-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" 
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-bold px-1">{error}</p>}

            <button
              disabled={loading}
              type="submit"
              className="w-full h-16 bg-primary text-on-primary rounded-full font-bold text-lg flex items-center justify-center gap-3 active-scale transition-all shadow-lg mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  Accedi al Pannello
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <footer className="mt-12 text-center">
            <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">Offly Security Protocol v2.4</p>
          </footer>
        </div>
      </div>
    </PageTransition>
  )
}
