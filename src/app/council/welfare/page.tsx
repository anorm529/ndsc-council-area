import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { canViewWelfare } from '@/lib/permissions'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Welfare Log' }

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700 font-semibold',
}

export default async function WelfarePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const user = await getCurrentUser()

  if (!user || !canViewWelfare(user)) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-2xl mb-3">🔒</div>
          <h2 className="text-lg font-semibold text-red-800 mb-2">Restricted access</h2>
          <p className="text-sm text-red-700">
            The welfare log is restricted to welfare officers and senior council members.
            If you need access, contact the Chair or Welfare Officer.
          </p>
        </div>
      </div>
    )
  }

  const { status } = await searchParams

  const cases = await prisma.councilWelfareCase.findMany({
    where: status ? { status } : {},
    orderBy: { reportedDate: 'desc' },
    include: {
      reportedBy: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Sensitive data warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 flex items-start gap-2 text-sm text-amber-800">
        <span className="flex-shrink-0 mt-0.5">⚠</span>
        <span>This section contains sensitive personal information. Handle with care and do not share outside permitted roles.</span>
      </div>

      <PageHeader
        title="Welfare & Conduct Log"
        description="Confidential record of welfare cases, incidents, and conduct issues."
        action={{ label: 'New Case', href: '/council/welfare/new' }}
      />

      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/council/welfare" className={`px-3 py-1 rounded-full text-xs font-medium ${!status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</Link>
        {['open', 'under_review', 'action_required', 'resolved', 'closed'].map((s) => (
          <Link key={s} href={`/council/welfare?status=${s}`} className={`px-3 py-1 rounded-full text-xs font-medium ${status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {s.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      {cases.length === 0 ? (
        <EmptyState
          title="No cases"
          description="No welfare or conduct cases on record."
          action={{ label: 'New Case', href: '/council/welfare/new' }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Case</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Assigned to</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Severity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/council/welfare/${c.id}`} className="font-medium text-blue-600 hover:underline">{c.title}</Link>
                    <div className="text-xs text-slate-400 mt-0.5">Reported {formatDate(c.reportedDate)}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 capitalize hidden sm:table-cell">{c.caseType.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{c.assignedTo?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs capitalize ${SEVERITY_STYLES[c.severity]}`}>
                      {c.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
