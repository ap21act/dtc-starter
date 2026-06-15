"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { convertToLocale } from "@lib/util/money"
import ContactStep from "../components/contact-step"
import DeliveryStep from "../components/delivery-step"
import PaymentStep from "../components/payment-step"
import OrderSummary from "../components/order-summary"

type Step = "contact" | "delivery" | "payment"

const STEPS: { id: Step; label: string; number: number }[] = [
  { id: "contact", label: "Contact Details", number: 1 },
  { id: "delivery", label: "Delivery Method", number: 2 },
  { id: "payment", label: "Payment", number: 3 },
]

export default function CheckoutTemplate({ cart }: { cart: HttpTypes.StoreCart }) {
  const [activeStep, setActiveStep] = useState<Step>("contact")
  const currency = cart.currency_code ?? "gbp"
  const fmt = (p: number) => convertToLocale({ amount: p / 100, currency_code: currency })

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-surface border-b border-border py-4 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-8 flex justify-between items-center">
          <div className="font-headline text-2xl font-bold text-navy uppercase tracking-tighter">
            My Toolbox
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-on-surface-variant">
            <span className="material-symbols-outlined">lock</span>
            SECURE CHECKOUT
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Steps */}
          <div className="lg:col-span-8 space-y-6">
            {/* Contact Step */}
            <section
              className={`bg-surface border p-8 transition-all ${
                activeStep === "contact"
                  ? "border-navy shadow-md"
                  : "border-border opacity-60"
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className={`w-8 h-8 flex items-center justify-center font-bold rounded-sm ${
                  activeStep === "contact"
                    ? "bg-navy text-white"
                    : "bg-surface-container text-on-surface"
                }`}>
                  1
                </span>
                <h2 className="font-headline text-xl font-bold text-navy uppercase">
                  Contact Details
                </h2>
              </div>
              {activeStep === "contact" && (
                <ContactStep onNext={() => setActiveStep("delivery")} />
              )}
            </section>

            {/* Delivery Step */}
            <section
              className={`bg-surface border p-8 transition-all ${
                activeStep === "delivery"
                  ? "border-navy shadow-md"
                  : "border-border opacity-60"
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className={`w-8 h-8 flex items-center justify-center font-bold rounded-sm ${
                  activeStep === "delivery"
                    ? "bg-navy text-white"
                    : "bg-surface-container text-on-surface"
                }`}>
                  2
                </span>
                <h2 className="font-headline text-xl font-bold text-navy uppercase">
                  Delivery Method
                </h2>
              </div>
              {activeStep === "delivery" && (
                <DeliveryStep
                  cart={cart}
                  onBack={() => setActiveStep("contact")}
                  onNext={() => setActiveStep("payment")}
                />
              )}
            </section>

            {/* Payment Step */}
            <section
              className={`bg-surface border p-8 transition-all ${
                activeStep === "payment"
                  ? "border-navy shadow-md"
                  : "border-border opacity-60"
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className={`w-8 h-8 flex items-center justify-center font-bold rounded-sm ${
                  activeStep === "payment"
                    ? "bg-navy text-white"
                    : "bg-surface-container text-on-surface"
                }`}>
                  3
                </span>
                <h2 className="font-headline text-xl font-bold text-navy uppercase">
                  Payment
                </h2>
              </div>
              {activeStep === "payment" && (
                <PaymentStep onBack={() => setActiveStep("delivery")} cart={cart} />
              )}
            </section>
          </div>

          {/* Right: Order Summary (Sticky) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <OrderSummary cart={cart} />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy border-t-4 border-secondary mt-20">
        <div className="max-w-[1440px] mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="font-headline text-lg font-bold text-white uppercase">My Toolbox</div>
            <p className="text-white/80 text-sm">
              The UK's leading supplier for professional trades. Fast delivery, trade prices, and expert support.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider">Customer Service</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Delivery Information</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns &amp; Refunds</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Store Finder</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider">Trade Accounts</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Trade Credit Account</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bulk Order Discounts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Technical Data Sheets</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider">Legal</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Sale</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-8 py-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/70 text-xs">
          <p>© 2024 My Toolbox Ltd. All Rights Reserved. Trade prices shown exclude VAT.</p>
          <div className="flex gap-6">
            <span className="material-symbols-outlined">credit_card</span>
            <span className="material-symbols-outlined">payments</span>
            <span className="material-symbols-outlined">account_balance</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
