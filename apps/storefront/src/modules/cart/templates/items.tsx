import { HttpTypes } from "@medusajs/types"
import Item from "@modules/cart/components/item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  const currency = cart?.currency_code ?? "gbp"

  if (!items?.length) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-5xl text-grey-30 block mb-4">shopping_cart</span>
        <p className="text-lg text-on-surface-variant">Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Delivery banner */}
      <div className="bg-green-50 border border-green-300/50 p-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-green-700" style={{ fontSize: 20 }}>local_shipping</span>
        <p className="text-sm font-medium text-green-700">
          You've qualified for <span className="font-bold">FREE Next Day UK Delivery</span> on this order!
        </p>
      </div>

      {/* Desktop headers */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 border-b border-border font-label-md text-on-surface-variant text-xs uppercase">
        <div className="col-span-6">Product</div>
        <div className="col-span-2 text-center">Price</div>
        <div className="col-span-2 text-center">Quantity</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {/* Items */}
      <div className="space-y-5">
        {items
          .sort((a, b) => ((b.created_at ?? "") > (a.created_at ?? "") ? 1 : -1))
          .map((item) => (
            <Item key={item.id} item={item} currencyCode={currency} />
          ))}
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
        {[
          { icon: "receipt_long", label: "VAT Invoices Available" },
          { icon: "verified_user", label: "Secure Payments" },
          { icon: "local_shipping", label: "UK Wide Delivery" },
          { icon: "settings_backup_restore", label: "30-Day Returns" },
        ].map((b) => (
          <div key={b.label} className="flex flex-col items-center text-center p-4 bg-surface border border-border">
            <span className="material-symbols-outlined text-navy mb-2 text-3xl">{b.icon}</span>
            <span className="text-xs font-bold uppercase tracking-tight">{b.label}</span>
          </div>
        ))}
      </div>

      {/* Bulk ordering CTA */}
      <div className="flex justify-between items-center bg-surface-container-low p-6 border border-border">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-navy text-3xl">request_quote</span>
          <div>
            <p className="font-bold text-navy uppercase">Ordering in volume?</p>
            <p className="text-sm text-on-surface-variant">We offer exclusive rates for bulk orders and project supplies.</p>
          </div>
        </div>
        <a href="#" className="text-secondary-container font-bold underline underline-offset-4 uppercase text-sm hover:text-secondary-fixed-dim transition-colors whitespace-nowrap ml-4">
          Request a quote
        </a>
      </div>
    </div>
  )
}

export default ItemsTemplate
