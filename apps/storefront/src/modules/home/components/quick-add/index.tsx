"use client"

import { useState } from "react"
import { addToCart } from "@lib/data/cart"
import { useParams } from "next/navigation"

export default function QuickAdd({
  variantId,
  disabled,
}: {
  variantId: string | undefined
  disabled?: boolean
}) {
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  const handleAdd = async () => {
    if (!variantId) return
    setAdding(true)
    await addToCart({ variantId, quantity: qty, countryCode })
    setAdding(false)
  }

  return (
    <div className="mt-6 grid grid-cols-4 gap-1">
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
        className="col-span-1 border border-border text-center font-semibold py-2 focus:ring-1 focus:ring-secondary focus:border-secondary bg-white text-sm"
      />
      <button
        onClick={handleAdd}
        disabled={disabled || adding || !variantId}
        className="col-span-3 bg-navy text-white font-bold py-2 hover:bg-secondary transition-colors uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {adding ? "Adding…" : "Add to Basket"}
      </button>
    </div>
  )
}
