import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatsCard } from '@/components/council/ui/StatsCard'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { formatDate } from '@/lib/utils'
import {
  deactivateClubMember,
  reconcileClubMembers,
} from '@/lib/actions/membership'
import { ConfirmButton } from '@/components/council/ui/ConfirmButton'

export const metadata: Metadata = { title: 'Membership' }

const TEAM_COLOURS: Record<string, string> = {
  buccaneers: 'bg-blue-100 text-blue-800',
  barracudas: 'bg-red-100 text-red-800',
  sluggers:   'bg-green-100 text-green-800',
}

function TeamBadge({ name }: { name: string }) {
  const slug = name.toLowerCase()
  const colour = TEAM_COLOURS[slug] ?? 'bg-slate-100 text-slate-700'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colour}`}>
      {name}
    </span>
  )
}

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>
}) {
  const { q = '', filter = 'active' } = await searchParams
  await getCurrentUser()

  const where = {
    ...(filter === 'active'
      ? { isActive: true }
      : filter === 'inactive'
      ? { isActive: false }
      : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' as const } },
            { lastName: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
            { postcode: { contains: q, mode: 'insensitive' as const } },
            { currentTeamName: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [
    members,
    totalActive,
    rookieCount,
    umpireCount,
    linkedCount,
    notFoundCount,
    pendingCount,
    latestSnapshot,
    snapshots,
  ] = await Promise.all([
    prisma.clubMember.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),
    prisma.clubMember.count({ where: { isActive: true } }),
    prisma.clubMember.count({ where: { isActive: true, isRookie: true } }),
    prisma.clubMember.count({ where: { isActive: true, isUmpire: true } }),
    prisma.clubMember.count({ where: { isActive: true, mainDbStatus: 'linked' } }),
    prisma.clubMember.count({ where: { isActive: true, mainDbStatus: 'not_found' } }),
    prisma.clubMember.count({ where: { isActive: true, mainDbStatus: 'pending' } }),
    prisma.councilMembershipSnapshot.findFirst({ orderBy: { snapshotDate: 'desc' } }),
    prisma.councilMembershipSnapshot.findMany({ orderBy: { snapshotDate: 'desc' }, take: 5 }),
  ])

  const hasMainDb = !!process.env.MAIN_DATABASE_URL
  const hasReconciled = pendingCount < totalActive || linkedCount > 0 || notFoundCount > 0

  const FILTERS = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'all', label: 'All' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Membership"
        description="Club member register with main database linking."
        action={{ label: '+ Add Member', href: '/council/membership/new-member' }}
      />

      {/* Stats — row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatsCard label="Active members" value={totalActive} accent="blue" />
        <StatsCard label="Rookies" value={rookieCount} accent="amber" />
        <StatsCard label="Umpires" value={umpireCount} accent="green" />
        <StatsCard
          label="Latest snapshot"
          value={latestSnapshot ? formatDate(latestSnapshot.snapshotDate) : '—'}
        />
      </div>

      {/* Stats — row 2: main DB link status */}
      {(hasMainDb || hasReconciled) && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatsCard label="Linked to main DB" value={linkedCount} accent="green" />
          <StatsCard
            label="Not in main DB"
            value={notFoundCount}
            accent={notFoundCount > 0 ? 'red' : 'default'}
          />
          <StatsCard label="Pending check" value={pendingCount} />
        </div>
      )}

      {/* Not-in-DB alert */}
      {notFoundCount > 0 && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
          <span className="mt-0.5">⚠</span>
          <span>
            <strong>{notFoundCount} member{notFoundCount !== 1 ? 's' : ''}</strong> could not be
            matched in the main database. They need to be added there before they can be linked.
          </span>
        </div>
      )}

      {/* Members list */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Members</h2>
          <div className="flex flex-wrap gap-2">
            {hasMainDb && (
              <form action={reconcileClubMembers}>
                <button
                  type="submit"
                  className="text-xs px-3 py-1.5 rounded border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  Reconcile with main DB
                </button>
              </form>
            )}
            <Link
              href="/council/membership/upload"
              className="text-xs px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              Upload CSV
            </Link>
            <a
              href="/api/council/membership/export"
              className="text-xs px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              Download CSV
            </a>
          </div>
        </div>

        {/* Filter + search */}
        <form method="GET" className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="submit"
                name="filter"
                value={f.value}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  filter === f.value
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search name, email, postcode, team…"
            className="flex-1 text-sm px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {q && (
            <a
              href={`/council/membership?filter=${filter}`}
              className="text-xs px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            >
              Clear
            </a>
          )}
        </form>

        {members.length === 0 ? (
          <EmptyState
            title="No members found"
            description={
              totalActive === 0
                ? 'Add members individually or upload a CSV to get started.'
                : 'No members match your search.'
            }
            action={totalActive === 0 ? { label: 'Upload CSV', href: '/council/membership/upload' } : undefined}
          />
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Team</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">DB Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Gender</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Postcode</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">R</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">U</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => {
                  const deactivate = deactivateClubMember.bind(null, m.id)
                  const isNotFound = m.mainDbStatus === 'not_found'
                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50 ${!m.isActive ? 'opacity-50' : ''} ${isNotFound ? 'bg-red-50/30' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link href={`/council/membership/${m.id}/edit`} className="hover:text-blue-600 hover:underline">
                          {m.lastName}, {m.firstName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {m.currentTeamName ? (
                          <TeamBadge name={m.currentTeamName} />
                        ) : m.mainDbStatus === 'linked' ? (
                          <span className="text-xs text-slate-400">No active team</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={m.mainDbStatus} />
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{m.email ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell capitalize">{m.gender ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{m.postcode ?? '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {m.isRookie && <span className="inline-block w-2 h-2 rounded-full bg-amber-400" title="Rookie" />}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {m.isUmpire && <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Umpire" />}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {m.isActive && (
                          <ConfirmButton
                            action={deactivate}
                            message={`Deactivate ${m.firstName} ${m.lastName}?`}
                            label="Deactivate"
                            className="text-xs text-red-500 hover:underline"
                          />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400">
              {members.length} member{members.length !== 1 ? 's' : ''} shown
              {hasMainDb && !hasReconciled && (
                <span className="ml-3 text-blue-500">
                  Run "Reconcile with main DB" to link players and assign teams.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Snapshot history */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Snapshot History</h2>
          <Link href="/council/membership/new" className="text-xs text-blue-600 hover:underline">
            Record snapshot
          </Link>
        </div>

        {snapshots.length === 0 ? (
          <p className="text-sm text-slate-500">No snapshots recorded yet.</p>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Paid</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Active</th>
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
                    <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">{s.rookies ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
