import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { canViewWelfare, canViewFinance } from '@/lib/permissions'
import { StatsCard } from '@/components/council/ui/StatsCard'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { PriorityBadge } from '@/components/council/ui/PriorityBadge'
import { formatDate, formatDateLong, isOverdue } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const user = await getCurrentUser()

  const now = new Date()
  const weekFromNow = new Date()
  weekFromNow.setDate(weekFromNow.getDate() + 7)

  const [
    upcomingMeetings,
    overdueActions,
    thisWeekActions,
    openWelfare,
    pendingFinance,
    upcomingEvents,
    grantDeadlines,
    recentDecisions,
    reviewDueDocs,
    activeActions,
    totalMembers,
    genderGroups,
    teamTotals,
    teamGenderGroups,
    birthYearMembers,
  ] = await Promise.all([
    prisma.councilMeeting.findMany({
      where: { meetingDate: { gte: now }, status: { not: 'cancelled' } },
      orderBy: { meetingDate: 'asc' },
      take: 3,
      include: { chair: true },
    }),
    prisma.councilAction.count({
      where: {
        status: { notIn: ['complete', 'cancelled', 'deferred'] },
        dueDate: { lt: now },
      },
    }),
    prisma.councilAction.count({
      where: {
        status: { notIn: ['complete', 'cancelled', 'deferred'] },
        dueDate: { gte: now, lte: weekFromNow },
      },
    }),
    user && canViewWelfare(user)
      ? prisma.councilWelfareCase.count({ where: { status: { in: ['open', 'under_review', 'action_required'] } } })
      : Promise.resolve(null),
    user && canViewFinance(user)
      ? prisma.councilFinanceItem.count({ where: { status: 'pending' } })
      : Promise.resolve(null),
    prisma.councilEvent.findMany({
      where: { eventDate: { gte: now }, status: { not: 'cancelled' } },
      orderBy: { eventDate: 'asc' },
      take: 3,
    }),
    prisma.councilGrant.findMany({
      where: { status: { notIn: ['closed', 'rejected'] }, deadline: { gte: now } },
      orderBy: { deadline: 'asc' },
      take: 3,
    }),
    prisma.councilDecision.findMany({
      orderBy: { decisionDate: 'desc' },
      take: 5,
    }),
    prisma.councilDocument.findMany({
      where: { nextReviewDate: { lte: weekFromNow }, status: { not: 'archived' } },
      orderBy: { nextReviewDate: 'asc' },
      take: 4,
    }),
    prisma.councilAction.count({
      where: { status: { notIn: ['complete', 'cancelled', 'deferred'] } },
    }),
    prisma.councilMember.count({ where: { isActive: true } }),
    prisma.clubMember.groupBy({
      by: ['gender'],
      where: { isActive: true },
      _count: { id: true },
    }),
    prisma.clubMember.groupBy({
      by: ['currentTeamName'],
      where: { isActive: true, currentTeamName: { not: null } },
      _count: { id: true },
    }),
    prisma.clubMember.groupBy({
      by: ['currentTeamName', 'gender'],
      where: { isActive: true, currentTeamName: { not: null } },
      _count: { id: true },
    }),
    prisma.clubMember.findMany({
      where: { isActive: true, yearOfBirth: { not: null } },
      select: { yearOfBirth: true },
    }),
  ])

  // --- Demographics processing ---
  const CURRENT_YEAR = new Date().getFullYear()
  const totalClubMembers = genderGroups.reduce((s, g) => s + g._count.id, 0)

  // Normalise gender casing — DB may have "Male"/"male", "Female"/"female" etc.
  const genderNorm = new Map<string, number>()
  for (const r of genderGroups) {
    const key = (r.gender ?? '').trim().toLowerCase() || ''
    genderNorm.set(key, (genderNorm.get(key) ?? 0) + r._count.id)
  }

  const GENDER_ORDER = ['male', 'female', 'non-binary', 'prefer not to say']
  const genderRows = [
    ...GENDER_ORDER.filter((g) => genderNorm.has(g)),
    ...[...genderNorm.keys()].filter((k) => k && !GENDER_ORDER.includes(k)),
    ...(genderNorm.has('') ? [''] : []),
  ].map((key) => {
    const count = genderNorm.get(key) ?? 0
    return {
      label: key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Not specified',
      count,
      pct: totalClubMembers > 0 ? Math.round((count / totalClubMembers) * 100) : 0,
    }
  })

  const GENDER_COLOURS: Record<string, string> = {
    Male: 'bg-blue-400',
    Female: 'bg-pink-400',
    'Non-binary': 'bg-purple-400',
    'Not specified': 'bg-slate-300',
    'Prefer not to say': 'bg-slate-300',
  }

  // Team roster cards
  const TEAM_META: Record<string, { label: string; bar: string; badge: string }> = {
    Buccaneers: { label: 'Buccaneers', bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-800' },
    Barracudas:  { label: 'Barracudas',  bar: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-800'   },
    Sluggers:    { label: 'Sluggers',    bar: 'bg-red-400',    badge: 'bg-red-100 text-red-800'     },
  }
  const teamCards = teamTotals.map((t) => {
    const name = t.currentTeamName!
    const total = t._count.id
    const genders = teamGenderGroups.filter((g) => g.currentTeamName === name)
    // normalise casing before counting
    const male = genders.filter((g) => (g.gender ?? '').toLowerCase() === 'male').reduce((s, g) => s + g._count.id, 0)
    const female = genders.filter((g) => (g.gender ?? '').toLowerCase() === 'female').reduce((s, g) => s + g._count.id, 0)
    const other = total - male - female
    const meta = TEAM_META[name] ?? { label: name, bar: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700' }
    return { name, total, male, female, other, meta }
  }).sort((a, b) => b.total - a.total)

  // Age distribution in 10-year buckets
  const AGE_BUCKETS = [
    { label: 'Under 20', min: 0, max: 19 },
    { label: '20–29', min: 20, max: 29 },
    { label: '30–39', min: 30, max: 39 },
    { label: '40–49', min: 40, max: 49 },
    { label: '50+', min: 50, max: 999 },
  ]
  const ageBuckets = AGE_BUCKETS.map(({ label, min, max }) => {
    const count = birthYearMembers.filter(({ yearOfBirth }) => {
      const age = CURRENT_YEAR - yearOfBirth!
      return age >= min && age <= max
    }).length
    return { label, count }
  })
  const maxAgeBucket = Math.max(...ageBuckets.map((b) => b.count), 1)
  const unknownAge = totalClubMembers - birthYearMembers.length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Council Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back. Here&apos;s an overview of the council hub.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Active Actions"
          value={activeActions}
          sub={overdueActions > 0 ? `${overdueActions} overdue` : 'None overdue'}
          accent={overdueActions > 0 ? 'red' : 'green'}
        />
        <StatsCard
          label="Due this week"
          value={thisWeekActions}
          sub="Actions due in 7 days"
          accent={thisWeekActions > 0 ? 'amber' : 'default'}
        />
        <StatsCard
          label="Council Members"
          value={totalMembers}
          sub="Active members"
          accent="blue"
        />
        {user && canViewFinance(user) && pendingFinance !== null && (
          <StatsCard
            label="Finance Pending"
            value={pendingFinance}
            sub="Items awaiting approval"
            accent={pendingFinance > 0 ? 'amber' : 'default'}
          />
        )}
        {user && canViewWelfare(user) && openWelfare !== null && (
          <StatsCard
            label="Open Welfare Cases"
            value={openWelfare}
            sub="Require attention"
            accent={openWelfare > 0 ? 'red' : 'green'}
          />
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming meetings */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Upcoming Meetings</h2>
            <Link href="/council/meetings" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingMeetings.length === 0 ? (
              <p className="px-4 py-4 text-sm text-slate-500">No upcoming meetings.</p>
            ) : (
              upcomingMeetings.map((m) => (
                <Link key={m.id} href={`/council/meetings/${m.id}`} className="block px-4 py-3 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-slate-900 truncate">{m.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{formatDateLong(m.meetingDate)}</div>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-slate-100">
            <Link href="/council/meetings/new" className="text-xs text-blue-600 hover:underline">+ New meeting</Link>
          </div>
        </div>

        {/* Recent decisions */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Decisions</h2>
            <Link href="/council/decisions" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentDecisions.length === 0 ? (
              <p className="px-4 py-4 text-sm text-slate-500">No decisions logged yet.</p>
            ) : (
              recentDecisions.map((d) => (
                <div key={d.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm text-slate-900 font-medium truncate">{d.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{formatDate(d.decisionDate)}</div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-slate-100">
            <Link href="/council/decisions/new" className="text-xs text-blue-600 hover:underline">+ New decision</Link>
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Upcoming Events</h2>
            <Link href="/council/events" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingEvents.length === 0 ? (
              <p className="px-4 py-4 text-sm text-slate-500">No upcoming events.</p>
            ) : (
              upcomingEvents.map((e) => (
                <Link key={e.id} href={`/council/events/${e.id}`} className="block px-4 py-3 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-slate-900 truncate">{e.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{formatDateLong(e.eventDate)}</div>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-slate-100">
            <Link href="/council/events/new" className="text-xs text-blue-600 hover:underline">+ New event</Link>
          </div>
        </div>

        {/* Grant deadlines */}
        {grantDeadlines.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Grant Deadlines</h2>
              <Link href="/council/grants" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {grantDeadlines.map((g) => (
                <div key={g.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-slate-900 truncate">{g.grantName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Deadline: {formatDateLong(g.deadline)}
                      </div>
                    </div>
                    <StatusBadge status={g.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents due for review */}
        {reviewDueDocs.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Documents Due for Review</h2>
              <Link href="/council/documents" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {reviewDueDocs.map((doc) => (
                <div key={doc.id} className="px-4 py-3">
                  <div className="text-sm font-medium text-slate-900 truncate">{doc.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Review by {formatDate(doc.nextReviewDate)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4">
            {[
              { href: '/council/meetings/new', label: 'New Meeting' },
              { href: '/council/actions/new', label: 'New Action' },
              { href: '/council/decisions/new', label: 'Log Decision' },
              { href: '/council/reports/new', label: 'Officer Report' },
              { href: '/council/events/new', label: 'New Event' },
              { href: '/council/finance/new', label: 'Finance Item' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-center px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Player demographics + team rosters */}
      {totalClubMembers > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Player Demographics</h2>
            <Link href="/council/membership" className="text-xs text-blue-600 hover:underline">View register</Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Gender distribution */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-4">Gender Distribution</h3>
              <div className="space-y-3">
                {genderRows.map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>{row.label}</span>
                      <span className="font-medium">{row.count} <span className="text-slate-400">({row.pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${GENDER_COLOURS[row.label] ?? 'bg-slate-400'}`}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400">{totalClubMembers} active members total</p>
            </div>

            {/* Team rosters */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-4">Team Rosters</h3>
              {teamCards.length === 0 ? (
                <p className="text-sm text-slate-400">No linked team data yet. Run reconciliation first.</p>
              ) : (
                <div className="space-y-4">
                  {teamCards.map((t) => (
                    <div key={t.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${t.meta.badge}`}>
                          {t.meta.label}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{t.total}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${t.meta.bar}`} style={{ width: '100%' }} />
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-slate-500">
                        <span>{t.male}M</span>
                        <span>{t.female}F</span>
                        {t.other > 0 && <span>{t.other} other</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Age distribution */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-4">Age Groups</h3>
              <div className="space-y-3">
                {ageBuckets.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>{b.label}</span>
                      <span className="font-medium">{b.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 rounded-full"
                        style={{ width: `${Math.round((b.count / maxAgeBucket) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {unknownAge > 0 && (
                <p className="mt-3 text-xs text-slate-400">{unknownAge} member{unknownAge !== 1 ? 's' : ''} with no year of birth recorded</p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
