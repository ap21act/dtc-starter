# Two-Tier Sync Architecture

## Overview

The sync system now uses two distinct strategies to keep your product database current while minimizing API load:

```
TIMCO API (Azure)
    ├─ FULL SYNC (once daily)     → All products + complete details
    └─ PRICE/STOCK (every 10 min) → Pricing & inventory only
         ↓
    Medusa Backend Database
         ↓
    Storefront (reads from Medusa, not TIMCO)
```

---

## 1. FULL CATALOG SYNC

**When:** Startup + Daily at 2 AM  
**Duration:** ~5-10 minutes (for 8,000+ products)  
**API Calls:** ~8000 products + enrichment calls

### What It Does

Fetches complete product information including:
- ✓ Product catalog (all 8,000+ SKUs)
- ✓ Product attributes (brand, material, pack qty, dimensions, weight)
- ✓ Product images (all images sorted by relation order)
- ✓ Base pricing (trade price)
- ✓ Stock levels
- ✓ Creates/updates Medusa products with full metadata

### Code Location

```typescript
// apps/sync/src/suppliers/timco/sync.ts
export async function syncTimcoFullCatalog() {
  // Fetches all products with attributes, images, pricing
  // Stores in Medusa with complete enrichment
}
```

### Schedule

```typescript
// apps/sync/src/index.ts

// 1. Run on startup (after 5 seconds for DB init)
setTimeout(() => runFullSync(), 5000)

// 2. Run daily at 2 AM
cron.schedule('0 2 * * *', () => runFullSync())
```

### Database Result

```javascript
{
  id: "prod_...",
  title: "TIMCO Product Name",
  handle: "timco-sku-...",
  description: "Full product description",
  
  // All attributes stored as metadata
  metadata: {
    brand: "TIMCO",
    material: "Steel",
    pack_qty: "1000",
    pack_unit: "Pieces",
    moq: "10",
    weight_kg: 1.5,
    dimensions: { length: 135, width: 90, height: 90 },
    supplier: "timco",
    // ...all TIMCO attributes
  },
  
  // Images
  images: [
    { url: "https://timco.com/image1.jpg" },
    { url: "https://timco.com/image2.jpg" }
  ],
  
  // Pricing + stock
  variants: [{
    sku: "104Y",
    calculated_price: 1095,  // pence (£10.95 with 40% markup)
    inventory_quantity: 500  // from TIMCO stock
  }]
}
```

---

## 2. LIGHTWEIGHT PRICE & STOCK UPDATE

**When:** Every 10 minutes (starts 1 minute after startup)  
**Duration:** ~10-30 seconds  
**API Calls:** 2 bulk calls only (products + stock)

### What It Does

Updates ONLY pricing and inventory:
- ✓ Fetches current trade pricing from TIMCO
- ✓ Calculates retail price (trade × 1.4 markup)
- ✓ Updates variant prices in Medusa
- ✓ Fetches current stock levels
- ✓ Updates inventory quantities in Medusa

### Why It's Fast

- **2 API calls total** (vs 8,000+ for full sync)
- **No enrichment** (attributes, images already in DB)
- **Per-SKU updates in parallel** (20 concurrent requests)
- **Lightweight payload** (just numbers)

### Code Location

```typescript
// apps/sync/src/suppliers/timco/sync.ts
export async function syncTimcoPriceAndStock() {
  // Fetch only TIMCO products + stock (2 calls)
  // For each product: update price + stock
  // Skip products not yet in database
}
```

### Schedule

```typescript
// apps/sync/src/index.ts

// 1. First update 1 minute after startup
setTimeout(() => {
  runPriceStockUpdate()
  
  // 2. Then every 10 minutes
  cron.schedule('*/10 * * * *', () => runPriceStockUpdate())
}, 60000)
```

### Database Updates

```javascript
// Before (from full sync)
{
  id: "prod_...",
  variants: [{
    sku: "104Y",
    calculated_price: 1095,
    inventory_quantity: 500
  }]
}

// After 10-minute update
{
  id: "prod_...",
  variants: [{
    sku: "104Y",
    calculated_price: 1120,  // Updated from TIMCO
    inventory_quantity: 450  // Updated from TIMCO stock
  }]
}
```

---

## API Call Comparison

| Operation | Calls | Time | Frequency |
|-----------|-------|------|-----------|
| **Full Sync** | ~8,100 | 5-10 min | Daily (2 AM) + startup |
| **Price/Stock** | 2 | 10-30 sec | Every 10 minutes |
| **Total/Day** | ~2,900 | ~4 hrs | 2 full + 144 light |

---

## Environment Variables

