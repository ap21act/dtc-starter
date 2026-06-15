"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import DiscountCode from "@modules/checkout/components/discount-code"
import DeliveryTimer from "@modules/cart/components/delivery-timer"

const FREE_SHIPPING_THRESHOLD = 5000 // £50 in pence

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) return "address"
  if (!cart?.shipping_methods?.length) return "delivery"
  return "payment"
}

const Summary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const step = getCheckoutStep(cart)
  const currency = cart.currency_code ?? "gbp"
  const fmt = (p: number) => convertToLocale({ amount: p / 100, currency_code: currency })

  const subtotalExVat = cart.subtotal ?? 0
  const tax = cart.tax_total ?? 0
  const shipping = cart.shipping_total ?? 0
  const total = cart.total ?? 0
  const freeShipping = subtotalExVat >= FREE_SHIPPING_THRESHOLD

  return (
    <div className="sticky top-32 space-y-5">
      {/* Summary panel */}
      <div className="bg-surface border-2 border-navy p-6">
        <h2 className="font-headline text-2xl font-bold uppercase border-b border-border pb-4 mb-6 text-navy">
          Order Summary
        </h2>

        <div className="space-y-3 text-sm mb-6">
          <div className="flex justify-between text-on-surface-variant">
            <span>Subtotal (ex. VAT)</span>
            <span>{fmt(subtotalExVat)}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>VAT (20%)</span>
            <span>{fmt(tax)}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Delivery</span>
            {freeShipping || shipping === 0 ? (
              <span className="text-green-700 font-bold">FREE</span>
            ) : (
              <span>{fmt(shipping)}</span>
            )}
          </div>
          <div className="pt-4 border-t border-border flex justify-between items-baseline">
            <span className="font-bold text-base uppercase text-navy">Grand Total</span>
            <div className="text-right">
              <div className="font-headline text-3xl font-bold text-navy">{fmt(total)}</div>
              <span className="text-xs text-on-surface-variant">Includes {fmt(tax)} VAT</span>
            </div>
          </div>
        </div>

        {/* Promo / discount code */}
        <div className="mb-6">
          <DiscountCode cart={cart} />
        </div>

        {/* Secure checkout */}
        <LocalizedClientLink href={`/checkout?step=${step}`} data-testid="checkout-button">
          <button className="w-full bg-safety-orange text-navy font-bold py-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity uppercase tracking-wider text-lg active:scale-[0.98]">
            <span className="material-symbols-outlined">lock</span>
            Checkout Securely
          </button>
        </LocalizedClientLink>

        <LocalizedClientLink
          href="/store"
          className="block text-center text-sm text-on-surface-variant hover:text-navy transition-colors mt-4"
        >
          ← Continue Shopping
        </LocalizedClientLink>

        {/* Delivery countdown */}
        <DeliveryTimer />
      </div>

      {/* Help box */}
      <div className="bg-surface-container-low border border-border p-6 text-center">
        <p className="text-sm font-semibold text-on-surface-variant mb-1">
          Need help with your order?
        </p>
        <p className="font-headline text-2xl font-bold text-navy mb-3">0800 123 4567</p>
        <button className="text-sm font-bold uppercase underline underline-offset-4 text-on-surface-variant hover:text-navy transition-colors">
          Chat to a Trade Expert
        </button>
      </div>
    </div>
  )
}

export default Summary
