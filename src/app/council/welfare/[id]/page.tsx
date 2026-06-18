import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { canViewWelfare } from '@/lib/permissions'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Welfare Case' }

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700 font-semibold',
}

export default async function WelfareCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()

  if (!user || !canViewWelfare(user)) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-2xl mb-3">🔒</div>
          <h2 className="text-lg font-semibold text-red-800 mb-2">Restricted</h2>
          <p className="text-sm text-red-700">You do not have permission to view this case.</p>
        </div>
      </div>
    )
  }

  const { id } = await params

  const welfareCase = await prisma.councilWelfareCase.findUnique({
    where: { id },
    include: {
      reportedBy: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
  })

  if (!welfareCase) notFound()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/council/welfare" className="text-sm text-slate-500 hover:text-slate-700">← Back to welfare log</Link>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
        ⚠ Confidential – welfare access only
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-slate-900">{welfareCase.title}</h1>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs capitalize ${SEVERITY_STYLES[welfareCase.severity]}`}>
              {welfareCase.severity}
            </span>
            <StatusBadge status={welfareCase.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-sm">
          <div><span className="text-slate-500">Type: </span><span className="capitalize text-slate-900">{welfareCase.caseType.replace(/_/g, ' ')}</span></div>
          <div><span className="text-slate-500">Reported: </span><span className="text-slate-900">{formatDate(welfareCase.reportedDate)}</span></div>
          {welfareCase.incidentDate && (
            <div><span className="text-slate-500">Incident date: </span><span className="text-slate-900">{formatDate(welfareCase.incidentDate)}</span></div>
          )}
          <div><span className="text-slate-500">Reported by: </span><span className="text-slate-900">{welfareCase.reportedBy?.name ?? '—'}</span></div>
          <div><span className="text-slate-500">Assigned to: </span><span className="text-slate-900">{welfareCase.assignedTo?.name ?? '—'}</span></div>
          {welfareCase.followUpRequired && (
            <div><span className="text-slate-500">Follow-up: </span><span className="text-slate-900">{formatDate(welfareCase.followUpDate)}</span></div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {welfareCase.summary && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Summary</h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{welfareCase.summary}</p>
          </div>
        )}
        {welfareCase.actionsTaken && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Actions Taken</h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{welfareCase.actionsTaken}</p>
          </div>
        )}
        {welfareCase.confidentialNotes && (
          <div className="bg-red-50 rounded-lg border border-red-100 p-5">
            <h2 className="text-sm font-semibold text-red-900 mb-2">Confidential Notes</h2>
            <p className="text-sm text-red-800 whitespace-pre-wrap">{welfareCase.confidentialNotes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
