import type { TimcoEnrichedProduct } from './types'
import { attr } from './types'
import type { MedusaProductPayload } from '../../shared/medusa'

// Markup by top-level category — multiplier on top of trade (discountedPrice).
// e.g. 1.4 = sell at 40% above what we pay. Add more categories as needed.
const MARKUP_BY_CATEGORY: Record<string, number> = {
  default: parseFloat(process.env.TIMCO_MARKUP_MULTIPLIER || '1.4'),
}

function markupFor(category: string | null | undefined): number {
  if (!category) return MARKUP_BY_CATEGORY.default
  return MARKUP_BY_CATEGORY[category.toLowerCase()] ?? MARKUP_BY_CATEGORY.default
}

function toHandle(sku: string): string {
  return `timco-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

// Parse "L x W x H mm" string into mm integers
function parseDimensions(raw: string | undefined): { length?: number; width?: number; height?: number } {
  if (!raw) return {}
  const parts = raw.replace(/mm/i, '').split('x').map((s) => parseInt(s.trim(), 10))
  if (parts.length !== 3 || parts.some(isNaN)) return {}
  return { length: parts[0], width: parts[1], height: parts[2] }
}

export function transformProduct(
  enriched: TimcoEnrichedProduct,
  salesChannelId?: string,
  collectionId?: string
): MedusaProductPayload | null {
  const { product, stock, pricing, attributes, images } = enriched

  if (product.status !== 'Active') return null
  if (!product.productName) return null  // skip products with no title

  // ── Pricing ──────────────────────────────────────────────────────────────────
  const tradePrice = pricing?.discountedPrice ?? 0
  const markup = markupFor(product.topLevelCat)
  const retailPence = Math.round(tradePrice * markup * 100)

  // ── Description / metadata from attributes ────────────────────────────────
  const description = attr(attributes, 'Description') ?? ''
  const brand       = attr(attributes, 'Brand') ?? 'TIMCO'
  const barcode     = attr(attributes, 'SKU Barcode')
  const weightKg    = parseFloat(attr(attributes, 'Pack Weight kg') ?? '0')
  const weightGrams = isNaN(weightKg) ? undefined : Math.round(weightKg * 1000)
  const dims        = parseDimensions(attr(attributes, 'Pack Dimensions L x W x H mm'))
  const packQty     = attr(attributes, 'Pack Quantity')
  const packUnit    = attr(attributes, 'Pack Quantity Unit')
  const moq         = attr(attributes, 'MOQ')

  // ── Images ────────────────────────────────────────────────────────────────
  const sortedImages = [...images].sort((a, b) => a.relation - b.relation)
  const thumbnail = sortedImages[0]?.url
  const medusaImages = sortedImages.map((i) => ({ url: i.url }))

  // Collect all attributes as Medusa metadata for search/filtering
  const attrMeta = Object.fromEntries(
    attributes.map((a) => [
      a.attributeName.toLowerCase().replace(/\s+/g, '_'),
      a.attributeValue,
    ])
  )

  const payload: MedusaProductPayload = {
    title: product.productName,
    handle: toHandle(product.sku),
    description,
    status: 'published',
    external_id: `timco:${product.sku}`,
    ...(thumbnail ? { thumbnail } : {}),
    images: medusaImages,
    options: [{ title: 'Title', values: ['Default Title'] }],
    variants: [
      {
        title: 'Default Title',
        sku: product.sku,
        manage_inventory: true,
        prices: [{ currency_code: 'gbp', amount: retailPence }],
        ...(weightGrams ? { weight: weightGrams } : {}),
        ...(dims.length ? { length: dims.length } : {}),
        ...(dims.width ? { width: dims.width } : {}),
        ...(dims.height ? { height: dims.height } : {}),
        ...(barcode ? { barcode } : {}),
        metadata: {
          supplier: 'timco',
          trade_price_gbp: tradePrice,
          gross_price_gbp: pricing?.grossPrice,
          pack_qty: packQty,
          pack_unit: packUnit,
          moq,
        },
      },
    ],
    ...(salesChannelId ? { sales_channels: [{ id: salesChannelId }] } : {}),
    ...(collectionId ? { collection_id: collectionId } : {}),
    metadata: {
      supplier: 'timco',
      supplier_id: product.id,
      brand,
      category: product.topLevelCat,
      ...attrMeta,
    },
  }

  return payload
}
