"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"

export default function PaymentStep({
  onBack,
  cart,
}: {
  onBack: () => void
  cart: HttpTypes.StoreCart
}) {
  const [method, setMethod] = useState("card")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    // TODO: Wire up actual payment processing
    setTimeout(() => {
      setIsProcessing(false)
      alert("Order placed! (Demo mode)")
    }, 2000)
  }

  return (
    <div className="space-y-8">
      {/* Payment Methods */}
      <div className="space-y-3">
        {/* Card */}
        <label className="relative cursor-pointer">
          <input
            type="radio"
            name="payment"
            value="card"
            checked={method === "card"}
            onChange={(e) => setMethod(e.target.value)}
            className="sr-only peer"
          />
          <div className={`border p-4 cursor-pointer transition-all peer-checked:border-secondary-container peer-checked:bg-orange-50 ${
            method === "card" ? "border-secondary-container" : "border-border"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Credit / Debit Card</p>
                <p className="text-xs text-on-surface-variant">Visa, Mastercard, AMEX</p>
              </div>
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>credit_card</span>
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>payments</span>
              </div>
            </div>
          </div>
        </label>

        {/* Card details form */}
        {method === "card" && (
          <div className="border-x border-b border-border p-6 bg-surface space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="•••• •••• •••• ••••"
                className="w-full border border-border px-3 py-2 focus:ring-1 focus:ring-secondary focus:border-secondary text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase">Expiry Date</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full border border-border px-3 py-2 focus:ring-1 focus:ring-secondary focus:border-secondary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  className="w-full border border-border px-3 py-2 focus:ring-1 focus:ring-secondary focus:border-secondary text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Trade Account */}
        <label className="relative cursor-pointer">
          <input
            type="radio"
            name="payment"
            value="trade"
            checked={method === "trade"}
            onChange={(e) => setMethod(e.target.value)}
            className="sr-only peer"
          />
          <div className={`border p-4 cursor-pointer transition-all peer-checked:border-secondary-container peer-checked:bg-orange-50 ${
            method === "trade" ? "border-secondary-container" : "border-border"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm uppercase tracking-tight">Pay on Trade Account</p>
                <p className="text-xs text-secondary">30-day interest free credit</p>
              </div>
              <span className="bg-navy text-white text-[10px] font-bold px-2 py-1 rounded-sm">
                VERIFIED ONLY
              </span>
            </div>
          </div>
        </label>

        {/* PayPal */}
        <label className="relative cursor-pointer">
          <input
            type="radio"
            name="payment"
            value="paypal"
            checked={method === "paypal"}
            onChange={(e) => setMethod(e.target.value)}
            className="sr-only peer"
          />
          <div className={`border p-4 cursor-pointer transition-all peer-checked:border-secondary-container peer-checked:bg-orange-50 ${
            method === "paypal" ? "border-secondary-container" : "border-border"
          }`}>
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm">PayPal</p>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>account_balance_wallet</span>
            </div>
          </div>
        </label>
      </div>

      {/* Place Order Button */}
      <div className="pt-6 space-y-4">
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="w-full bg-secondary-container text-navy font-bold py-6 text-lg uppercase tracking-tight hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-b-4 border-black/20"
        >
          {isProcessing ? "Processing..." : "Place Order & Pay"}
        </button>
        <p className="text-center text-xs text-on-surface-variant">
          By placing an order, you agree to our{" "}
          <a href="#" className="underline hover:no-underline">
            Terms &amp; Conditions
          </a>
        </p>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full border border-navy text-navy font-bold py-3 uppercase tracking-wider hover:bg-navy hover:text-white transition-colors"
      >
        Back to Delivery
      </button>
    </div>
  )
}
