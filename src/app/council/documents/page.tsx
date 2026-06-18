import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDate, isOverdue, isDueWithin } from '@/lib/utils'

export const metadata: Metadata = { title: 'Documents & Policies' }

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>
}) {
  const { type, status } = await searchParams

  const documents = await prisma.councilDocument.findMany({
    where: {
      ...(type ? { documentType: type } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { nextReviewDate: 'asc' },
    include: { owner: { select: { name: true } } },
  })

  const types = ['constitution', 'policy', 'procedure', 'minutes', 'report', 'risk_assessment', 'finance', 'tournament', 'other']
  const statuses = ['draft', 'active', 'under_review', 'archived']

  const now = new Date()
  const reviewDue = documents.filter((d) => d.nextReviewDate && d.nextReviewDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) && d.status !== 'archived')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Documents & Policies"
        description="Policy register with review date tracking."
        action={{ label: 'Add Document', href: '/council/documents/new' }}
      />

      {reviewDue.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
          ⏰ {reviewDue.length} document{reviewDue.length > 1 ? 's are' : ' is'} due for review in the next 30 days.
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/council/documents" className={`px-3 py-1 rounded-full text-xs font-medium ${!type && !status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</Link>
        {types.map((t) => (
          <Link key={t} href={`/council/documents?type=${t}`} className={`px-3 py-1 rounded-full text-xs font-medium ${type === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.replace(/_/g, ' ')}
          </Link>
        ))}
        <span className="text-slate-300 self-center">|</span>
        {statuses.map((s) => (
          <Link key={s} href={`/council/documents?status=${s}`} className={`px-3 py-1 rounded-full text-xs font-medium ${status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {s.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title="No documents"
          description="Upload or link governance documents, policies, and procedures."
          action={{ label: 'Add Document', href: '/council/documents/new' }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Document</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Next review</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => {
                const reviewOverdue = doc.nextReviewDate && isOverdue(doc.nextReviewDate) && doc.status !== 'archived'
                const reviewSoon = doc.nextReviewDate && isDueWithin(doc.nextReviewDate, 30) && doc.status !== 'archived'
                return (
                  <tr key={doc.id} className={`hover:bg-slate-50 ${reviewOverdue ? 'bg-red-50/30' : reviewSoon ? 'bg-amber-50/20' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {doc.documentUrl ? (
                          <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {doc.title}
                          </a>
                        ) : doc.title}
                      </div>
                      {doc.version && <div className="text-xs text-slate-400">v{doc.version}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 capitalize hidden sm:table-cell">{doc.documentType?.replace(/_/g, ' ') ?? '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {doc.nextReviewDate ? (
                        <span className={reviewOverdue ? 'text-red-600 font-medium' : reviewSoon ? 'text-amber-600' : 'text-slate-600'}>
                          {formatDate(doc.nextReviewDate)}
                          {reviewSoon && !reviewOverdue && ' ⏰'}
                          {reviewOverdue && ' ⚠'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{doc.owner?.name ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={doc.status} /></td>
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
