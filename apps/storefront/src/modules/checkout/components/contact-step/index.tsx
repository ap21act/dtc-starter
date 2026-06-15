"use client"

import { useState } from "react"

export default function ContactStep({ onNext }: { onNext: () => void }) {
  const [email, setEmail] = useState("")
  const [marketing, setMarketing] = useState(false)

  return (
    <div className="max-w-md space-y-6">
      <div>
        <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. j.smith@construction-uk.com"
          className="w-full border border-border px-4 py-3 focus:ring-1 focus:ring-secondary focus:border-secondary"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="marketing"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          className="w-4 h-4 rounded-sm accent-secondary-container"
        />
        <label htmlFor="marketing" className="text-xs font-medium text-on-surface-variant">
          Keep me updated with trade deals and new tool arrivals.
        </label>
      </div>

      <a href="#" className="text-secondary font-bold text-sm hover:underline">
        Log in to Trade Account →
      </a>

      <button
        onClick={onNext}
        disabled={!email}
        className="w-full bg-navy text-white font-bold py-3 uppercase tracking-wider hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
      >
        Continue to Delivery
      </button>
    </div>
  )
}
