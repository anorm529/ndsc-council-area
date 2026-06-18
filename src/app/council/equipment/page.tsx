import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDate, formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Equipment Register' }

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; team?: string; replace?: string }>
}) {
  const { category, team, replace } = await searchParams

  const equipment = await prisma.councilEquipment.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(team ? { teamSlug: team } : {}),
      ...(replace === '1' ? { replacementNeeded: true } : {}),
    },
    orderBy: { itemName: 'asc' },
    include: { assignedTo: { select: { name: true } } },
  })

  const needsReplacement = equipment.filter((e) => e.replacementNeeded).length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Equipment Register"
        description="Club equipment inventory and condition tracker."
        action={{ label: 'Add Item', href: '/council/equipment/new' }}
      />

      {needsReplacement > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 flex items-center justify-between text-sm">
          <span className="text-red-700">{needsReplacement} item{needsReplacement > 1 ? 's need' : ' needs'} replacement</span>
          <Link href="/council/equipment?replace=1" className="text-red-600 font-medium hover:underline">View</Link>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/council/equipment" className={`px-3 py-1 rounded-full text-xs font-medium ${!category && !team && !replace ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</Link>
        {['bats', 'balls', 'bases', 'tees', 'first_aid', 'catcher_gear', 'team_bag', 'clothing', 'other'].map((c) => (
          <Link key={c} href={`/council/equipment?category=${c}`} className={`px-3 py-1 rounded-full text-xs font-medium ${category === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {c.replace(/_/g, ' ')}
          </Link>
        ))}
        <span className="text-slate-300 self-center">|</span>
        {['buccaneers', 'barracudas', 'sluggers'].map((t) => (
          <Link key={t} href={`/council/equipment?team=${t}`} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${team === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t}</Link>
        ))}
      </div>

      {equipment.length === 0 ? (
        <EmptyState
          title="No equipment recorded"
          description="Add items to the equipment register to track condition and assignments."
          action={{ label: 'Add Item', href: '/council/equipment/new' }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Item</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Condition</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Team / Assigned</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Last checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipment.map((e) => (
                <tr key={e.id} className={`hover:bg-slate-50 ${e.replacementNeeded ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {e.replacementNeeded && <span className="text-red-500 mr-1" title="Needs replacement">⚠</span>}
                      {e.itemName}
                    </div>
                    {e.storageLocation && <div className="text-xs text-slate-400">{e.storageLocation}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 capitalize hidden sm:table-cell">{e.category?.replace(/_/g, ' ') ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{e.quantity}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.condition ?? 'good'} /></td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                    {e.teamSlug && <span className="capitalize">{e.teamSlug}</span>}
                    {e.assignedTo && <span className="text-slate-400"> / {e.assignedTo.name}</span>}
                    {!e.teamSlug && !e.assignedTo && '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{formatDate(e.lastChecked)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
