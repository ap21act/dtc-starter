"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

const BRANDS = ["TIMCO", "DeWalt", "Makita", "Bosch", "Milwaukee", "Stanley"]
const MATERIALS = ["All Materials", "Steel", "Zinc", "Stainless Steel", "Brass", "Nylon", "PVC"]

export default function StoreFilters({
  products,
  onFiltersApplied,
}: {
  products: HttpTypes.StoreProduct[]
  onFiltersApplied: (filtered: HttpTypes.StoreProduct[]) => void
}) {
  const [checkedBrands, setCheckedBrands] = useState<Set<string>>(new Set())
  const [inStockOnly, setInStockOnly] = useState(false)
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [material, setMaterial] = useState("All Materials")

  const toggleBrand = (brand: string) => {
    const next = new Set(checkedBrands)
    next.has(brand) ? next.delete(brand) : next.add(brand)
    setCheckedBrands(next)
  }

  const hasFilters =
    checkedBrands.size > 0 || inStockOnly || minPrice || maxPrice || material !== "All Materials"

  // Apply filters client-side
  useEffect(() => {
    let filtered = [...products]

    // Brand filter
    if (checkedBrands.size > 0) {
      filtered = filtered.filter((p) => {
        const brand = ((p.metadata ?? {}) as Record<string, unknown>).brand as string | undefined
        return brand && checkedBrands.has(brand)
      })
    }

    // Stock filter
    if (inStockOnly) {
      filtered = filtered.filter((p) => {
        const variant = p.variants?.[0]
        return !variant?.manage_inventory || (variant.inventory_quantity ?? 0) > 0
      })
    }

    // Price filter (in pence)
    if (minPrice) {
      const minPence = parseFloat(minPrice) * 100
      filtered = filtered.filter((p) => {
        const price = (p.variants?.[0] as any)?.calculated_price?.calculated_amount ?? 0
        return price >= minPence
      })
    }
    if (maxPrice) {
      const maxPence = parseFloat(maxPrice) * 100
      filtered = filtered.filter((p) => {
        const price = (p.variants?.[0] as any)?.calculated_price?.calculated_amount ?? 0
        return price <= maxPence
      })
    }

    // Material filter
    if (material !== "All Materials") {
      filtered = filtered.filter((p) => {
        const prodMaterial = ((p.metadata ?? {}) as Record<string, unknown>)
          .material as string | undefined
        return prodMaterial?.toLowerCase() === material.toLowerCase()
      })
    }

    onFiltersApplied(filtered)
  }, [checkedBrands, inStockOnly, minPrice, maxPrice, material, products])

  const clearFilters = () => {
    setCheckedBrands(new Set())
    setInStockOnly(false)
    setMinPrice("")
    setMaxPrice("")
    setMaterial("All Materials")
  }

  return (
    <aside className="w-full md:w-64 shrink-0 flex flex-col gap-5">
      {/* Filter panel */}
      <div className="bg-surface border border-border p-5">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <h3 className="font-headline text-lg font-bold text-navy">Filters</h3>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-secondary hover:underline font-semibold"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Brand */}
        <div className="mb-6">
          <label className="text-sm font-bold text-navy block mb-3 uppercase tracking-wider">
            Brand
          </label>
          <div className="space-y-2">
            {BRANDS.map((brand) => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checkedBrands.has(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-4 h-4 border-border rounded-sm text-safety-orange focus:ring-safety-orange accent-navy"
                />
                <span
                  className={`text-sm transition-colors group-hover:text-navy ${
                    checkedBrands.has(brand)
                      ? "font-bold text-navy"
                      : "text-on-surface-variant"
                  }`}
                >
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="mb-6">
          <label className="text-sm font-bold text-navy block mb-3 uppercase tracking-wider">
            Availability
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 border-border rounded-sm text-safety-orange focus:ring-safety-orange accent-navy"
            />
            <span className="text-sm text-on-surface-variant">In Stock Only</span>
          </label>
        </div>

        {/* Price range */}
        <div className="mb-6">
          <label className="text-sm font-bold text-navy block mb-3 uppercase tracking-wider">
            Price Range (ex. VAT)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="£ Min"
              className="w-full h-9 border border-border px-2 text-sm focus:ring-1 focus:ring-safety-orange focus:border-safety-orange"
            />
            <span className="text-on-surface-variant text-sm shrink-0">–</span>
            <input
              type="text"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="£ Max"
              className="w-full h-9 border border-border px-2 text-sm focus:ring-1 focus:ring-safety-orange focus:border-safety-orange"
            />
          </div>
        </div>

        {/* Material */}
        <div className="mb-6">
          <label className="text-sm font-bold text-navy block mb-3 uppercase tracking-wider">
            Material
          </label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full h-9 border border-border px-2 text-sm focus:ring-1 focus:ring-safety-orange focus:border-safety-orange"
          >
            {MATERIALS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Trade bulk buy promo */}
      <div className="bg-navy text-white p-5">
        <p className="font-headline text-base font-bold mb-2">Trade Bulk Buy</p>
        <p className="text-xs text-white/70 mb-4 leading-relaxed">
          Save up to 15% on bulk packs. Log in for trade pricing.
        </p>
        <a
          href="#"
          className="text-safety-orange font-bold underline flex items-center gap-1 text-sm hover:text-white transition-colors"
        >
          View Deals
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            trending_flat
          </span>
        </a>
      </div>
    </aside>
  )
}
