"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"

// ─── Key categorisation ──────────────────────────────────────────────────────

const FEATURE_KEYS = ["feature_1", "feature_2", "feature_3", "feature_4", "feature_5", "feature_6", "feature_7", "feature_8"]
const BENEFIT_KEYS = ["benefit_1", "benefit_2", "benefit_3"]

// Keys that appear only in Description tab (not the spec tables)
const DESCRIPTION_ONLY = new Set([
  "description",
  ...FEATURE_KEYS,
  ...BENEFIT_KEYS,
])

// "Pack & Trade Info" section keys
const PACK_KEYS = new Set([
  "moq",
  "moq_increment",
  "pack_type",
  "pack_quantity",
  "pack_quantity_unit",
  "pack_weight_kg",
  "pack_dimensions_l_x_w_x_h_mm",
  "carton_qty_packs",
  "pallet_qty_packs",
])

// Never shown — internal or displayed elsewhere
const HIDDEN_KEYS = new Set([
  "supplier", "supplier_id", "brand", "category", "sub_category",
  "trade_price_gbp", "gross_price_gbp", "pack_qty", "pack_unit",
  "sku_barcode", "product_code",
])

// ─── Label overrides ─────────────────────────────────────────────────────────

const LABELS: Record<string, string> = {
  moq:                          "Minimum Order Qty",
  moq_increment:                "Order Increment",
  pack_dimensions_l_x_w_x_h_mm:"Pack Dimensions (L×W×H mm)",
  pack_weight_kg:               "Pack Weight (kg)",
  pack_quantity:                "Pack Quantity",
  pack_quantity_unit:           "Pack Unit",
  carton_qty_packs:             "Carton Qty (packs)",
  pallet_qty_packs:             "Pallet Qty (packs)",
  width_mm:                     "Width (mm)",
  length_mm:                    "Length (mm)",
  head_width_mm:                "Head Width (mm)",
  thread_dia_mm:                "Thread Diameter (mm)",
  indoor_outdoor_usage:         "Indoor / Outdoor",
  application:                  "Application",
}

