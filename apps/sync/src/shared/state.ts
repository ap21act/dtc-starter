import { createHash } from 'crypto'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const STATE_PATH = process.env.SYNC_STATE_PATH || '/server/data/sync-state.json'

interface State {
  hashes: Record<string, string>   // "supplier:sku" → data hash
  ids: Record<string, string>       // "supplier:sku" → medusa product id
}

function load(): State {
  try {
    if (existsSync(STATE_PATH)) {
      return JSON.parse(readFileSync(STATE_PATH, 'utf-8'))
    }
  } catch {}
  return { hashes: {}, ids: {} }
}

function save(state: State) {
  const dir = path.dirname(STATE_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))
}

export function hashOf(data: unknown): string {
  return createHash('md5').update(JSON.stringify(data)).digest('hex')
}

export function stateKey(supplier: string, sku: string) {
  return `${supplier}:${sku}`
}

export function getHash(supplier: string, sku: string): string | undefined {
  return load().hashes[stateKey(supplier, sku)]
}

export function getMedusaId(supplier: string, sku: string): string | undefined {
  return load().ids[stateKey(supplier, sku)]
}

export function setState(updates: { supplier: string; sku: string; hash: string; medusaId?: string }[]) {
  const state = load()
  for (const u of updates) {
    const key = stateKey(u.supplier, u.sku)
    state.hashes[key] = u.hash
    if (u.medusaId) state.ids[key] = u.medusaId
  }
  save(state)
}
