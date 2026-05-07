"use client"

import React from "react"
import { ChevronLeft, Lock, Eye, Key, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import PageTransition from "@/components/PageTransition"

export default function PrivacyPage() {
  const router = useRouter()

  const privacyItems = [
    { icon: <Eye size={20} />, label: "Visibilità Profilo", description: "Chi può vedere la tua attività", value: "Tutti" },
    { icon: <Lock size={20} />, label: "Dati Personali", description: "Gestisci i dati salvati su Firebase", value: "" },
    { icon: <Key size={20} />, label: "Accesso Google", description: "Gestisci le autorizzazioni app", value: "" },
    { icon: <ShieldAlert size={20} />, label: "Autenticazione a 2 Fattori", description: "Aumenta la sicurezza dell'account", value: "Attiva" },
  ]

  return (
    <PageTransition>
      <div className="flex-1 min-h-screen flex flex-col bg-surface-container-lowest overflow-x-hidden pb-44">
        <header className="pt-16 px-margin-page pb-8 md:pt-24 lg:pt-32">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => router.back()} className="p-2 hover:bg-surface-container rounded-full active-scale">
              <ChevronLeft size={24} />
            </button>
            <span className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Sicurezza</span>
          </div>
          <h1 className="text-[40px] md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-primary leading-tight">Privacy</h1>
        </header>

      <main className="px-margin-page space-y-8 max-w-4xl">
        <div className="bg-surface-container-low rounded-ios-lg overflow-hidden border border-outline-variant/10 shadow-sm">
          {privacyItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 border-b border-outline-variant/5 last:border-none hover:bg-surface-container/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-surface rounded-xl text-primary shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-primary">{item.label}</h3>
                  <p className="text-sm text-on-surface-variant">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary/40 uppercase">{item.value}</span>
                <ChevronLeft size={20} className="rotate-180 text-on-surface-variant" />
              </div>
            </div>
          ))}
        </div>

        <section className="bg-primary/5 p-8 rounded-ios-lg border border-primary/10">
          <h2 className="text-xl font-bold tracking-tight text-primary mb-4">I tuoi dati sono al sicuro</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
            Utilizziamo Firebase come database sicuro per proteggere le tue prenotazioni e il tuo profilo. 
            Il tuo calendario Google viene sincronizzato solo per gli eventi che decidi esplicitamente di aggiungere.
          </p>
          <button className="text-primary font-bold text-sm underline active-scale">
            Leggi la nostra Privacy Policy completa
          </button>
        </section>
      </main>
      </div>
    </PageTransition>
  )
}
