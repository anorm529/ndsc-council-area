import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDate, formatCurrency, isDueWithin } from '@/lib/utils'

export const metadata: Metadata = { title: 'Sponsorship' }

export default async function SponsorshipPage() {
  const sponsorships = await prisma.councilSponsorship.findMany({
    orderBy: { renewalDate: 'asc' },
    include: { owner: { select: { name: true } } },
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Sponsorship Tracker"
        description="Manage club sponsors, packages, and renewal dates."
        action={{ label: 'Add Sponsor', href: '/council/sponsorship/new' }}
      />

      {sponsorships.length === 0 ? (
        <EmptyState
          title="No sponsorships tracked"
          description="Add sponsors to track their packages, value, and renewals."
          action={{ label: 'Add Sponsor', href: '/council/sponsorship/new' }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Sponsor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Package</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Value</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Renewal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sponsorships.map((s) => {
                const renewalSoon = s.renewalDate && isDueWithin(s.renewalDate, 60)
                return (
                  <tr key={s.id} className={`hover:bg-slate-50 ${renewalSoon ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{s.sponsorName}</div>
                      {s.contactName && <div className="text-xs text-slate-400">{s.contactName}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{s.packageName ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 hidden md:table-cell">{formatCurrency(s.value)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {s.renewalDate ? (
                        <span className={renewalSoon ? 'text-amber-600 font-medium' : 'text-slate-600'}>
                          {formatDate(s.renewalDate)}
                          {renewalSoon && ' ⏰'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 capitalize hidden md:table-cell">{s.invoiceStatus?.replace(/_/g, ' ') ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
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
