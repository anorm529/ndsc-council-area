import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Officer Report' }

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const report = await prisma.councilOfficerReport.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, role: true } },
      relatedMeeting: { select: { title: true, id: true } },
    },
  })

  if (!report) notFound()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/council/reports" className="text-sm text-slate-500 hover:text-slate-700">← Back to reports</Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{report.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
              <span>{report.author.name} ({report.author.role})</span>
              <span className="capitalize">{report.reportType.replace(/_/g, ' ')}</span>
              {report.reportingPeriodStart && (
                <span>{formatDate(report.reportingPeriodStart)} – {formatDate(report.reportingPeriodEnd)}</span>
              )}
            </div>
            {report.relatedMeeting && (
              <Link href={`/council/meetings/${report.relatedMeeting.id}`} className="text-sm text-blue-600 hover:underline mt-1 block">
                {report.relatedMeeting.title}
              </Link>
            )}
          </div>
          <StatusBadge status={report.status} />
        </div>
      </div>

      <div className="space-y-5">
        <Section title="Report" content={report.content} />
        {report.highlights && <Section title="Highlights" content={report.highlights} />}
        {report.risks && <Section title="Risks & Concerns" content={report.risks} />}
        {report.requests && <Section title="Requests" content={report.requests} />}
      </div>
    </div>
  )
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-3">{title}</h2>
      <div className="text-sm text-slate-700 whitespace-pre-wrap">{content}</div>
    </div>
  )
}
