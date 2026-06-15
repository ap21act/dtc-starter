import { Metadata } from "next"
import Image from "next/image"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import QuickAdd from "@modules/home/components/quick-add"
import { HttpTypes } from "@medusajs/types"

export const metadata: Metadata = {
  title: "Home",
  description: "Trade and retail supply of tools, fixings, screws and building materials.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)
  if (!region) return null

  const { collections } = await listCollections({ fields: "id, handle, title" })
  const { response: { products } } = await listProducts({
    countryCode,
    queryParams: { limit: 4, order: "-created_at" },
  })

  return (
    <div className="bg-background text-on-surface">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-inverse-surface py-20 overflow-hidden">
        {/* Subtle dark texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1e3a5f22_0%,_transparent_70%)]" />
        <div className="max-w-[1440px] mx-auto px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <div className="text-white">
            <span className="bg-secondary text-white px-3 py-1 text-xs font-bold uppercase tracking-wider mb-6 inline-block">
              UK Wide Fulfilment
            </span>
            <h1 className="font-headline text-[48px] leading-[56px] tracking-tight font-bold mb-6">
              Builders merchant supplies delivered across the UK
            </h1>
            <p className="text-lg text-surface-variant mb-10 max-w-lg leading-relaxed">
              Tools, fixings, sealants, PPE and site essentials with clear pricing, VAT invoices and fast UK delivery.
            </p>
            <div className="flex flex-wrap gap-4">
              <LocalizedClientLink href="/store">
                <button className="bg-secondary-container text-on-secondary-container px-8 py-4 font-headline text-xl font-bold hover:bg-secondary-fixed transition-colors">
                  Shop Trade Essentials
                </button>
              </LocalizedClientLink>
              <a href="#" className="border-2 border-white text-white px-8 py-4 font-headline text-xl font-bold hover:bg-white hover:text-navy transition-colors">
                Request Bulk Pricing
              </a>
            </div>
          </div>

          {/* Right: live stock widget */}
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-md p-8 border border-white/20">
              <h3 className="font-headline text-xl font-bold text-white mb-5">Live Stock Update</h3>
              <div className="space-y-4">
                {[
                  { label: "Fixings & Fasteners", status: "In Stock", ok: true },
                  { label: "Sealants & Adhesives", status: "In Stock", ok: true },
                  { label: "PPE Equipment",        status: "Low Stock", ok: false },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <span className="text-surface-variant text-sm">{item.label}</span>
                    <span className={`font-bold text-sm flex items-center gap-1 ${item.ok ? "text-tertiary-fixed" : "text-yellow-400"}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: item.ok ? "'FILL' 1" : undefined }}>
                        {item.ok ? "check_circle" : "schedule"}
                      </span>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ──────────────────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-[1440px] mx-auto px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "local_shipping", title: "Fast UK Delivery",         body: "Next-day delivery available on site essentials." },
            { icon: "description",    title: "VAT Invoices Available",   body: "Downloadable from your trade account dashboard." },
            { icon: "sell",           title: "Trade & Bulk Discounts",   body: "Save more when you order in pallet quantities." },
          ].map((t) => (
            <div key={t.title} className="flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary text-4xl shrink-0">{t.icon}</span>
              <div>
                <h4 className="font-headline text-xl font-bold text-on-surface">{t.title}</h4>
                <p className="text-sm text-on-surface-variant mt-1">{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category Tiles ───────────────────────────────────────────── */}
      {collections && collections.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-8 py-16">
          <h2 className="font-headline text-[48px] leading-tight font-bold uppercase tracking-tighter mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[520px]">
            {/* Large tile — first collection */}
            <LocalizedClientLink
              href={`/collections/${collections[0]?.handle}`}
              className="md:col-span-2 md:row-span-2 relative overflow-hidden group cursor-pointer border border-border bg-navy"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-navy/60" />
              <div className="absolute inset-0 flex items-end p-8">
                <div>
                  <h3 className="font-headline text-[40px] leading-tight font-bold text-white group-hover:text-safety-orange transition-colors">
                    {collections[0]?.title}
                  </h3>
                  <p className="text-surface-variant text-sm mt-2">Browse the full range →</p>
                </div>
              </div>
            </LocalizedClientLink>

            {/* Small tile 2 */}
            {collections[1] && (
              <LocalizedClientLink
                href={`/collections/${collections[1].handle}`}
                className="relative overflow-hidden group cursor-pointer border border-border bg-[#1a2535]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 to-navy/30" />
                <div className="absolute inset-0 flex items-end p-5">
                  <h3 className="font-headline text-xl font-bold text-white group-hover:text-safety-orange transition-colors">
                    {collections[1].title}
                  </h3>
                </div>
              </LocalizedClientLink>
            )}

            {/* Small tile 3 */}
            {collections[2] && (
              <LocalizedClientLink
                href={`/collections/${collections[2].handle}`}
                className="relative overflow-hidden group cursor-pointer border border-border bg-[#1e1e1e]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 to-navy/30" />
                <div className="absolute inset-0 flex items-end p-5">
                  <h3 className="font-headline text-xl font-bold text-white group-hover:text-safety-orange transition-colors">
                    {collections[2].title}
                  </h3>
                </div>
              </LocalizedClientLink>
            )}

            {/* Wide tile — 4th collection */}
            {collections[3] && (
              <LocalizedClientLink
                href={`/collections/${collections[3].handle}`}
                className="md:col-span-2 relative overflow-hidden group cursor-pointer border border-border bg-[#0f1a26]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/40" />
                <div className="absolute inset-0 flex items-end p-6">
                  <h3 className="font-headline text-2xl font-bold text-white group-hover:text-safety-orange transition-colors">
                    {collections[3].title}
                  </h3>
                </div>
              </LocalizedClientLink>
            )}
          </div>
        </section>
      )}

      {/* ── Best Sellers ─────────────────────────────────────────────── */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline text-[40px] leading-tight font-bold uppercase tracking-tighter">
                Best-Selling Trade Essentials
              </h2>
              <p className="text-sm text-on-surface-variant mt-2">
                Live stock availability — UK nationwide delivery.
              </p>
            </div>
            <LocalizedClientLink
              href="/store"
              className="text-secondary font-bold text-sm hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              View All <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </LocalizedClientLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Strip ──────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-8 py-16 border-t border-border">
        <h2 className="font-headline text-[40px] leading-tight font-bold uppercase tracking-tighter mb-8">
          Major Trade Brands
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {["TIMCO", "DeWalt", "Makita", "Bosch", "Milwaukee", "Stanley"].map((brand) => (
            <div
              key={brand}
              className="h-16 flex items-center justify-center border border-border p-4 grayscale hover:grayscale-0 hover:border-secondary transition-all cursor-pointer"
            >
              <span className="font-headline text-sm font-bold text-navy tracking-wider uppercase">
                {brand}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ── Product card ────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: HttpTypes.StoreProduct }) {
  const variant = product.variants?.[0]
  const meta = (product.metadata ?? {}) as Record<string, unknown>
  const brand = (meta.brand as string) ?? ""
  const priceAmount = (variant as any)?.calculated_price?.calculated_amount ?? 0
  const exVat = priceAmount / 100
  const incVat = exVat * 1.2
  const stock = variant?.inventory_quantity ?? 0
  const inStock = !variant?.manage_inventory || stock > 0
  const lowStock = inStock && stock > 0 && stock < 20

  return (
    <div className="bg-surface border border-border p-4 flex flex-col group">
      {/* Image */}
      <LocalizedClientLink href={`/products/${product.handle}`} className="relative h-48 mb-4 overflow-hidden block">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title ?? ""}
            fill
            className="object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-grey-30">image_not_supported</span>
          </div>
        )}
      </LocalizedClientLink>

      {/* Details */}
      <div className="flex-grow">
        {brand && (
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{brand}</span>
        )}
        <LocalizedClientLink href={`/products/${product.handle}`}>
          <h3 className="font-bold text-base mt-1 leading-tight line-clamp-2 hover:text-secondary transition-colors">
            {product.title}
          </h3>
        </LocalizedClientLink>
        {variant?.sku && (
          <span className="text-xs text-on-surface-variant block mt-1">SKU: {variant.sku}</span>
        )}

        {/* Stock badge */}
        <div className="mt-3">
          {lowStock ? (
            <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 text-[11px] font-bold px-2 py-0.5 rounded">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span> LOW STOCK
            </span>
          ) : inStock ? (
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded">
              <span className="material-symbols-outlined" style={{ fontSize: 13, fontVariationSettings: "'FILL' 1" }}>check_circle</span> IN STOCK
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>cancel</span> OUT OF STOCK
            </span>
          )}
        </div>

        {/* Price */}
        {priceAmount > 0 && (
          <div className="mt-4 flex flex-col">
            <span className="text-[26px] leading-none font-bold text-navy">
              £{exVat.toFixed(2)} <small className="text-sm font-normal text-on-surface-variant">ex. VAT</small>
            </span>
            <span className="text-xs text-on-surface-variant mt-1">£{incVat.toFixed(2)} inc. VAT</span>
          </div>
        )}
      </div>

      {/* Add to basket */}
      <QuickAdd variantId={variant?.id} disabled={!inStock} />
    </div>
  )
}
