import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import { makeLogger } from '../../shared/logger'
import type { TimcoProduct, TimcoStock, TimcoCustomerPricing, TimcoAttribute, TimcoImage } from './types'

const logger = makeLogger('timco:client')
const BASE_URL = process.env.TIMCO_BASE_URL || 'https://timcoproductapi.azurewebsites.net'

export class TimcoClient {
  private http: AxiosInstance
  private token: string | null = null
  private tokenExpiry: number = 0
  private tokenFetch: Promise<void> | null = null

  constructor(
    private readonly username: string,
    private readonly password: string
  ) {
    this.http = axios.create({ baseURL: BASE_URL })
    axiosRetry(this.http, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (err) => {
        const status = err.response?.status
        return !status || status >= 500 || status === 429
      },
    })

    this.http.interceptors.request.use(async (config) => {
      await this.ensureToken()
      config.headers.Authorization = `bearer ${this.token}`
      return config
    })

    // Re-auth on 401
    this.http.interceptors.response.use(
      (res) => res,
      async (err) => {
        if (err.response?.status === 401 && !err.config._retried) {
          this.token = null
          this.tokenExpiry = 0
          err.config._retried = true
          await this.ensureToken()
          err.config.headers.Authorization = `bearer ${this.token}`
          return this.http.request(err.config)
        }
        throw err
      }
    )
  }

  private async ensureToken(): Promise<void> {
    if (this.token && Date.now() < this.tokenExpiry) return
    if (!this.tokenFetch) {
      this.tokenFetch = this._doAuth().finally(() => { this.tokenFetch = null })
    }
    return this.tokenFetch
  }

  private async _doAuth(): Promise<void> {
    logger.info('Fetching TIMCO auth token...')
    const res = await axios.post(`${BASE_URL}/api/Auth/login`, {
      username: this.username,
      password: this.password,
    })
    this.token = res.data
    this.tokenExpiry = Date.now() + 23 * 60 * 60 * 1000
    logger.info('TIMCO token acquired')
  }

  async getProducts(): Promise<TimcoProduct[]> {
    logger.info('Fetching all TIMCO products...')
    const res = await this.http.get<TimcoProduct[]>('/api/products')
    return res.data
  }

  async getAllStock(): Promise<TimcoStock[]> {
    logger.info('Fetching all TIMCO stock...')
    const res = await this.http.get<TimcoStock[]>('/api/stock')
    return res.data
  }

  async getAttributes(sku: string): Promise<TimcoAttribute[]> {
    try {
      const res = await this.http.get<TimcoAttribute[]>(`/api/attributes/ByProductSku/${sku}`)
      return res.data ?? []
    } catch {
      return []
    }
  }

  async getImages(sku: string): Promise<TimcoImage[]> {
    try {
      const res = await this.http.get<TimcoImage[]>(`/api/productImages/${sku}`)
      return res.data ?? []
    } catch {
      return []
    }
  }

  async getPricing(sku: string): Promise<TimcoCustomerPricing | undefined> {
    try {
      const res = await this.http.get<TimcoCustomerPricing>(`/api/customerPricing/${sku}`)
      return res.data
    } catch {
      return undefined
    }
  }

  /** Build a SKU→stock map from the bulk stock endpoint (one call instead of N). */
  buildStockMap(stocks: TimcoStock[]): Map<string, TimcoStock> {
    return new Map(stocks.map((s) => [s.sku, s]))
  }
}
