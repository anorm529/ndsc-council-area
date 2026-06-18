import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { PriorityBadge } from '@/components/council/ui/PriorityBadge'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDate, isOverdue } from '@/lib/utils'
import { markActionComplete } from '@/lib/actions/council-actions'

export const metadata: Metadata = { title: 'Action Tracker' }

const STATUSES = ['not_started', 'in_progress', 'blocked', 'complete', 'deferred']
const PRIORITIES = ['urgent', 'high', 'medium', 'low']

export default async function ActionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; owner?: string }>
}) {
  const { status, priority, owner } = await searchParams

  const [actions, members] = await Promise.all([
    prisma.councilAction.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(owner ? { ownerId: owner } : {}),
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { priority: 'asc' },
      ],
      include: {
        owner: { select: { name: true } },
        relatedMeeting: { select: { title: true } },
      },
    }),
    prisma.councilMember.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  const now = new Date()

  const byStatus = {
    overdue: actions.filter((a) =>
      a.dueDate && a.dueDate < now && !['complete', 'deferred', 'cancelled'].includes(a.status)
    ),
    active: actions.filter((a) =>
      !['complete', 'deferred', 'cancelled'].includes(a.status) &&
      !(a.dueDate && a.dueDate < now)
    ),
    done: actions.filter((a) => ['complete', 'deferred', 'cancelled'].includes(a.status)),
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Action Tracker"
        description="Track and manage all council actions."
        action={{ label: 'New Action', href: '/council/actions/new' }}
      />

      {/* Summary */}
      <div className="flex flex-wrap gap-3 mb-5">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          {byStatus.overdue.length} overdue
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {byStatus.active.length} active
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          {byStatus.done.length} done
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link
          href="/council/actions"
          className={`px-3 py-1 rounded-full text-xs font-medium ${!status && !priority && !owner ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/council/actions?status=${s}`}
            className={`px-3 py-1 rounded-full text-xs font-medium ${status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {s.replace(/_/g, ' ')}
          </Link>
        ))}
        <span className="text-slate-300 self-center">|</span>
        {PRIORITIES.map((p) => (
          <Link
            key={p}
            href={`/council/actions?priority=${p}`}
            className={`px-3 py-1 rounded-full text-xs font-medium ${priority === p ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {p}
          </Link>
        ))}
      </div>

      {actions.length === 0 ? (
        <EmptyState
          title="No actions found"
          description="Create an action to track work the council needs to do."
          action={{ label: 'New Action', href: '/council/actions/new' }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Due</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actions.map((a) => {
                const overdue = a.dueDate && isOverdue(a.dueDate) && !['complete', 'deferred', 'cancelled'].includes(a.status)
                const markComplete = markActionComplete.bind(null, a.id)
                return (
                  <tr key={a.id} className={`hover:bg-slate-50 ${overdue ? 'bg-red-50/40' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{a.title}</div>
                      {a.relatedMeeting && (
                        <div className="text-xs text-slate-400 mt-0.5">{a.relatedMeeting.title}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                      {a.owner?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={overdue ? 'text-red-600 font-medium' : 'text-slate-600'}>
                        {formatDate(a.dueDate)}
                        {overdue && ' ⚠'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><PriorityBadge priority={a.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/council/actions/new?edit=${a.id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        {!['complete', 'deferred', 'cancelled'].includes(a.status) && (
                          <form action={markComplete}>
                            <button
                              type="submit"
                              className="text-xs text-green-600 hover:underline"
                            >
                              Done
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
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
