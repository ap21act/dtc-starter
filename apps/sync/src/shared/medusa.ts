import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import { makeLogger } from './logger'

const logger = makeLogger('medusa')

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://medusa:9000'
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL!
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD!

export interface MedusaProductPayload {
  title: string
  handle: string
  description?: string
  status: 'published' | 'draft'
  external_id: string
  thumbnail?: string
  images?: { url: string }[]
  options?: { title: string; values: string[] }[]
  variants?: MedusaVariantPayload[]
  sales_channels?: { id: string }[]
  metadata?: Record<string, unknown>
}

export interface MedusaVariantPayload {
  title: string
  sku: string
  manage_inventory: boolean
  prices: { currency_code: string; amount: number }[]
  weight?: number
  length?: number
  height?: number
  width?: number
  barcode?: string
  ean?: string
  metadata?: Record<string, unknown>
}

class MedusaClient {
  private http: AxiosInstance
  private token: string | null = null
  private tokenExpiry: number = 0
  // Mutex: all concurrent ensureToken calls share one pending Promise
  private tokenFetch: Promise<void> | null = null

  constructor() {
    this.http = axios.create({ baseURL: BACKEND_URL })
    axiosRetry(this.http, {
      retries: 2,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (err) => {
        const status = err.response?.status
        return !!status && status >= 500
      },
    })

    this.http.interceptors.request.use(async (config) => {
      await this.ensureToken()
      config.headers.Authorization = `Bearer ${this.token}`
      return config
    })

    // Re-auth once on 401
    this.http.interceptors.response.use(
      (res) => res,
      async (err) => {
        if (err.response?.status === 401 && !err.config._retried) {
          this.token = null
          this.tokenExpiry = 0
          this.tokenFetch = null
          err.config._retried = true
          await this.ensureToken()
          err.config.headers.Authorization = `Bearer ${this.token}`
          return this.http.request(err.config)
        }
        throw err
      }
    )
  }

  private async ensureToken(): Promise<void> {
    if (this.token && Date.now() < this.tokenExpiry) return
    // Dedup: concurrent callers all await the same in-flight request
    if (!this.tokenFetch) {
      this.tokenFetch = this._doAuth().finally(() => {
        this.tokenFetch = null
      })
    }
    return this.tokenFetch
  }

