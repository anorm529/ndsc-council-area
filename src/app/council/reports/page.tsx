import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Officer Reports' }

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>
}) {
  const { type, status } = await searchParams

  const reports = await prisma.councilOfficerReport.findMany({
    where: {
      ...(type ? { reportType: type } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true } },
      relatedMeeting: { select: { title: true } },
    },
  })

  const reportTypes = ['chair', 'vice_chair', 'secretary', 'treasurer', 'media', 'captain', 'welfare', 'tournament', 'sponsorship']

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Officer Reports"
        description="Pre-meeting and monthly officer updates."
        action={{ label: 'New Report', href: '/council/reports/new' }}
      />

      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/council/reports" className={`px-3 py-1 rounded-full text-xs font-medium ${!type && !status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</Link>
        {reportTypes.map((t) => (
          <Link key={t} href={`/council/reports?type=${t}`} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${type === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description="Create an officer report before or after a meeting."
          action={{ label: 'New Report', href: '/council/reports/new' }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Author</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Created</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/council/reports/${r.id}`} className="font-medium text-blue-600 hover:underline">{r.title}</Link>
                    {r.relatedMeeting && <div className="text-xs text-slate-400">{r.relatedMeeting.title}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell capitalize">{r.reportType.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{r.author.name}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
