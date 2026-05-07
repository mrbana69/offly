"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ActivityCardProps {
  label: string
  time?: string
  name: string
  className?: string
  onClick?: () => void
}

export default function ActivityCard({
  label,
  time,
  name,
  className,
  onClick,
}: ActivityCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "rounded-ios-xl bg-surface-container-low p-8 flex flex-col justify-between h-[240px] cursor-pointer transition-colors hover:bg-surface-container",
        className
      )}
    >
      <div>
        <h2 className="text-[32px] font-extrabold tracking-tighter text-primary leading-tight">
          {label}
        </h2>
        {time && (
          <p className="text-on-surface-variant text-[15px] font-medium mt-1">
            {time}
          </p>
        )}
      </div>
      <div>
        <h3 className="text-[32px] font-black tracking-tighter text-primary leading-tight">
          {name}
        </h3>
      </div>
    </motion.div>
  )
}
