import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatsCard } from '@/components/council/ui/StatsCard'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Membership' }

export default async function MembershipPage() {
  const snapshots = await prisma.councilMembershipSnapshot.findMany({
    orderBy: { snapshotDate: 'desc' },
  })

  const latest = snapshots[0]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Membership Overview"
        description="Membership numbers and trends. Connect to the central members DB later."
        action={{ label: 'Record Snapshot', href: '/council/membership/new' }}
      />

      {latest && (
        <div className="mb-6">
          <div className="text-xs text-slate-500 mb-2">Latest snapshot: {formatDate(latest.snapshotDate)}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard label="Total members" value={latest.totalMembers ?? '—'} accent="blue" />
            <StatsCard label="Paid members" value={latest.paidMembers ?? '—'} accent="green" />
            <StatsCard label="Unpaid members" value={latest.unpaidMembers ?? '—'} accent={latest.unpaidMembers && latest.unpaidMembers > 0 ? 'amber' : 'default'} />
            <StatsCard label="Active players" value={latest.activePlayers ?? '—'} accent="blue" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <StatsCard label="Male" value={latest.maleMembers ?? '—'} />
            <StatsCard label="Female" value={latest.femaleMembers ?? '—'} />
            <StatsCard label="Rookies" value={latest.rookies ?? '—'} />
            <StatsCard label="Inactive" value={latest.inactivePlayers ?? '—'} />
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-slate-900 mb-3">Snapshot History</h2>

      {snapshots.length === 0 ? (
        <EmptyState
          title="No snapshots yet"
          description="Record your first membership snapshot to start tracking trends."
          action={{ label: 'Record Snapshot', href: '/council/membership/new' }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Paid</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Active</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Male</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Female</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Rookies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {snapshots.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{formatDate(s.snapshotDate)}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">{s.totalMembers ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-green-700">{s.paidMembers ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-600 hidden sm:table-cell">{s.activePlayers ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">{s.maleMembers ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">{s.femaleMembers ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">{s.rookies ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
