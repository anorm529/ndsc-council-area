import { Pool } from 'pg'

let mainPool: Pool | null = null

export function getMainPool(): Pool | null {
  const url = process.env.MAIN_DATABASE_URL
  if (!url) return null
  if (!mainPool) {
    mainPool = new Pool({ connectionString: url, max: 3 })
  }
  return mainPool
}
