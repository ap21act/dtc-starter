import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
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
    <StoreWithFilters
      products={products}
      collectionChips={collectionChips}
      pageTitle={pageTitle}
      pageDesc={pageDesc}
      search={search}
      sortBy={sort}
      page={pageNumber}
      region={region!}
      collectionId={collectionId}
      categoryId={categoryId}
    />
  )
}

export default StoreTemplate
