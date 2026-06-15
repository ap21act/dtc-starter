import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import QuickAdd from "@modules/home/components/quick-add"

export default function ProductPreview({
  product,
  isFeatured: _isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const variant = product.variants?.[0]
  const meta = (product.metadata ?? {}) as Record<string, unknown>
  const brand = meta.brand as string | undefined

  const priceAmount = (variant as any)?.calculated_price?.calculated_amount ?? 0
  const exVat = priceAmount / 100
  const incVat = exVat * 1.2

  const stock = variant?.inventory_quantity ?? 0
  const inStock = !variant?.manage_inventory || (variant as any)?.allow_backorder || stock > 0
  const lowStock = inStock && stock > 0 && stock < 20

  return (
    <div
      className="bg-surface border border-border group hover:border-safety-orange transition-all duration-300 flex flex-col h-full"
      data-testid="product-wrapper"
    >
      {/* Image */}
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="p-4 h-48 flex items-center justify-center overflow-hidden bg-white block shrink-0"
      >
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title ?? ""}
            width={200}
            height={180}
            className="max-h-full w-auto object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="material-symbols-outlined text-5xl text-grey-30">image_not_supported</span>
        )}
      </LocalizedClientLink>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow border-t border-border">
        {brand && (
          <p className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-widest">
            {brand}
          </p>
        )}

        <LocalizedClientLink href={`/products/${product.handle}`}>
          <h3 className="font-headline text-lg font-bold text-navy leading-tight mb-2 min-h-[3.5rem] line-clamp-2 hover:text-secondary transition-colors">
            {product.title}
          </h3>
        </LocalizedClientLink>

        {variant?.sku && (
          <p className="text-xs text-on-surface-variant mb-4">SKU: {variant.sku}</p>
        )}

        {/* Price */}
        {priceAmount > 0 ? (
          <div className="mb-4">
            <p className="text-[26px] leading-none font-bold text-navy">
              £{exVat.toFixed(2)}{" "}
              <span className="text-sm font-normal text-on-surface-variant">ex. VAT</span>
            </p>
            <p className="text-xs text-on-surface-variant mt-1">£{incVat.toFixed(2)} inc. VAT</p>
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant mb-4">Price on request</p>
        )}

        {/* Stock */}
        <div className="flex items-center gap-1.5 mb-2">
          {lowStock ? (
            <>
              <span className="material-symbols-outlined text-warning" style={{ fontSize: 16 }}>schedule</span>
              <span className="text-sm font-semibold text-warning">Low Stock</span>
            </>
          ) : inStock ? (
            <>
              <span className="material-symbols-outlined text-green-600" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-sm font-semibold text-green-700">In Stock</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-danger" style={{ fontSize: 16 }}>cancel</span>
              <span className="text-sm font-semibold text-danger">Out of Stock</span>
            </>
          )}
        </div>

        {/* Delivery note */}
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-4">
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>local_shipping</span>
          <span>Next day UK delivery available</span>
        </div>

        {/* Add to basket */}
        <div className="mt-auto">
          <QuickAdd variantId={variant?.id} disabled={!inStock} />
        </div>
      </div>
    </div>
  )
}
