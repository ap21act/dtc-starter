"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { updateShippingMethod } from "@lib/data/cart"

// Default shipping methods if none are available
const DEFAULT_METHODS = [
  { id: "next-day", name: "Next Day UK Delivery", amount: 695 },
  { id: "collect", name: "Click & Collect", amount: 0 },
]

export default function DeliveryStep({
  cart,
  onBack,
  onNext,
}: {
  cart: HttpTypes.StoreCart
  onBack: () => void
  onNext: () => void
}) {
  const [selectedTab, setSelectedTab] = useState(0)
  const [fullName, setFullName] = useState("")
  const [address1, setAddress1] = useState("")
  const [address2, setAddress2] = useState("")
  const [city, setCity] = useState("")
  const [postcode, setPostcode] = useState("")
  const [updating, setUpdating] = useState(false)

  const isComplete = fullName && address1 && city && postcode
  const shippingMethods = (cart.shipping_methods && cart.shipping_methods.length > 0)
    ? cart.shipping_methods
    : DEFAULT_METHODS

  const handleTabChange = async (index: number) => {
    setSelectedTab(index)
    const method = shippingMethods[index]
    if (method?.id) {
      setUpdating(true)
      try {
        await updateShippingMethod(method.id)
      } catch (err) {
        console.error("Failed to update shipping method:", err)
      } finally {
        setUpdating(false)
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Delivery Tabs */}
      <div className="space-y-4">
        <div className="flex gap-4 border-b border-border">
          {shippingMethods.map((method, index) => (
            <button
              key={method.id}
              onClick={() => handleTabChange(index)}
              disabled={updating}
              className={`flex-1 py-4 font-bold uppercase tracking-wider text-sm transition-all ${
                selectedTab === index
                  ? "text-navy border-b-2 border-secondary-container"
                  : "text-on-surface-variant hover:text-navy border-b-2 border-transparent"
              } disabled:opacity-50`}
            >
              <div className="flex flex-col items-center gap-1">
                <span>{method.name}</span>
                <span className="text-xs font-normal">
                  {method.amount === 0 ? "FREE" : `£${(method.amount / 100).toFixed(2)}`}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {shippingMethods.length > selectedTab && (
          <div className="p-6 bg-surface-container-low border border-border rounded-sm space-y-4">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary-container text-4xl shrink-0">
                {selectedTab === 0 ? "local_shipping" : "location_on"}
              </span>
              <div className="flex-grow">
                <h3 className="font-bold text-lg text-navy mb-2">
                  {shippingMethods[selectedTab].name}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {selectedTab === 0
                    ? "Order by 4pm for next working day delivery across the UK"
                    : "Pick up your order at a local location within 1 hour"}
                </p>
                <p className="text-lg font-bold text-secondary mt-4">
                  {shippingMethods[selectedTab].amount === 0
                    ? "FREE"
                    : `£${(shippingMethods[selectedTab].amount / 100).toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Form */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-border pb-2">
          Shipping Address
        </h3>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase">
            Full Name / Site Contact
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-border px-3 py-2 focus:ring-1 focus:ring-secondary focus:border-secondary text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase">
            Address Line 1
          </label>
          <input
            type="text"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            className="w-full border border-border px-3 py-2 focus:ring-1 focus:ring-secondary focus:border-secondary text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            className="w-full border border-border px-3 py-2 focus:ring-1 focus:ring-secondary focus:border-secondary text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-border px-3 py-2 focus:ring-1 focus:ring-secondary focus:border-secondary text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase">
              Postcode
            </label>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className="w-full border border-border px-3 py-2 focus:ring-1 focus:ring-secondary focus:border-secondary text-sm"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={onBack}
          disabled={updating}
          className="flex-1 border border-navy text-navy font-bold py-3 uppercase tracking-wider hover:bg-navy hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isComplete || updating}
          className="flex-1 bg-navy text-white font-bold py-3 uppercase tracking-wider hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}
