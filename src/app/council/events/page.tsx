import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDateLong, formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Events' }

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>
}) {
  const { type, status } = await searchParams

  const events = await prisma.councilEvent.findMany({
    where: {
      ...(type ? { eventType: type } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { eventDate: 'asc' },
    include: { lead: { select: { name: true } } },
  })

  const types = ['tournament', 'awards_night', 'try_softball', 'fundraiser', 'social', 'training', 'council_event']
  const statuses = ['idea', 'planning', 'confirmed', 'live', 'completed', 'cancelled']

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Events & Tournament Planning"
        description="Plan and manage club events from idea to completion."
        action={{ label: 'New Event', href: '/council/events/new' }}
      />

      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/council/events" className={`px-3 py-1 rounded-full text-xs font-medium ${!type && !status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</Link>
        {types.map((t) => (
          <Link key={t} href={`/council/events?type=${t}`} className={`px-3 py-1 rounded-full text-xs font-medium ${type === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.replace(/_/g, ' ')}
          </Link>
        ))}
        <span className="text-slate-300 self-center">|</span>
        {statuses.map((s) => (
          <Link key={s} href={`/council/events?status=${s}`} className={`px-3 py-1 rounded-full text-xs font-medium ${status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</Link>
        ))}
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No events"
          description="Start planning your next club event or tournament."
          action={{ label: 'New Event', href: '/council/events/new' }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Link
              key={e.id}
              href={`/council/events/${e.id}`}
              className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-slate-900 text-sm leading-tight">{e.title}</h3>
                <StatusBadge status={e.status} />
              </div>
              {e.eventDate && (
                <div className="text-xs text-slate-500 mb-1">{formatDateLong(e.eventDate)}</div>
              )}
              {e.location && <div className="text-xs text-slate-400">{e.location}</div>}
              {e.budget && <div className="text-xs text-slate-500 mt-1">Budget: {formatCurrency(e.budget)}</div>}
              {e.lead && <div className="text-xs text-slate-400 mt-1">Lead: {e.lead.name}</div>}
              <div className="text-xs text-slate-400 capitalize mt-1">{e.eventType?.replace(/_/g, ' ')}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
