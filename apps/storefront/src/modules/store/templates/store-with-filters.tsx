"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import StoreFilters from "../components/store-filters"
import StoreSort from "../components/store-sort"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "../components/pagination"

const PRODUCTS_PER_PAGE = 12

export default function StoreWithFilters({
  products,
  collectionChips,
  pageTitle,
  pageDesc,
  search,
  sortBy,
  page: initialPage,
  region,
}: {
  products: HttpTypes.StoreProduct[]
  collectionChips: { id: string; title: string; handle: string }[]
  pageTitle: string
  pageDesc: string
  search?: string
  sortBy?: string
  page?: number
  region: HttpTypes.StoreRegion
}) {
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [currentPage, setCurrentPage] = useState(initialPage || 1)

  const handleFiltersApplied = (filtered: HttpTypes.StoreProduct[]) => {
    setFilteredProducts(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Paginate filtered results
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(startIdx, startIdx + PRODUCTS_PER_PAGE)

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
        <LocalizedClientLink href="/" className="hover:text-navy transition-colors">
          Home
        </LocalizedClientLink>
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          chevron_right
        </span>
        <span className="text-navy font-bold">{pageTitle}</span>
      </nav>

      {/* Page header */}
      <div className="mb-10">
        <h1 className="font-headline text-[40px] leading-tight font-bold text-navy mb-4 uppercase tracking-tighter">
          {pageTitle}
        </h1>
        {pageDesc && (
          <p className="text-base text-on-surface-variant max-w-3xl border-l-4 border-safety-orange pl-6 py-2">
            {pageDesc}
            {filteredProducts.length !== products.length && (
              <> ({filteredProducts.length} matching)</>
            )}
          </p>
        )}
      </div>

      {/* Collection chips */}
      {collectionChips && collectionChips.length > 0 && !search && (
        <div className="flex flex-wrap gap-3 mb-10">
          <LocalizedClientLink href="/store">
            <button className="px-5 py-2.5 border text-sm font-medium transition-colors border-border bg-surface hover:border-safety-orange text-on-surface">
              All Products
            </button>
          </LocalizedClientLink>
          {collectionChips.map((c) => (
            <LocalizedClientLink key={c.id} href={`/collections/${c.handle}`}>
              <button className="px-5 py-2.5 border text-sm font-medium transition-colors border-border bg-surface hover:border-safety-orange text-on-surface">
                {c.title}
              </button>
            </LocalizedClientLink>
          ))}
        </div>
      )}

      {/* Sidebar + Product grid */}
      <div className="flex flex-col md:flex-row gap-6">
        <StoreFilters products={products} onFiltersApplied={handleFiltersApplied} />

        <div className="flex-grow min-w-0">
          <StoreSort count={filteredProducts.length} sortBy={sortBy || "created_at"} />

          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6"
            data-testid="products-list"
          >
            {paginatedProducts.map((p) => (
              <li key={p.id}>
                <ProductPreview product={p} region={region} />
              </li>
            ))}
          </ul>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 block">search_off</span>
              <p className="text-lg font-medium">No products found</p>
              {search && (
                <p className="text-sm mt-2">
                  Try a different search or{" "}
                  <LocalizedClientLink href="/store" className="text-secondary font-semibold hover:underline">
                    browse all products
                  </LocalizedClientLink>
                </p>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              data-testid="product-pagination"
              page={currentPage}
              totalPages={totalPages}
            />
          )}
        </div>
      </div>
    </div>
  )
}
