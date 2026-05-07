"use client"

import React from "react"
import { motion } from "framer-motion"

export default function DiscoverCard() {
  return (
    <motion.div 
      whileTap={{ scale: 0.97 }}
      className="rounded-ios-xl overflow-hidden relative h-[280px] group cursor-pointer"
    >
      <img 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop" 
        alt="Discover new events"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
        <h4 className="text-white text-2xl font-bold tracking-tight">Scopri nuovi eventi</h4>
        <p className="text-white/60 text-sm mt-1">Esplora la nostra community</p>
      </div>
    </motion.div>
  )
}
