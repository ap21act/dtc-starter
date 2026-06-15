import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function OrderSummary({ cart }: { cart: HttpTypes.StoreCart }) {
  const currency = cart.currency_code ?? "gbp"
  const fmt = (p: number) => convertToLocale({ amount: p / 100, currency_code: currency })

  const subtotal = cart.subtotal ?? 0
  const tax = cart.tax_total ?? 0
  const shipping = cart.shipping_total ?? 0
  const total = cart.total ?? 0

  return (
    <div className="bg-surface border border-border shadow-lg sticky top-24">
      {/* Header */}
      <div className="p-6 border-b border-border bg-surface-container-low">
        <h2 className="font-headline text-xl font-bold text-navy uppercase">
          Order Summary
        </h2>
      </div>

      {/* Items */}
      <div className="p-6 space-y-6 border-b border-border max-h-96 overflow-y-auto">
        {cart.items?.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="w-20 h-20 bg-white border border-border flex-shrink-0 flex items-center justify-center overflow-hidden">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.product_title ?? ""}
                  width={80}
                  height={80}
                  className="object-contain p-2"
                />
              ) : (
                <span className="material-symbols-outlined text-grey-30 text-3xl">image_not_supported</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <LocalizedClientLink href={`/products/${item.product_handle}`}>
                <p className="font-bold text-sm leading-tight line-clamp-2 hover:text-secondary transition-colors text-navy">
                  {item.product_title}
                </p>
              </LocalizedClientLink>
              <p className="text-xs text-on-surface-variant mt-1">QTY: {item.quantity}</p>
              <p className="font-bold text-sm mt-1 text-navy">
                {fmt(item.subtotal ?? 0)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="p-6 space-y-3 border-b border-border">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Subtotal (ex. VAT)</span>
          <span>{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">VAT (20%)</span>
          <span>{fmt(tax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Delivery</span>
          <span>{shipping === 0 ? "FREE" : fmt(shipping)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="p-6 border-b-2 border-navy bg-white">
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-headline text-lg font-bold text-navy uppercase">
            Total (inc. VAT)
          </span>
          <span className="font-headline text-3xl font-bold text-secondary">
            {fmt(total)}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant text-right">
          Includes {fmt(tax)} VAT
        </p>
      </div>

      {/* Trust Badges */}
      <div className="p-6 bg-surface-container-low space-y-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-green-700" style={{ fontVariationSettings: "'FILL' 1", fontSize: 18 }}>
            verified
          </span>
          <p className="text-xs font-bold text-on-surface-variant uppercase">
            Full VAT Invoice Provided
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-green-700" style={{ fontVariationSettings: "'FILL' 1", fontSize: 18 }}>
            security
          </span>
          <p className="text-xs font-bold text-on-surface-variant uppercase">
            Secure 256-bit SSL Checkout
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-green-700" style={{ fontVariationSettings: "'FILL' 1", fontSize: 18 }}>
            stars
          </span>
          <p className="text-xs font-bold text-on-surface-variant uppercase">
            Authorised UK Main Dealer
          </p>
        </div>
      </div>

      {/* Stock Notice */}
      <div className="p-4 border-t border-border bg-yellow-50 flex gap-3">
        <span className="material-symbols-outlined text-warning" style={{ fontSize: 18 }}>info</span>
        <div>
          <p className="font-bold text-xs text-warning uppercase">Stock Notice</p>
          <p className="text-xs text-warning mt-1">Your items are reserved for 15 minutes.</p>
        </div>
      </div>
    </div>
  )
}
