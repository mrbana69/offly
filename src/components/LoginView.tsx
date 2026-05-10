"use client"

import React, { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { LogIn, UserPlus, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function LoginView() {
  const { loginWithGoogle, signUpWithEmail, signInWithEmail } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      if (isSignUp) {
        if (!formData.name) throw new Error("Inserisci il tuo nome")
        await signUpWithEmail(formData.email, formData.password, formData.name)
      } else {
        await signInWithEmail(formData.email, formData.password)
      }
    } catch (err: any) {
      setError(err.message || "Errore durante l'autenticazione")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-surface overflow-hidden">
      {/* Decorative Left Side (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-black relative overflow-hidden group">
        <img 
          alt="Lifestyle" 
          className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-110" 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/20 to-transparent" />
        <div className="absolute bottom-16 left-16 max-w-lg space-y-4">
          <h2 className="text-6xl font-black text-white tracking-tighter leading-tight">
            Vivi il club,<br />senza limiti.
          </h2>
          <p className="text-xl text-white/60 font-medium leading-relaxed">
            Unisciti alla nostra community esclusiva e scopri eventi unici pensati per te.
          </p>
        </div>
      </div>

      {/* Login Side */}
      <div className="flex-1 flex flex-col items-center justify-center px-margin-page py-16 bg-surface z-10 overflow-y-auto">
        <div className="w-full max-w-sm flex flex-col">
          <header className="mb-stack-lg text-center md:text-left">
            <div className="w-20 h-20 bg-surface-container-highest rounded-ios-lg flex items-center justify-center mb-stack-md shadow-sm overflow-hidden animate-float mx-auto md:mx-0">
              <span className="text-3xl font-black">O</span>
            </div>
            <h1 className="text-[40px] md:text-5xl font-extrabold tracking-tighter text-primary leading-tight">
              {isSignUp ? "Registrati" : "Bentornato"}
            </h1>
            <p className="font-medium text-on-surface-variant mt-2">
              {isSignUp ? "Crea un account per iniziare" : "Accedi per esplorare gli eventi"}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Il tuo nome" 
                      className="w-full h-14 bg-surface-container-low rounded-2xl pl-12 pr-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="mail@esempio.com" 
                  className="w-full h-14 bg-surface-container-low rounded-2xl pl-12 pr-6 border border-outline-variant/20 focus:border-primary outline-none font-medium transition-all" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Password</label>
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
              className="w-full h-16 bg-primary text-on-primary rounded-full font-bold text-lg flex items-center justify-center gap-3 active-scale transition-all shadow-lg shadow-black/5 disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  {isSignUp ? "Crea Account" : "Accedi Ora"}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 space-y-4">
            <button
              onClick={loginWithGoogle}
              className="w-full h-14 bg-surface border border-outline-variant/30 text-primary rounded-full font-bold flex items-center justify-center gap-3 active-scale hover:bg-surface-container-low transition-all"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continua con Google
            </button>

            <p className="text-center text-sm font-medium text-on-surface-variant">
              {isSignUp ? "Hai già un account?" : "Non hai un account?"}{" "}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary font-black underline underline-offset-4"
              >
                {isSignUp ? "Accedi" : "Registrati"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
