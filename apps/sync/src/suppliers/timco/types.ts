// Verified against real API responses.

export interface TimcoProduct {
  id: number
  sku: string
  status: 'Active' | 'Inactive' | string
  productName: string
  topLevelCat: string
}

export interface TimcoStock {
  sku: string
  currentStock: number
}

export interface TimcoCustomerPricing {
  product: string             // SKU
  grossPrice: number          // RRP in GBP pounds
  discountedPrice: number     // our trade price in GBP pounds
  multipleAUnit: string       // e.g. "CTN"
  multipleAQty: number
  multipleAUnitPrice: number
  multipleBUnit: string       // e.g. "PLT"
  multipleBQty: number
  multipleBUnitPrice: number
  qtyBreakAQty: number
  qtyBreakAUnitPrice: number
  qtyBreakAUnit: string | null
  qtyBreakBQty: number
  qtyBreakBUnitPrice: number
  qtyBreakBUnit: string | null
}

export interface TimcoAttribute {
  productId: number
  productCode: string
  attributeName: string
  attributeValue: string
}

export interface TimcoImage {
  sku: string
  assetTypeName: string
  url: string
  relation: number      // 1 = primary image
  fileName: string
}

export interface TimcoEnrichedProduct {
  product: TimcoProduct
  stock: TimcoStock | undefined
  pricing: TimcoCustomerPricing | undefined
  attributes: TimcoAttribute[]
  images: TimcoImage[]
}

// Helper: pull a single attribute value by name
export function attr(attributes: TimcoAttribute[], name: string): string | undefined {
  return attributes.find((a) => a.attributeName === name)?.attributeValue
}
