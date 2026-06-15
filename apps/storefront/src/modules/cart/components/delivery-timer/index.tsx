"use client"

import { useEffect, useState } from "react"

function getTimeUntilCutoff(): { hours: number; minutes: number; tomorrow: string } {
  const now = new Date()
  const cutoff = new Date()
  cutoff.setHours(16, 0, 0, 0) // 4pm dispatch cutoff

  if (now >= cutoff) {
    // Past cutoff — count to 4pm tomorrow
    cutoff.setDate(cutoff.getDate() + 1)
  }

  const diff = cutoff.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  // Delivery = next working day after cutoff
  const delivery = new Date(cutoff)
  delivery.setDate(delivery.getDate() + 1)
  // Skip weekend
  if (delivery.getDay() === 6) delivery.setDate(delivery.getDate() + 2)
  if (delivery.getDay() === 0) delivery.setDate(delivery.getDate() + 1)

  const tomorrow = delivery.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })

  return { hours, minutes, tomorrow }
}

export default function DeliveryTimer() {
  const [time, setTime] = useState(getTimeUntilCutoff())

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeUntilCutoff()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-start gap-3 mt-6 pt-6 border-t border-border">
      <span className="material-symbols-outlined text-navy mt-0.5">event_available</span>
      <div>
        <p className="font-bold text-sm uppercase text-navy">Estimated Delivery</p>
        <p className="text-sm text-on-surface-variant mt-1">
          Order within{" "}
          <span className="font-bold text-navy">
            {time.hours}h {time.minutes}m
          </span>{" "}
          for delivery on{" "}
          <span className="font-bold text-navy">{time.tomorrow}</span>.
        </p>
      </div>
    </div>
  )
}
