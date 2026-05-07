"use client"

import React from "react"

export default function LoadingScreen() {
  return (
    <div className="flex-1 h-screen flex flex-col items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-on-surface-variant text-sm font-bold animate-pulse">Caricamento Offly...</p>
    </div>
  )
}
