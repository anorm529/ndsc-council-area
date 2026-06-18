import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { PriorityBadge } from '@/components/council/ui/PriorityBadge'
import { formatDateLong, formatDate } from '@/lib/utils'
import { approveMeetingMinutes } from '@/lib/actions/meetings'

export const metadata: Metadata = { title: 'Meeting' }

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const meeting = await prisma.councilMeeting.findUnique({
    where: { id },
    include: {
      chair: { select: { name: true } },
      minuteTaker: { select: { name: true } },
      attendees: { include: { member: { select: { name: true, role: true } } } },
      actions: { include: { owner: { select: { name: true } } } },
      decisions: true,
      officerReports: { include: { author: { select: { name: true } } } },
    },
  })

  if (!meeting) notFound()

  const approveWithId = approveMeetingMinutes.bind(null, id)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/council/meetings" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to meetings
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{meeting.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
              <span>{formatDateLong(meeting.meetingDate)}</span>
              {meeting.startTime && <span>{meeting.startTime}{meeting.endTime ? ` – ${meeting.endTime}` : ''}</span>}
              {meeting.location && <span>{meeting.location}</span>}
              {meeting.meetingType && <span className="capitalize">{meeting.meetingType}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={meeting.status} />
            {meeting.approved && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Minutes Approved
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-sm">
          <div>
            <span className="text-slate-500">Chair: </span>
            <span className="text-slate-900">{meeting.chair?.name ?? '—'}</span>
          </div>
          <div>
            <span className="text-slate-500">Minute taker: </span>
            <span className="text-slate-900">{meeting.minuteTaker?.name ?? '—'}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100">
          <Link
            href={`/council/meetings/${id}/edit`}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
          >
            Edit
          </Link>
          {!meeting.approved && meeting.minutes && (
            <form action={approveWithId}>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
              >
                Approve Minutes
              </button>
            </form>
          )}
          <Link
            href={`/council/actions/new?meeting=${id}`}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            + Action
          </Link>
          <Link
            href={`/council/decisions/new?meeting=${id}`}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            + Decision
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agenda */}
        {meeting.agenda && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Agenda</h2>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">{meeting.agenda}</div>
          </div>
        )}

        {/* Minutes */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Minutes
            {meeting.approvedAt && (
              <span className="ml-2 text-xs font-normal text-green-600">
                Approved {formatDate(meeting.approvedAt)}
              </span>
            )}
          </h2>
          {meeting.minutes ? (
            <div className="text-sm text-slate-700 whitespace-pre-wrap">{meeting.minutes}</div>
          ) : (
            <p className="text-sm text-slate-400">No minutes recorded yet.</p>
          )}
        </div>

        {/* Attendees */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Attendees ({meeting.attendees.length})</h2>
          {meeting.attendees.length === 0 ? (
            <p className="text-sm text-slate-400">No attendance recorded.</p>
          ) : (
            <div className="space-y-2">
              {meeting.attendees.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{a.member.name} <span className="text-slate-400">({a.member.role})</span></span>
                  <StatusBadge status={a.attendanceStatus} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Actions ({meeting.actions.length})</h2>
            <Link href={`/council/actions/new?meeting=${id}`} className="text-xs text-blue-600 hover:underline">+ Add</Link>
          </div>
          {meeting.actions.length === 0 ? (
            <p className="text-sm text-slate-400">No actions from this meeting.</p>
          ) : (
            <div className="space-y-2">
              {meeting.actions.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/council/actions?id=${a.id}`} className="text-sm text-slate-800 hover:text-blue-600 font-medium">
                      {a.title}
                    </Link>
                    {a.owner && <div className="text-xs text-slate-500">{a.owner.name}</div>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <PriorityBadge priority={a.priority} />
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decisions */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Decisions ({meeting.decisions.length})</h2>
            <Link href={`/council/decisions/new?meeting=${id}`} className="text-xs text-blue-600 hover:underline">+ Add</Link>
          </div>
          {meeting.decisions.length === 0 ? (
            <p className="text-sm text-slate-400">No decisions recorded.</p>
          ) : (
            <div className="space-y-2">
              {meeting.decisions.map((d) => (
                <div key={d.id} className="flex items-start justify-between gap-2">
                  <span className="text-sm text-slate-800">{d.title}</span>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Officer reports */}
        {meeting.officerReports.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Officer Reports</h2>
            <div className="space-y-2">
              {meeting.officerReports.map((r) => (
                <div key={r.id} className="flex items-center justify-between">
                  <div>
                    <Link href={`/council/reports/${r.id}`} className="text-sm text-blue-600 hover:underline">{r.title}</Link>
                    <div className="text-xs text-slate-500">{r.author.name}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