function toLabel(key: string): string {
  return LABELS[key] ?? key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

// Strip trailing decimals: "6.00000000" → "6",  "0.458" → "0.458"
function formatValue(raw: string): string {
  const n = Number(raw)
  if (!isNaN(n) && raw.trim() !== "") return String(parseFloat(n.toFixed(6)))
  return raw
}

// ─── Data extraction ──────────────────────────────────────────────────────────

type SpecRow = { key: string; label: string; value: string }

function extractMeta(metadata: Record<string, unknown> | null | undefined) {
  const meta = metadata ?? {}

  const features: string[] = FEATURE_KEYS
    .map((k) => meta[k] as string | undefined)
    .filter(Boolean) as string[]

  const benefits: string[] = BENEFIT_KEYS
    .map((k) => meta[k] as string | undefined)
    .filter(Boolean) as string[]

  const productSpecs: SpecRow[] = []
  const packInfo: SpecRow[] = []

  for (const [key, raw] of Object.entries(meta)) {
    if (HIDDEN_KEYS.has(key) || DESCRIPTION_ONLY.has(key)) continue
    const value = formatValue(String(raw ?? ""))
    if (!value) continue
    const row: SpecRow = { key, label: toLabel(key), value }
    if (PACK_KEYS.has(key)) packInfo.push(row)
    else productSpecs.push(row)
  }

  return { features, benefits, productSpecs, packInfo }
}

// ─── Component ───────────────────────────────────────────────────────────────

type Tab = "desc" | "specs" | "pack" | "delivery"

const TABS: { id: Tab; label: string }[] = [
  { id: "desc",     label: "Description" },
  { id: "specs",    label: "Product Details" },
  { id: "pack",     label: "Pack & Trade Info" },
  { id: "delivery", label: "Delivery & Returns" },
]

export default function ProductTabs({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const [active, setActive] = useState<Tab>("desc")
  const { features, benefits, productSpecs, packInfo } = extractMeta(
    product.metadata as Record<string, unknown>
  )

  return (
    <div className="mb-16">
      {/* Tab bar */}
      <div className="flex border-b border-brand-border mb-8 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
              active === t.id
                ? "border-b-2 border-safety-orange text-navy"
                : "text-grey-50 hover:text-navy"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 1. Description ──────────────────────────────────────────────────── */}
      {active === "desc" && (
        <div className="max-w-4xl space-y-6">
          {product.description && (
            <p className="text-grey-70 leading-relaxed">{product.description}</p>
          )}

          {features.length > 0 && (
            <div>
              <h4 className="font-headline text-navy text-base uppercase tracking-wider mb-3">
                Key Features
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-grey-70">
                    <span className="material-symbols-outlined text-safety-orange shrink-0 mt-0.5" style={{ fontSize: 18 }}>
                      check_circle
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {benefits.length > 0 && (
            <div>
              <h4 className="font-headline text-navy text-base uppercase tracking-wider mb-3">
                Key Benefits
              </h4>
              <ul className="space-y-2">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-grey-70">
                    <span className="material-symbols-outlined text-navy shrink-0 mt-0.5" style={{ fontSize: 16 }}>
                      arrow_forward
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!product.description && features.length === 0 && benefits.length === 0 && (
            <p className="text-grey-50 italic">No description available.</p>
          )}
        </div>
      )}

      {/* ── 2. Product Details ───────────────────────────────────────────────── */}
      {active === "specs" && (
        <div className="max-w-4xl">
          {productSpecs.length > 0 ? (
            <SpecTable rows={productSpecs} />
          ) : (
            <p className="text-grey-50 italic">No product specifications available.</p>
          )}
        </div>
      )}

      {/* ── 3. Pack & Trade Info ─────────────────────────────────────────────── */}
      {active === "pack" && (
        <div className="max-w-4xl">
          {packInfo.length > 0 ? (
            <>
              <p className="text-sm text-grey-50 mb-4">
                Pricing and availability may vary for bulk orders. Contact us for trade quantities.
              </p>
              <SpecTable rows={packInfo} />
            </>
          ) : (
            <p className="text-grey-50 italic">No pack information available.</p>
          )}
        </div>
      )}

      {/* ── 4. Delivery & Returns ────────────────────────────────────────────── */}
      {active === "delivery" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <div className="bg-white border border-brand-border p-6">
            <h4 className="font-headline text-lg mb-4 flex items-center gap-2 text-navy">
              <span className="material-symbols-outlined text-safety-orange">local_shipping</span>
              Delivery Information
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <div className="font-semibold text-navy">Next Day Delivery</div>
                <div className="text-grey-50 mt-1">
                  Order before 4 PM for next working day delivery. £5.99 or FREE over £50.
                </div>
              </li>
              <li>
                <div className="font-semibold text-navy">Click &amp; Collect</div>
                <div className="text-grey-50 mt-1">
                  Available at selected locations. Ready in as little as 1 hour.
                </div>
              </li>
              <li>
                <div className="font-semibold text-navy">Standard Delivery</div>
                <div className="text-grey-50 mt-1">
                  3–5 working days. £3.99 or FREE over £50.
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-brand-border p-6">
            <h4 className="font-headline text-lg mb-4 flex items-center gap-2 text-navy">
              <span className="material-symbols-outlined text-safety-orange">assignment_return</span>
              Trade Returns
            </h4>
            <p className="text-sm text-grey-70 mb-4">
              30-day no-quibble return policy for trade account holders. Items must be
              in original packaging and condition.
            </p>
            <p className="text-sm text-grey-70 mb-4">
              Faulty or damaged goods will be collected and replaced at no charge.
            </p>
            <a
              href="#"
              className="text-navy font-bold underline text-sm hover:text-safety-orange transition-colors"
            >
              Full Returns Policy →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function SpecTable({ rows }: { rows: SpecRow[] }) {
  return (
    <div className="border border-brand-border">
      <table className="w-full text-left">
        <tbody className="divide-y divide-brand-border">
          {rows.map((s, i) => (
            <tr key={s.key} className={i % 2 === 0 ? "bg-brand-surface" : "bg-white"}>
              <th className="px-6 py-3 text-sm font-semibold text-navy w-2/5">
                {s.label}
              </th>
              <td className="px-6 py-3 text-sm text-grey-70">{s.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
