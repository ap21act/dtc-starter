// Placeholder types — will be filled once Excel file structure is shared.
// Each field maps to a column in the supplier's Excel files.

export interface FtpProduct {
  productCode: string   // primary key — maps across all Excel files
  // TODO: add remaining fields from products Excel
}

export interface FtpPricing {
  productCode: string
  // TODO: add pricing fields + markup condition fields
}

export interface FtpStock {
  productCode: string
  // TODO: add stock quantity and location fields
}

export interface FtpStockLocation {
  locationCode: string
  // TODO: map location codes to delivery lead times / shipping options
}

export interface FtpEnrichedProduct {
  product: FtpProduct
  pricing: FtpPricing | undefined
  stock: FtpStock | undefined
  location: FtpStockLocation | undefined
}
