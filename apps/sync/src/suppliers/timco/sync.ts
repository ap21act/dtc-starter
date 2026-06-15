import { TimcoClient } from './client'
import { transformProduct } from './transform'
import type { TimcoEnrichedProduct } from './types'
import { getMedusaClient } from '../../shared/medusa'
import { hashOf, getHash, getMedusaId, setState } from '../../shared/state'
import { inBatches } from '../../shared/batch'
import { makeLogger } from '../../shared/logger'

const logger = makeLogger('timco:sync')
const SUPPLIER = 'timco'

// How many per-SKU detail requests to fire in parallel
const DETAIL_CONCURRENCY = 20
// How many products to upsert in parallel
const UPSERT_CONCURRENCY = 5
// Log progress every N products
const LOG_EVERY = 200

export async function syncTimco() {
  const username = process.env.TIMCO_USERNAME
  const password = process.env.TIMCO_PASSWORD

  if (!username || !password) {
    logger.warn('TIMCO_USERNAME or TIMCO_PASSWORD not set — skipping TIMCO sync')
    return
  }

  logger.info('=== TIMCO sync started ===')
  const start = Date.now()

  const client = new TimcoClient(username, password)
  const medusa = getMedusaClient()

  // Bulk fetches — 2 requests total
  const [allProducts, allStock] = await Promise.all([
    client.getProducts(),
    client.getAllStock(),
  ])

  logger.info(`Fetched ${allProducts.length} products, ${allStock.length} stock records`)

  const stockMap = client.buildStockMap(allStock)

  // Identify changed products via hash of bulk data
  const changedProducts = allProducts.filter((p) => {
    const stockEntry = stockMap.get(p.sku)
    const combined = { ...p, stock: stockEntry }
    return hashOf(combined) !== getHash(SUPPLIER, p.sku)
  })

  logger.info(`${changedProducts.length} of ${allProducts.length} products need syncing`)

  if (changedProducts.length === 0) {
    logger.info('Nothing to sync. Done.')
    return
  }

  const salesChannelId = await medusa.getDefaultSalesChannel()

  // Pre-build collection map: topLevelCat → Medusa collection ID
  logger.info('Ensuring Medusa collections for TIMCO categories...')
  const uniqueCategories = [...new Set(
    changedProducts.map((p) => p.topLevelCat).filter(Boolean)
  )] as string[]
  const collectionMap = new Map<string, string>()
  for (const cat of uniqueCategories) {
    const id = await medusa.ensureCollection(cat)
    collectionMap.set(cat, id)
  }
  logger.info(`${collectionMap.size} collections ready`)

  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0
  let processed = 0

  // Stream: enrich a chunk → upsert it → save state → next chunk
  // This avoids loading all 8k enriched products into memory at once.
  for (let i = 0; i < changedProducts.length; i += DETAIL_CONCURRENCY) {
    const chunk = changedProducts.slice(i, i + DETAIL_CONCURRENCY)

    // Enrich chunk in parallel
    const enriched = await Promise.all(
      chunk.map(async (product): Promise<TimcoEnrichedProduct> => {
        const [attributes, images, pricing] = await Promise.all([
          client.getAttributes(product.sku),
          client.getImages(product.sku),
          client.getPricing(product.sku),
        ])
        return { product, stock: stockMap.get(product.sku), pricing, attributes, images }
      })
    )

    // Upsert enriched chunk
    const stateUpdates: Parameters<typeof setState>[0] = []

    await inBatches(enriched, UPSERT_CONCURRENCY, async (e) => {
      const collectionId = e.product.topLevelCat
        ? collectionMap.get(e.product.topLevelCat)
        : undefined
      const payload = transformProduct(e, salesChannelId, collectionId)
      if (!payload) { skipped++; return }

      const existingId = getMedusaId(SUPPLIER, e.product.sku)

      try {
        const medusaId = await medusa.upsertProduct(payload, existingId)

        const stockEntry = stockMap.get(e.product.sku)
        if (stockEntry?.currentStock !== undefined) {
          await medusa.updateStock(medusaId, e.product.sku, stockEntry.currentStock)
        }

        const combined = { ...e.product, stock: stockEntry }
        stateUpdates.push({
          supplier: SUPPLIER,
          sku: e.product.sku,
          hash: hashOf(combined),
          medusaId,
        })

        existingId ? updated++ : created++
      } catch (err: any) {
        const detail = err.response?.data
          ? JSON.stringify(err.response.data).slice(0, 300)
          : err.message
        logger.error(`Failed to upsert ${e.product.sku}: ${detail}`)
        errors++
      }
    })

    if (stateUpdates.length > 0) setState(stateUpdates)

    processed += chunk.length
    if (processed % LOG_EVERY === 0 || processed === changedProducts.length) {
      const pct = ((processed / changedProducts.length) * 100).toFixed(1)
      const elapsed = ((Date.now() - start) / 1000).toFixed(0)
      logger.info(
        `Progress: ${processed}/${changedProducts.length} (${pct}%) — ` +
        `created: ${created}, updated: ${updated}, skipped: ${skipped}, errors: ${errors} — ${elapsed}s elapsed`
      )
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  logger.info(
    `=== TIMCO sync complete in ${elapsed}s — created: ${created}, updated: ${updated}, skipped: ${skipped}, errors: ${errors} ===`
  )
}
