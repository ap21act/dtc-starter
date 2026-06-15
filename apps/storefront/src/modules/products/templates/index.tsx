import React, { Suspense } from "react"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductGallery from "@modules/products/components/product-gallery"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductActionsWrapper from "./product-actions-wrapper"
import ProductActions from "@modules/products/components/product-actions"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) return notFound()

  const meta = (product.metadata ?? {}) as Record<string, unknown>
  const brand = meta.brand as string | undefined
  const category = meta.category as string | undefined
  const sku = product.variants?.[0]?.sku

  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-[1440px] mx-auto px-8 py-6" data-testid="product-container">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-grey-50">
          <LocalizedClientLink href="/" className="hover:text-safety-orange transition-colors">
            Home
          </LocalizedClientLink>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <LocalizedClientLink href="/store" className="hover:text-safety-orange transition-colors">
            All Products
          </LocalizedClientLink>
          {category && (
            <>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <LocalizedClientLink
                href={`/collections/timco-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="hover:text-safety-orange transition-colors"
              >
                {category}
              </LocalizedClientLink>
            </>
          )}
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-navy font-semibold line-clamp-1">{product.title}</span>
        </nav>

        {/* Product hero — 7/12 gallery + 5/12 info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={images} brand={brand} />
          </div>

          {/* Info panel */}
          <div className="lg:col-span-5 flex flex-col">
            {brand && (
              <div className="text-navy font-bold text-sm tracking-wider uppercase mb-2">
                {brand}
              </div>
            )}

            <h1 className="font-headline text-2xl lg:text-3xl text-navy leading-tight mb-2">
              {product.title}
            </h1>

            {sku && (
              <div className="text-grey-50 text-xs mb-6 uppercase tracking-wider">
                SKU: {sku}
              </div>
            )}

            {/* Price box + qty + add to basket */}
            <Suspense
              fallback={
                <ProductActions
                  disabled
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>
        </div>

        {/* Tabs — Description / Specs / Delivery */}
        <ProductTabs product={product} />

        {/* Related products */}
        <div className="mt-8" data-testid="related-products-container">
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default ProductTemplate
