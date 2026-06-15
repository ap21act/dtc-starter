"use client"

import Image from "next/image"
import { useState } from "react"
import { updateLineItem } from "@lib/data/cart"
import DeleteButton from "@modules/common/components/delete-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
  type?: "full" | "preview"
}

const Item = ({ item, currencyCode, type = "full" }: ItemProps) => {
  const [qty, setQty] = useState(item.quantity)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const meta = ((item as any).variant?.product?.metadata ?? {}) as Record<string, unknown>
  const brand = meta.brand as string | undefined
  const stock = (item as any).variant?.inventory_quantity ?? null
  const lowStock = stock !== null && stock > 0 && stock < 10

  const fmt = (pence: number) => convertToLocale({ amount: pence / 100, currency_code: currencyCode })
  const exVat = (pence: number) => fmt(Math.round(pence / 1.2))

  const changeQty = async (next: number) => {
    if (next < 1 || updating) return
    setQty(next)
    setUpdating(true)
    setError(null)
    await updateLineItem({ lineId: item.id, quantity: next })
      .catch((e) => { setError(e.message); setQty(item.quantity) })
      .finally(() => setUpdating(false))
  }

  if (type === "preview") {
    return (
      <div className="flex gap-3 py-3 border-b border-border last:border-0">
        <div className="w-14 h-14 bg-white border border-border flex items-center justify-center shrink-0 overflow-hidden">
          {item.thumbnail ? (
            <Image src={item.thumbnail} alt={item.product_title ?? ""} width={56} height={56} className="object-contain" />
          ) : (
            <span className="material-symbols-outlined text-grey-30 text-2xl">image_not_supported</span>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-sm font-bold text-navy leading-tight line-clamp-2">{item.product_title}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">Qty: {qty}</p>
        </div>
        <div className="text-sm font-bold text-navy shrink-0">{fmt(item.subtotal ?? 0)}</div>
      </div>
    )
  }

  return (
    <div
      className="bg-surface border border-border p-4 hover:border-outline-variant transition-colors group"
      data-testid="product-row"
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Product info — 6 cols */}
        <div className="col-span-12 md:col-span-6 flex gap-4">
          <LocalizedClientLink
            href={`/products/${item.product_handle}`}
            className="w-24 h-24 bg-white border border-border shrink-0 flex items-center justify-center overflow-hidden"
          >
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={item.product_title ?? ""}
                width={96}
                height={96}
                className="object-contain"
              />
            ) : (
              <span className="material-symbols-outlined text-grey-30 text-4xl">image_not_supported</span>
            )}
          </LocalizedClientLink>

          <div className="flex flex-col justify-between min-w-0">
            <div>
              {brand && (
                <span className="text-xs font-semibold text-secondary-container uppercase tracking-wider block mb-1">
                  {brand}
                </span>
              )}
              <LocalizedClientLink href={`/products/${item.product_handle}`}>
                <h3 className="font-headline text-lg font-bold group-hover:text-secondary-container transition-colors leading-tight line-clamp-2">
                  {item.product_title}
                </h3>
              </LocalizedClientLink>
              {(item as any).variant?.sku && (
                <p className="text-xs text-on-surface-variant font-mono mt-1">
                  SKU: {(item as any).variant.sku}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {lowStock ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-warning bg-warning/10 px-2 py-0.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>
                  Low Stock: {stock} left
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-green-700">
                  <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  In Stock
                </span>
              )}
              <span className="text-[11px] text-on-surface-variant">Next day delivery available</span>
            </div>
          </div>
        </div>

        {/* Unit price — 2 cols */}
        <div className="hidden md:flex md:col-span-2 flex-col items-center">
          <span className="text-lg font-bold text-navy">{fmt(item.unit_price)}</span>
          <span className="text-xs text-on-surface-variant">{exVat(item.unit_price)} ex. VAT</span>
        </div>

        {/* Qty stepper — 2 cols */}
        <div className="col-span-6 md:col-span-2 flex justify-center">
          <div className={`flex items-center border h-11 transition-opacity ${updating ? "opacity-50" : "border-border"}`}>
            <button
              onClick={() => changeQty(qty - 1)}
              disabled={updating || qty <= 1}
              className="w-10 h-full hover:bg-surface-container flex items-center justify-center border-r border-border disabled:opacity-40"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>remove</span>
            </button>
            <span className="w-12 h-full flex items-center justify-center font-bold text-sm">
              {qty}
            </span>
            <button
              onClick={() => changeQty(qty + 1)}
              disabled={updating}
              className="w-10 h-full hover:bg-surface-container flex items-center justify-center border-l border-border disabled:opacity-40"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            </button>
          </div>
        </div>

        {/* Line total + remove — 2 cols */}
        <div className="col-span-6 md:col-span-2 flex flex-col items-end">
          <span className="font-headline text-xl font-bold text-navy">{fmt(item.subtotal ?? 0)}</span>
          <span className="text-xs text-on-surface-variant mb-3">{exVat(item.subtotal ?? 0)} ex. VAT</span>
          {error && <p className="text-xs text-danger mb-2">{error}</p>}
          <DeleteButton
            id={item.id}
            className="flex items-center gap-1 text-on-surface-variant hover:text-danger text-xs font-bold uppercase transition-colors"
            data-testid="product-delete-button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
            Remove
          </DeleteButton>
        </div>
      </div>
    </div>
  )
}

export default Item
