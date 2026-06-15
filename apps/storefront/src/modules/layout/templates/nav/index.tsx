import { Suspense } from "react"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"

export default async function Nav() {
  const { collections } = await listCollections({ fields: "id, handle, title" })

  return (
    <>
      {/* Utility bar */}
      <div className="bg-navy text-white py-2 px-8 hidden md:block">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center text-xs font-medium">
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>local_shipping</span>
              Fast UK Delivery Across All Orders
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>receipt_long</span>
              VAT Invoices Generated Automatically
            </span>
          </div>
          <div className="flex gap-6 uppercase tracking-wider">
            <a href="#" className="hover:text-safety-orange transition-colors">Store Finder</a>
            <a href="#" className="hover:text-safety-orange transition-colors">Track Order</a>
            <LocalizedClientLink
              href="/account"
              className="font-bold text-safety-orange hover:text-white transition-colors"
            >
              Trade Account Login
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="w-full top-0 sticky z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8 py-4 flex flex-col gap-4">

          {/* Logo + Search + Actions */}
          <div className="flex items-center justify-between gap-8">
            <LocalizedClientLink
              href="/"
              className="font-headline text-2xl text-navy uppercase tracking-tighter shrink-0 hover:text-safety-orange transition-colors"
            >
              Kingsbury
            </LocalizedClientLink>

            {/* Search */}
            <form className="flex-grow max-w-2xl relative" action="/store" method="get">
              <input
                name="q"
                type="text"
                placeholder="Search products (e.g. M10 Bolts, Wood Screws…)"
                className="w-full pl-4 pr-12 py-3 bg-surface-container-low border border-border focus:border-secondary focus:ring-0 text-sm"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-navy text-white hover:bg-secondary transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>search</span>
              </button>
            </form>

            {/* Account + Cart + CTA */}
            <div className="flex items-center gap-6">
              <LocalizedClientLink href="/account" className="flex flex-col items-end">
                <span className="text-xs text-on-surface-variant">Hello, Sign In</span>
                <div className="flex items-center gap-1 text-sm font-semibold text-navy">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
                  Your Account
                </div>
              </LocalizedClientLink>

              <Suspense
                fallback={
                  <LocalizedClientLink href="/cart" className="relative">
                    <span className="material-symbols-outlined text-3xl text-navy">shopping_cart</span>
                    <span className="absolute -top-2 -right-2 bg-secondary-container text-on-secondary-container text-[10px] font-bold px-1.5 py-0.5 rounded-full">0</span>
                  </LocalizedClientLink>
                }
              >
                <CartButton />
              </Suspense>

              <LocalizedClientLink
                href="/account"
                className="bg-secondary text-white font-bold px-5 py-2.5 uppercase text-sm tracking-wider hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95"
              >
                Trade Account
              </LocalizedClientLink>
            </div>
          </div>

          {/* Category nav */}
          <nav className="flex items-center gap-8 border-t border-border pt-4 overflow-x-auto no-scrollbar">
            <LocalizedClientLink
              href="/store"
              className="text-sm font-semibold text-navy hover:text-secondary transition-colors whitespace-nowrap"
            >
              All Products
            </LocalizedClientLink>
            {collections?.slice(0, 8).map((c) => (
              <LocalizedClientLink
                key={c.id}
                href={`/collections/${c.handle}`}
                className="text-sm font-medium text-on-surface hover:text-secondary transition-colors whitespace-nowrap"
              >
                {c.title}
              </LocalizedClientLink>
            ))}
            <LocalizedClientLink
              href="/store"
              className="ml-auto text-danger flex items-center gap-1 font-bold text-sm whitespace-nowrap"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>percent</span>
              Clearance
            </LocalizedClientLink>
          </nav>
        </div>
      </header>
    </>
  )
}
