import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import StoreWithFilters from "./store-with-filters"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"

type StoreTemplateProps = {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  collectionId?: string
  categoryId?: string
  collectionTitle?: string
  categoryTitle?: string
  search?: string
  brand?: string | string[]
  minPrice?: string
  maxPrice?: string
  material?: string
  inStockOnly?: boolean
}

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  collectionId,
  categoryId,
  collectionTitle,
  categoryTitle,
  search,
}: StoreTemplateProps) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const { collections } = await listCollections({ fields: "id, handle, title" })
  const region = await getRegion(countryCode)

  // Fetch products with search/sorting
  let products: HttpTypes.StoreProduct[] = []
  try {
    const result = await listProducts({
      countryCode,
      queryParams: {
        limit: 100,
        ...(search && { q: String(search) }),
      },
    })
    products = result.response.products || []
  } catch (error) {
    console.error("Failed to fetch products:", error)
    products = []
  }

  let pageTitle = categoryTitle ?? collectionTitle ?? "All Products"
  let pageDesc = ""

  if (search) {
    pageTitle = `Search: "${search}"`
    pageDesc = `Results for "${search}"`
  } else if (collectionId || categoryId) {
    pageDesc = `Browse our full range of ${pageTitle.toLowerCase()} — professional grade, ready for UK delivery.`
  } else {
    pageDesc = "Professional tools, fixings, sealants, PPE and site essentials. Clear pricing, VAT invoices, fast UK delivery."
  }

  const collectionChips = collections?.map((c) => ({
    id: c.id!,
    title: c.title!,
    handle: c.handle!,
  })) || []

  return (
    <div data-testid="category-container">
      {/* Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto px-8 py-6">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
          <LocalizedClientLink href="/" className="hover:text-navy transition-colors">
            Home
          </LocalizedClientLink>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            chevron_right
          </span>
          {collectionId || categoryId || search ? (
            <>
              <LocalizedClientLink href="/store" className="hover:text-navy transition-colors">
                All Products
              </LocalizedClientLink>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                chevron_right
              </span>
              <span className="text-navy font-bold">{pageTitle}</span>
            </>
          ) : (
            <span className="text-navy font-bold">All Products</span>
          )}
        </nav>
      </div>

      {/* Header + Collection chips */}
      <div className="max-w-[1440px] mx-auto px-8 pb-8">
        <h1
          className="font-headline text-[40px] leading-tight font-bold text-navy mb-4 uppercase tracking-tighter"
          data-testid="store-page-title"
        >
          {pageTitle}
        </h1>
        {pageDesc && (
          <p className="text-base text-on-surface-variant max-w-3xl border-l-4 border-safety-orange pl-6 py-2 mb-6">
            {pageDesc}
          </p>
        )}

        {/* Collection chips */}
        {!search && collectionChips && collectionChips.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <LocalizedClientLink
              href="/store"
              className={`px-5 py-2.5 border text-sm font-medium transition-colors flex items-center gap-2 ${
                !collectionId && !categoryId
                  ? "border-safety-orange bg-orange-50 text-navy"
                  : "border-border bg-surface hover:border-safety-orange text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                apps
              </span>
              All
            </LocalizedClientLink>
            {collectionChips.map((c) => (
              <LocalizedClientLink
                key={c.id}
                href={`/collections/${c.handle}`}
                className={`px-5 py-2.5 border text-sm font-medium transition-colors ${
                  collectionId === c.id
                    ? "border-safety-orange bg-orange-50 text-navy"
                    : "border-border bg-surface hover:border-safety-orange text-on-surface"
                }`}
              >
                {c.title}
              </LocalizedClientLink>
            ))}
          </div>
        )}
      </div>

      {/* Client-side filter + products */}
      <StoreWithFilters
        products={products}
        collectionChips={collectionChips}
        pageTitle={pageTitle}
        pageDesc={pageDesc}
        search={search}
        sortBy={sort}
        page={pageNumber}
        region={region!}
      />
    </div>
  )
}

export default StoreTemplate
