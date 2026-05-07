"use client"

import React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface TabBarIconProps {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
}

export default function TabBarIcon({ icon, label, href, active = false }: TabBarIconProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center transition-all duration-300",
        active ? "scale-105" : "text-on-surface-variant/60 hover:text-on-surface-variant"
      )}
    >
      <div className={cn(
        "flex items-center justify-center rounded-full w-12 h-12 transition-all duration-300",
        active ? "bg-primary text-on-primary shadow-lg" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[10px] font-bold mt-1 transition-opacity duration-300",
        active ? "opacity-100" : "opacity-0"
      )}>
        {label}
      </span>
    </Link>
  )
}
