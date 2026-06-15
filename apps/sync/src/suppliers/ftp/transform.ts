import type { FtpEnrichedProduct } from './types'
import type { MedusaProductPayload } from '../../shared/medusa'

// TODO: Define markup rules once Excel column structure is known.
// Structure will mirror timco/transform.ts with cross-file conditions.
//
// Example of what this will look like:
//   if (product.category === 'X' && pricing.priceBreak === 'Y') markup = 1.35
//   else if (...) markup = 1.45
//   else markup = 1.40

function toHandle(productCode: string): string {
  return `ftp-${productCode.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export function transformProduct(
  _enriched: FtpEnrichedProduct,
  _salesChannelId?: string
): MedusaProductPayload | null {
  // TODO: implement once Excel file structure is shared
  throw new Error('FTP transform not yet implemented — share Excel docs to complete this')
}
