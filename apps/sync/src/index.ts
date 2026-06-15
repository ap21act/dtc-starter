import cron from 'node-cron'
import { syncTimco } from './suppliers/timco/sync'
import { syncFtp } from './suppliers/ftp/sync'
import { makeLogger } from './shared/logger'

const logger = makeLogger('scheduler')

async function runAll() {
  logger.info('Starting full product sync...')
  await Promise.allSettled([
    syncTimco().catch((err) => logger.error('TIMCO sync failed', err)),
    syncFtp().catch((err) => logger.error('FTP sync failed', err)),
  ])
  logger.info('Full product sync complete.')
}

// Run immediately on startup
runAll()

// Then every hour at :00
cron.schedule('0 * * * *', () => {
  logger.info('Hourly cron triggered')
  runAll()
})

logger.info('Sync scheduler running — next full sync in up to 1 hour')
