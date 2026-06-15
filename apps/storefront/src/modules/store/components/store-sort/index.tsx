"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export default function StoreSort({
  count,
  sortBy,
}: {
  count: number
  sortBy: SortOptions
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setSort = (value: SortOptions) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sortBy", value)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between mb-6 bg-surface border border-border px-4 py-3">
      <p className="font-bold text-sm text-navy">
        {count.toLocaleString()} Result{count !== 1 ? "s" : ""} Found
      </p>
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-on-surface-variant">Sort By:</label>
        <select
          value={sortBy}
          onChange={(e) => setSort(e.target.value as SortOptions)}
          className="border-none bg-transparent focus:ring-0 text-sm font-bold text-navy cursor-pointer"
        >
          <option value="created_at">Latest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  )
}