```bash
# Root .env
TIMCO_USERNAME=bharat@kingsburygroup.co.uk
TIMCO_PASSWORD=xg5RRz):WZ9!t%04c9sC
TIMCO_MARKUP_MULTIPLIER=1.4              # 40% markup on trade price
TIMCO_BASE_URL=https://timcoproductapi.azurewebsites.net

# FTP (optional, second supplier)
FTP_HOST=ftp.supplier.com
FTP_USERNAME=username
FTP_PASSWORD=password

# Medusa (for sync service auth)
MEDUSA_ADMIN_EMAIL=sushantbasnet2027@gmail.com
MEDUSA_ADMIN_PASSWORD=Qwerty@1.
```

---

## Data Flow

### Full Sync Flow

```
1. TimcoClient.getProducts()
   └─ GET https://timcoproductapi.azurewebsites.net/api/products
   └─ Returns: [{ sku, productName, topLevelCat, ... }]

2. TimcoClient.getAllStock()
   └─ GET https://timcoproductapi.azurewebsites.net/api/stock
   └─ Returns: [{ sku, currentStock, ... }]

3. For each changed product (in batches of 20):
   ├─ TimcoClient.getAttributes(sku)
   ├─ TimcoClient.getImages(sku)
   └─ TimcoClient.getPricing(sku)

4. transformProduct()
   ├─ Calculate price: trade × markup
   ├─ Extract metadata from attributes
   ├─ Map images
   └─ Build Medusa payload

5. MedusaClient.upsertProduct()
   ├─ Create or update product
   ├─ Add pricing
   └─ Set initial stock

6. setState()
   └─ Store hash of synced data (detect future changes)
```

### Price/Stock Update Flow

```
1. TimcoClient.getProducts()
   └─ GET /api/products (light - just SKUs + names)

2. TimcoClient.getAllStock()
   └─ GET /api/stock (just SKUs + quantities)

3. For each product (in batches of 5):
   ├─ Find product in Medusa by SKU
   ├─ TimcoClient.getPricing(sku)
   ├─ MedusaClient.updatePrice(sku, pricePence)
   └─ MedusaClient.updateStock(sku, quantity)
```

---

## Storefront Integration

Your storefront **never calls TIMCO APIs directly**:

```typescript
// Storefront code (apps/storefront)
const { products } = await listProducts({
  countryCode: 'gb',
  queryParams: { limit: 100 }
})

// This queries Medusa, which has synced TIMCO data
// GET http://localhost:9000/store/products?limit=100&region_id=...
```

**Benefits:**
- ✓ Storefront is independent of TIMCO uptime
- ✓ Products cached in your database
- ✓ Filters work on Medusa product metadata
- ✓ No external API calls from browser

---

## Monitoring & Logs

Watch the sync service logs:

```bash
docker logs medusa_sync

# Full sync startup log:
# 🚀 Sync scheduler starting...
# === TIMCO FULL CATALOG SYNC started ===
# Fetched 8000 products, 8000 stock records
# 7950 of 8000 products need syncing
# Ensuring Medusa collections for TIMCO categories...
# ... progress updates ...
# === TIMCO FULL CATALOG SYNC complete in 432.5s — created: 100, updated: 7850 ===

# Price/stock update log (every 10 min):
# === TIMCO PRICE & STOCK UPDATE started ===
# Fetched pricing for 8000 products, 8000 stock records
# === TIMCO PRICE & STOCK UPDATE complete in 18.2s — price updates: 450, stock updates: 450 ===
```

---

## Handling Failures

Both sync functions use error handling:

```typescript
// Full sync: continues even if individual products fail
try {
  const medusaId = await medusa.upsertProduct(payload, existingId)
  // ... update stock ...
} catch (err) {
  logger.error(`Failed to upsert ${sku}: ${err.message}`)
  errors++ // Continue with next product
}

// Price/stock: skips products not yet in database
const medusaId = getMedusaId(SUPPLIER, product.sku)
if (!medusaId) return // Skip - not synced yet
```

---

## Future Enhancements

- [ ] Manual full sync endpoint (POST /admin/sync/timco/full)
- [ ] Sync progress webhook
- [ ] Email alerts on sync failures
- [ ] Configurable markup per category
- [ ] Product expiration (remove unlisted items)
- [ ] Sync retry backoff with exponential delays

---

## Summary

| Aspect | Details |
|--------|---------|
| **Strategy** | Two-tier: full daily + lightweight every 10 min |
| **Product Count** | 8,000+ TIMCO SKUs |
| **API Calls/Day** | ~2,900 (mostly lightweight) |
| **Time/Day** | ~4 hours (mostly full sync) |
| **Price Currency** | GBP (pence) |
| **Markup** | 40% (configurable) |
| **Database** | Medusa (complete product info) |
| **Storefront** | Reads from Medusa (no TIMCO API calls) |

