import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { canViewFinance } from '@/lib/permissions'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { StatsCard } from '@/components/council/ui/StatsCard'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDate, formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Finance' }

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const user = await getCurrentUser()
  if (!user || !canViewFinance(user)) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-amber-800 mb-2">Finance access required</h2>
          <p className="text-sm text-amber-700">You don&apos;t have permission to view finance information.</p>
        </div>
      </div>
    )
  }

  const { status, type } = await searchParams

  const items = await prisma.councilFinanceItem.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(type ? { itemType: type } : {}),
    },
    orderBy: { itemDate: 'desc' },
    include: { submittedBy: { select: { name: true } } },
  })

  const all = await prisma.councilFinanceItem.findMany({
    select: { itemType: true, amount: true, status: true },
  })

  const income = all
    .filter((i) => ['income', 'grant_income', 'sponsorship_income', 'membership_income'].includes(i.itemType))
    .reduce((s, i) => s + Number(i.amount), 0)

  const expenses = all
    .filter((i) => ['expense', 'reimbursement'].includes(i.itemType))
    .reduce((s, i) => s + Number(i.amount), 0)

  const pending = all.filter((i) => i.status === 'pending').length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Finance Overview"
        description="Lightweight income, expense, and reimbursement tracking."
        action={{ label: 'Add Item', href: '/council/finance/new' }}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Total Income" value={formatCurrency(income)} accent="green" />
        <StatsCard label="Total Expenses" value={formatCurrency(expenses)} accent="red" />
        <StatsCard
          label="Net"
          value={formatCurrency(income - expenses)}
          accent={income - expenses >= 0 ? 'green' : 'red'}
        />
        <StatsCard label="Pending items" value={pending} accent={pending > 0 ? 'amber' : 'default'} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/council/finance" className={`px-3 py-1 rounded-full text-xs font-medium ${!status && !type ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</Link>
        {['income', 'expense', 'reimbursement', 'grant_income', 'sponsorship_income'].map((t) => (
          <Link key={t} href={`/council/finance?type=${t}`} className={`px-3 py-1 rounded-full text-xs font-medium ${type === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.replace(/_/g, ' ')}
          </Link>
        ))}
        <span className="text-slate-300 self-center">|</span>
        {['pending', 'approved', 'paid', 'received', 'rejected'].map((s) => (
          <Link key={s} href={`/council/finance?status=${s}`} className={`px-3 py-1 rounded-full text-xs font-medium ${status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {s}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No finance items"
          description="Log income, expenses, and reimbursements."
          action={{ label: 'Add Item', href: '/council/finance/new' }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Item</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const isExpense = ['expense', 'reimbursement'].includes(item.itemType)
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{item.title}</div>
                      {item.submittedBy && <div className="text-xs text-slate-400">{item.submittedBy.name}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 capitalize hidden sm:table-cell">{item.itemType.replace(/_/g, ' ')}</td>
                    <td className={`px-4 py-3 text-right font-mono font-medium ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                      {isExpense ? '−' : '+'}{formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{formatDate(item.itemDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
