import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Communications' }

export default async function CommunicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; status?: string }>
}) {
  const { channel, status } = await searchParams

  const comms = await prisma.councilCommunication.findMany({
    where: {
      ...(channel ? { channel } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { plannedDate: 'asc' },
    include: { owner: { select: { name: true } } },
  })

  const channels = ['facebook', 'instagram', 'website', 'local_paper', 'email', 'newsletter', 'sponsor_post']
  const statuses = ['idea', 'draft', 'scheduled', 'published', 'cancelled']

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Communications Planner"
        description="Plan and track all club communications and media posts."
        action={{ label: 'New Item', href: '/council/communications/new' }}
      />

      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/council/communications" className={`px-3 py-1 rounded-full text-xs font-medium ${!channel && !status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</Link>
        {channels.map((c) => (
          <Link key={c} href={`/council/communications?channel=${c}`} className={`px-3 py-1 rounded-full text-xs font-medium ${channel === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {c.replace(/_/g, ' ')}
          </Link>
        ))}
        <span className="text-slate-300 self-center">|</span>
        {statuses.map((s) => (
          <Link key={s} href={`/council/communications?status=${s}`} className={`px-3 py-1 rounded-full text-xs font-medium ${status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</Link>
        ))}
      </div>

      {comms.length === 0 ? (
        <EmptyState
          title="Nothing planned"
          description="Plan your next match report, announcement, or social media post."
          action={{ label: 'New Item', href: '/council/communications/new' }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Channel</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Planned</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comms.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{c.title}</div>
                    {c.contentType && <div className="text-xs text-slate-400 capitalize">{c.contentType.replace(/_/g, ' ')}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 capitalize hidden sm:table-cell">{c.channel?.replace(/_/g, ' ') ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{formatDate(c.plannedDate)}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{c.owner?.name ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
