"use client"

import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [qty, setQty] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  // Preselect the only variant
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return undefined
    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({ ...prev, [optionId]: value }))
  }

  const isValidVariant = useMemo(
    () =>
      product.variants?.some((v) =>
        isEqual(optionsAsKeymap(v.options), options)
      ),
    [product.variants, options]
  )

  // Sync variant id to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null
    if (params.get("v_id") === value) return
    if (value) params.set("v_id", value)
    else params.delete("v_id")
    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  const inStock = useMemo(() => {
    if (!selectedVariant) return false
    if (!selectedVariant.manage_inventory) return true
    if (selectedVariant.allow_backorder) return true
    return (selectedVariant.inventory_quantity ?? 0) > 0
  }, [selectedVariant])

  const stockQty = selectedVariant?.inventory_quantity ?? 0
  const lowStock = inStock && stockQty > 0 && stockQty < 20

  // Price from calculated_price (pence → £)
  const priceAmount =
    (selectedVariant as any)?.calculated_price?.calculated_amount ?? 0
  const exVat = priceAmount / 100
  const incVat = exVat * 1.2

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return
    setIsAdding(true)
    await addToCart({
      variantId: selectedVariant.id,
      quantity: qty,
      countryCode,
    })
    setIsAdding(false)
  }

  return (
    <div className="flex flex-col gap-y-4">
      {/* Variant options (hidden for single-variant products) */}
      {(product.variants?.length ?? 0) > 1 && (
        <div className="flex flex-col gap-y-4 mb-2">
          {(product.options || []).map((option) => (
            <OptionSelect
              key={option.id}
              option={option}
              current={options[option.id]}
              updateOption={setOptionValue}
              title={option.title ?? ""}
              disabled={!!disabled || isAdding}
            />
          ))}
        </div>
      )}

      {/* Price box */}
      <div className="bg-brand-surface p-6 border border-brand-border">
        {priceAmount > 0 ? (
          <>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold text-navy">
                £{exVat.toFixed(2)}
              </span>
              <span className="text-grey-50 text-sm">ex. VAT</span>
            </div>
            <div className="font-semibold text-navy mb-4">
              £{incVat.toFixed(2)}{" "}
              <span className="font-normal text-grey-50 text-sm">inc. VAT</span>
            </div>
          </>
        ) : (
          <div className="text-grey-50 text-sm mb-4">Price on request</div>
        )}

        {/* Stock status */}
        {lowStock && (
          <div className="flex items-center gap-2 mb-2 text-sm text-yellow-700">
            <span className="material-symbols-outlined text-base">warning</span>
            <span>Low stock — only {stockQty} remaining</span>
          </div>
        )}
        {!inStock && selectedVariant && (
          <div className="flex items-center gap-2 mb-2 text-sm text-red-700">
            <span className="material-symbols-outlined text-base">cancel</span>
            <span>Out of stock</span>
          </div>
        )}
        {inStock && !lowStock && (
          <div className="flex items-center gap-2 mb-2 text-sm text-green-700">
            <span className="material-symbols-outlined text-base">
              check_circle
            </span>
            <span>In stock</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-grey-60">
          <span className="material-symbols-outlined text-base">
            local_shipping
          </span>
          <span>Order within 2 hrs for Next Day UK Delivery</span>
        </div>
      </div>

      {/* Qty stepper + Add to basket */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-brand-border h-14 shrink-0">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-12 h-full flex items-center justify-center hover:bg-brand-surface transition-colors"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          <span className="w-12 h-full flex items-center justify-center font-bold text-lg text-navy">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="w-12 h-full flex items-center justify-center hover:bg-brand-surface transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock || !selectedVariant || !!disabled || isAdding || !isValidVariant}
          data-testid="add-product-button"
          className="flex-grow bg-safety-orange text-navy h-14 font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          {isAdding
            ? "ADDING..."
            : !selectedVariant && !isValidVariant
            ? "SELECT OPTION"
            : !inStock
            ? "OUT OF STOCK"
            : "ADD TO BASKET"}
        </button>
      </div>

      {/* Trade enquiry */}
      <a
        href="#"
        className="text-navy font-bold underline flex items-center gap-1 hover:text-safety-orange transition-colors text-sm"
      >
        <span className="material-symbols-outlined text-base">group</span>
        Need bulk pricing? Enquire about trade quantities
      </a>

      {/* Trust badges */}
      <div className="grid grid-cols-2 gap-4 border-t border-brand-border pt-5 mt-2">
        <div className="flex gap-3 items-start">
          <span className="material-symbols-outlined text-safety-orange">
            verified
          </span>
          <div>
            <div className="text-sm font-semibold text-navy">Trade Quality</div>
            <div className="text-xs text-grey-50">Industrial grade</div>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <span className="material-symbols-outlined text-safety-orange">
            assignment_return
          </span>
          <div>
            <div className="text-sm font-semibold text-navy">Easy Returns</div>
            <div className="text-xs text-grey-50">30-day guarantee</div>
          </div>
        </div>
      </div>
    </div>
  )
}
