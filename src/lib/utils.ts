import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateInput: any) {
  if (!dateInput) return ""
  
  try {
    let date: Date

    if (dateInput instanceof Date) {
      date = dateInput
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput)
    } else if (dateInput && typeof dateInput.toDate === 'function') {
      date = dateInput.toDate()
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput)
    } else {
      return String(dateInput)
    }

    if (isNaN(date.getTime())) return String(dateInput)

    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === date.toDateString()

    const time = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    
    if (isToday) return `Oggi, ${time}`
    if (isTomorrow) return `Domani, ${time}`
    
    return date.toLocaleDateString('it-IT', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch (e) {
    return String(dateInput)
  }
}
