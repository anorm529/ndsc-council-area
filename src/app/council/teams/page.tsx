import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Team Reports' }

const TEAMS = [
  { slug: 'buccaneers', label: 'Buccaneers', color: 'bg-yellow-50 text-yellow-700' },
  { slug: 'barracudas', label: 'Barracudas', color: 'bg-blue-50 text-blue-700' },
  { slug: 'sluggers', label: 'Sluggers', color: 'bg-red-50 text-red-700' },
]

function TeamBadge({ slug }: { slug: string }) {
  const team = TEAMS.find((t) => t.slug === slug)
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${team?.color ?? 'bg-slate-100 text-slate-700'}`}>
      {team?.label ?? slug}
    </span>
  )
}

export default async function TeamReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string; status?: string }>
}) {
  const { team, status } = await searchParams

  const reports = await prisma.councilTeamReport.findMany({
    where: {
      ...(team ? { teamSlug: team } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { reportDate: 'desc' },
    include: { captain: { select: { name: true } } },
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Team Reports"
        description="Captain updates for Buccaneers, Barracudas, and Sluggers."
        action={{ label: 'New Report', href: '/council/teams/new' }}
      />

      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/council/teams" className={`px-3 py-1 rounded-full text-xs font-medium ${!team ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All teams</Link>
        {TEAMS.map((t) => (
          <Link key={t.slug} href={`/council/teams?team=${t.slug}`} className={`px-3 py-1 rounded-full text-xs font-medium ${team === t.slug ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.label}
          </Link>
        ))}
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No team reports"
          description="Captains can submit team updates before council meetings."
          action={{ label: 'New Report', href: '/council/teams/new' }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Team</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Captain</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.title}</td>
                  <td className="px-4 py-3"><TeamBadge slug={r.teamSlug} /></td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{r.captain?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{formatDate(r.reportDate)}</td>
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
