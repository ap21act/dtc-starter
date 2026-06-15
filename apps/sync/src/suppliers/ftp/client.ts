import * as ftp from 'basic-ftp'
import * as XLSX from 'xlsx'
import { createWriteStream, mkdirSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import { makeLogger } from '../../shared/logger'

const logger = makeLogger('ftp:client')
const DOWNLOAD_DIR = '/tmp/ftp-excel'

export class FtpSupplierClient {
  constructor(
    private readonly host: string,
    private readonly username: string,
    private readonly password: string,
    private readonly port: number = 21
  ) {}

  async downloadExcelFiles(): Promise<string[]> {
    if (!existsSync(DOWNLOAD_DIR)) mkdirSync(DOWNLOAD_DIR, { recursive: true })

    const client = new ftp.Client()
    client.ftp.verbose = false

    try {
      await client.access({
        host: this.host,
        user: this.username,
        password: this.password,
        port: this.port,
        secure: false,
      })

      logger.info('FTP connected, listing files...')
      const list = await client.list()
      const excelFiles = list.filter(
        (f) => f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
      )

      logger.info(`Found ${excelFiles.length} Excel files`)
      const downloaded: string[] = []

      for (const file of excelFiles) {
        const localPath = path.join(DOWNLOAD_DIR, file.name)
        await client.downloadTo(localPath, file.name)
        downloaded.push(localPath)
        logger.info(`Downloaded: ${file.name}`)
      }

      return downloaded
    } finally {
      client.close()
    }
  }

  parseExcel(filePath: string): Record<string, unknown>[] {
    const workbook = XLSX.readFile(filePath)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_json(sheet)
  }

  parseAllSheets(filePath: string): Record<string, Record<string, unknown>[]> {
    const workbook = XLSX.readFile(filePath)
    const result: Record<string, Record<string, unknown>[]> = {}
    for (const name of workbook.SheetNames) {
      result[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name])
    }
    return result
  }
}
