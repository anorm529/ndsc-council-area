import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDateLong } from '@/lib/utils'

export const metadata: Metadata = { title: 'Meetings' }

const MEETING_TYPES = [
  { value: 'council', label: 'Council' },
  { value: 'committee', label: 'Committee' },
  { value: 'agm', label: 'AGM' },
  { value: 'egm', label: 'EGM' },
  { value: 'finance', label: 'Finance' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'welfare', label: 'Welfare' },
]

const STATUSES = ['draft', 'scheduled', 'completed', 'cancelled']

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>
}) {
  const { type, status } = await searchParams

  const meetings = await prisma.councilMeeting.findMany({
    where: {
      ...(type ? { meetingType: type } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { meetingDate: 'desc' },
    include: { chair: { select: { name: true } } },
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Meetings"
        description="Council, committee, AGM, and other meetings."
        action={{ label: 'New Meeting', href: '/council/meetings/new' }}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <FilterLink href="/council/meetings" label="All" active={!type && !status} />
        {MEETING_TYPES.map((t) => (
          <FilterLink
            key={t.value}
            href={`/council/meetings?type=${t.value}`}
            label={t.label}
            active={type === t.value}
          />
        ))}
        <span className="text-slate-300">|</span>
        {STATUSES.map((s) => (
          <FilterLink
            key={s}
            href={`/council/meetings?status=${s}`}
            label={s.charAt(0).toUpperCase() + s.slice(1)}
            active={status === s}
          />
        ))}
      </div>

      {meetings.length === 0 ? (
        <EmptyState
          title="No meetings found"
          description="Schedule your first meeting to get started."
          action={{ label: 'New Meeting', href: '/council/meetings/new' }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Chair</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meetings.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDateLong(m.meetingDate)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/council/meetings/${m.id}`} className="font-medium text-blue-600 hover:underline">
                      {m.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell capitalize">{m.meetingType ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{m.chair?.name ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </Link>
  )
}
