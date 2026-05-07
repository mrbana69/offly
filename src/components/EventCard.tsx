"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { MapPin, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface EventCardProps {
  title: string
  time: string
  location: string
  image?: string
  badge?: string
  badgeColor?: string
  className?: string
  onClick?: () => void
}

export default function EventCard({
  title,
  time,
  location,
  image,
  badge,
  badgeColor = "bg-primary text-on-primary",
  className,
  onClick,
}: EventCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "bg-surface-container-low rounded-[32px] p-6 flex flex-col gap-4 cursor-pointer transition-colors hover:bg-surface-container",
        className
      )}
    >
      {image && (
        <div className="relative w-full aspect-[1.54] rounded-2xl overflow-hidden mb-2">
          <img alt={title} className="w-full h-full object-cover" src={image} />
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-2xl font-bold tracking-tight leading-tight">{title}</h3>
          {badge && (
            <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap", badgeColor)}>
              {badge}
            </span>
          )}
        </div>
        
        <div className="flex flex-col gap-1 text-on-surface-variant">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <p className="text-sm font-medium">{formatDate(time)}</p>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <p className="text-sm font-medium">{location}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
