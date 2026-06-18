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
  ])

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
    </div>
  )
}