  private async _doAuth(): Promise<void> {
    logger.info(`Authenticating as ${ADMIN_EMAIL}...`)
    const res = await axios.post(`${BACKEND_URL}/auth/user/emailpass`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })
    if (!res.data?.token) {
      logger.error('Auth response missing token:', JSON.stringify(res.data))
      throw new Error('Medusa auth failed: no token in response')
    }
    this.token = res.data.token
    this.tokenExpiry = Date.now() + 23 * 60 * 60 * 1000
    logger.info('Medusa admin authenticated')
  }

  async getDefaultSalesChannel(): Promise<string | undefined> {
    try {
      const res = await this.http.get('/admin/sales-channels?limit=1')
      const channels = res.data?.sales_channels
      if (!channels || channels.length === 0) {
        logger.warn('No sales channels found in Medusa')
        return undefined
      }
      logger.info(`Using sales channel: ${channels[0].id} (${channels[0].name})`)
      return channels[0].id
    } catch (err: any) {
      logger.error('Failed to fetch sales channels:', err.response?.data ?? err.message)
      return undefined
    }
  }

  async upsertProduct(
    payload: MedusaProductPayload,
    existingId?: string
  ): Promise<string> {
    // Fast path: we know the Medusa product ID from a previous sync
    if (existingId) {
      return this.updateProduct(existingId, payload)
    }

    // Lookup 1: by external_id (most reliable — we set this ourselves)
    const byExtId = await this.findProduct('external_id', payload.external_id)
    if (byExtId) return this.updateProduct(byExtId, payload)

    // Lookup 2: by handle
    const byHandle = await this.findProduct('handle', payload.handle)
    if (byHandle) return this.updateProduct(byHandle, payload)

    // Try create
    try {
      const res = await this.http.post('/admin/products', payload)
      return res.data.product.id
    } catch (err: any) {
      // Variant SKU conflict from a previous partial run — find and update
      if (err.response?.data?.message?.includes('already exists')) {
        const sku = payload.variants?.[0]?.sku
        if (sku) {
          const id = await this.findProductByVariantSku(sku)
          if (id) return this.updateProduct(id, payload)
        }
      }
      throw err
    }
  }

  private async findProduct(field: string, value: string): Promise<string | undefined> {
    try {
      const res = await this.http.get(
        `/admin/products?${field}=${encodeURIComponent(value)}&limit=1`
      )
      return res.data?.products?.[0]?.id
    } catch {
      return undefined
    }
  }

  private async findProductByVariantSku(sku: string): Promise<string | undefined> {
    try {
      // Use the variants admin endpoint to find by exact SKU
      const res = await this.http.get(
        `/admin/variants?sku=${encodeURIComponent(sku)}&limit=1`
      )
      const variant = res.data?.variants?.[0]
      return variant?.product_id
    } catch {
      return undefined
    }
  }

  // Update an existing product — fetches existing variant IDs so Medusa
  // updates variants in-place rather than trying to create new ones.
  private async updateProduct(id: string, payload: MedusaProductPayload): Promise<string> {
    let variantsWithIds = payload.variants

    if (payload.variants?.length) {
      try {
        const existing = await this.http.get(`/admin/products/${id}?fields=id,variants.id,variants.sku`)
        const existingVariants: any[] = existing.data?.product?.variants ?? []
        const skuToId = new Map(existingVariants.map((v: any) => [v.sku, v.id]))

        variantsWithIds = payload.variants.map((v) => ({
          ...v,
          ...(skuToId.has(v.sku) ? { id: skuToId.get(v.sku) } : {}),
        }))
      } catch {
        // If we can't fetch variant IDs, proceed without them (will fail on conflict but that's fine)
      }
    }

    await this.http.post(`/admin/products/${id}`, { ...payload, variants: variantsWithIds })
    return id
  }

  // Returns the Medusa collection ID for a given title, creating it if needed.
  async ensureCollection(title: string): Promise<string> {
    const handle = `timco-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    try {
      const res = await this.http.get(`/admin/collections?handle=${encodeURIComponent(handle)}&limit=1`)
      const col = res.data?.collections?.[0]
      if (col) return col.id
    } catch {}
    const res = await this.http.post('/admin/collections', { title, handle })
    return res.data.collection.id
  }

  async updateStock(productId: string, sku: string, quantity: number) {
    try {
      const ivRes = await this.http.get(
        `/admin/inventory-items?sku=${encodeURIComponent(sku)}`
      )
      const item = ivRes.data?.inventory_items?.[0]
      if (!item) return

      // Get stock locations and update the first one
      const locRes = await this.http.get('/admin/stock-locations?limit=1')
      const location = locRes.data?.stock_locations?.[0]
      if (!location) return

      await this.http.post(
        `/admin/inventory-items/${item.id}/location-levels`,
        { location_id: location.id, stocked_quantity: quantity }
      ).catch(() => {
        // Level may already exist — try PATCH instead
        return this.http.post(
          `/admin/inventory-items/${item.id}/location-levels/${location.id}`,
          { stocked_quantity: quantity }
        ).catch(() => {})
      })
    } catch (err: any) {
      logger.warn(`Stock update skipped for ${sku}: ${err.message}`)
    }
  }

  async updatePrice(sku: string, pricePence: number) {
    try {
      // Find variant by SKU
      const varRes = await this.http.get(
        `/admin/variants?sku=${encodeURIComponent(sku)}&fields=id,product_id`
      )
      const variant = varRes.data?.variants?.[0]
      if (!variant) {
        logger.warn(`Variant not found for SKU: ${sku}`)
        return
      }

      // Update variant prices (GBP currency)
      await this.http.post(`/admin/variants/${variant.id}`, {
        prices: [{ currency_code: 'gbp', amount: pricePence }]
      })
    } catch (err: any) {
      logger.warn(`Price update skipped for ${sku}: ${err.message}`)
    }
  }
}

let _client: MedusaClient | null = null

export function getMedusaClient(): MedusaClient {
  if (!_client) _client = new MedusaClient()
  return _client
}
