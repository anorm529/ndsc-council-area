import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDate, formatCurrency, isOverdue, isDueWithin } from '@/lib/utils'

export const metadata: Metadata = { title: 'Grants' }

export default async function GrantsPage() {
  const grants = await prisma.councilGrant.findMany({
    orderBy: { deadline: 'asc' },
    include: { owner: { select: { name: true } } },
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Grants Tracker"
        description="Track grant applications, deadlines, and reporting obligations."
        action={{ label: 'Add Grant', href: '/council/grants/new' }}
      />

      {grants.length === 0 ? (
        <EmptyState
          title="No grants tracked"
          description="Add grant applications to track deadlines and status."
          action={{ label: 'Add Grant', href: '/council/grants/new' }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Grant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Deadline</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Requested</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Awarded</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grants.map((g) => {
                const deadlineOverdue = g.deadline && isOverdue(g.deadline) && !['closed', 'awarded', 'rejected'].includes(g.status)
                const deadlineSoon = g.deadline && isDueWithin(g.deadline, 30) && !['closed', 'awarded', 'rejected'].includes(g.status)
                return (
                  <tr key={g.id} className={`hover:bg-slate-50 ${deadlineOverdue ? 'bg-red-50/30' : deadlineSoon ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{g.grantName}</div>
                      {g.provider && <div className="text-xs text-slate-400">{g.provider}</div>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {g.deadline ? (
                        <span className={deadlineOverdue ? 'text-red-600 font-medium' : deadlineSoon ? 'text-amber-600' : 'text-slate-600'}>
                          {formatDate(g.deadline)}
                          {deadlineSoon && !deadlineOverdue && ' ⏰'}
                          {deadlineOverdue && ' ⚠'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">{formatCurrency(g.amountRequested)}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium hidden md:table-cell">{formatCurrency(g.amountAwarded)}</td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{g.owner?.name ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
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
