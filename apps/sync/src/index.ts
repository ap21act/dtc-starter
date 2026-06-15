import cron from 'node-cron'
import { syncTimcoFullCatalog, syncTimcoPriceAndStock } from './suppliers/timco/sync'
import { syncFtp } from './suppliers/ftp/sync'
import { makeLogger } from './shared/logger'

const logger = makeLogger('scheduler')

/**
 * FULL CATALOG SYNC
 * Runs once on startup + once daily at 2 AM
 * Fetches all products with complete details (attributes, images, metadata)
 */
async function runFullSync() {
  logger.info('Starting FULL catalog sync (TIMCO + FTP)...')
  await Promise.allSettled([
    syncTimcoFullCatalog().catch((err) => logger.error('TIMCO full sync failed', err)),
    syncFtp().catch((err) => logger.error('FTP sync failed', err)),
  ])
  logger.info('Full catalog sync complete.')
}

/**
 * LIGHTWEIGHT PRICE & STOCK UPDATE
 * Runs every 10 minutes
 * Only fetches pricing and inventory, updates existing products quickly
 */
async function runPriceStockUpdate() {
  await syncTimcoPriceAndStock().catch((err) => logger.error('TIMCO price/stock update failed', err))
}

// ──────────────────────────────────────────────────────────────────────────
// STARTUP SEQUENCE
// ──────────────────────────────────────────────────────────────────────────

logger.info('🚀 Sync scheduler starting...')

// 1. Full sync on startup (wait 5 seconds to let DB init)
setTimeout(() => {
  runFullSync()
}, 5000)

// 2. Schedule full sync daily at 2 AM
cron.schedule('0 2 * * *', () => {
  logger.info('Daily full sync triggered (2 AM)')
  runFullSync()
})

// 3. Schedule price/stock updates every 10 minutes (starts 1 min after startup)
setTimeout(() => {
  runPriceStockUpdate()
  // Then every 10 minutes: cron pattern "*/10 * * * *"
  cron.schedule('*/10 * * * *', () => {
    logger.info('10-minute price/stock update triggered')
    runPriceStockUpdate()
  })
}, 60000)

logger.info('✅ Sync scheduler initialized:')
logger.info('   • Full sync: on startup + daily at 2 AM')
logger.info('   • Price/stock: every 10 minutes (starts 1 min after startup)')
