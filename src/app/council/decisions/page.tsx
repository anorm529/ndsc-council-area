import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Decision Log' }

export default async function DecisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  const decisions = await prisma.councilDecision.findMany({
    where: status ? { status } : {},
    orderBy: { decisionDate: 'desc' },
    include: {
      relatedMeeting: { select: { title: true } },
      proposedBy: { select: { name: true } },
    },
  })

  const statuses = ['proposed', 'approved', 'rejected', 'deferred', 'superseded']

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Decision Log"
        description="Permanent record of all council decisions."
        action={{ label: 'Log Decision', href: '/council/decisions/new' }}
      />

      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/council/decisions" className={`px-3 py-1 rounded-full text-xs font-medium ${!status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</Link>
        {statuses.map((s) => (
          <Link key={s} href={`/council/decisions?status=${s}`} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {s}
          </Link>
        ))}
      </div>

      {decisions.length === 0 ? (
        <EmptyState
          title="No decisions logged"
          description="Record council decisions to maintain an audit trail."
          action={{ label: 'Log Decision', href: '/council/decisions/new' }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Decision</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Meeting</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Vote</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {decisions.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(d.decisionDate)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{d.title}</div>
                    {d.proposedBy && <div className="text-xs text-slate-400">Proposed by {d.proposedBy.name}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                    {d.relatedMeeting?.title ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                    {d.voteFor !== null
                      ? `${d.voteFor}F / ${d.voteAgainst ?? 0}A / ${d.voteAbstain ?? 0}Abs`
                      : '—'}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
