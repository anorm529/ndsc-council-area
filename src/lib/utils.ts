/** Format a Date or ISO string as dd/mm/yyyy */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Format a Date or ISO string as "3 Jun 2025" */
export function formatDateLong(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Format a currency amount (accepts Prisma Decimal, number, string, or null) */
export function formatCurrency(amount: { toString(): string } | number | string | null | undefined, currency = 'GBP'): string {
  if (amount === null || amount === undefined) return '—'
  const n = typeof amount === 'number' ? amount : parseFloat(amount.toString())
  if (isNaN(n)) return '—'
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(n)
}

/** Returns true if a date (Date | string) is in the past */
export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return d < new Date()
}

/** Returns true if a date is within the next N days */
export function isDueWithin(date: Date | string | null | undefined, days: number): boolean {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const limit = new Date()
  limit.setDate(limit.getDate() + days)
  return d >= now && d <= limit
}

/** Returns today as YYYY-MM-DD for input[type=date] defaults */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}
