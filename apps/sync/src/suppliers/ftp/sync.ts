import { makeLogger } from '../../shared/logger'

const logger = makeLogger('ftp:sync')

export async function syncFtp() {
  const host = process.env.FTP_HOST
  const username = process.env.FTP_USERNAME
  const password = process.env.FTP_PASSWORD

  if (!host || !username || !password) {
    logger.warn('FTP_HOST / FTP_USERNAME / FTP_PASSWORD not set — skipping FTP sync')
    return
  }

  // TODO: implement once Excel file structure is shared.
  //
  // Steps will be:
  //   1. FtpSupplierClient.downloadExcelFiles()
  //   2. Parse each Excel file
  //   3. Join files by productCode (primary key)
  //   4. Apply cross-file markup conditions
  //   5. Hash-diff against state
  //   6. Upsert changed products to Medusa via getMedusaClient()
  //
  // Paste the .txt docs and this will be completed immediately.

  logger.warn('FTP sync not yet implemented — waiting for Excel file structure')
}
