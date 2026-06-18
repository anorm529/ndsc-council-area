import type { Metadata } from 'next'
import Link from 'next/link'
import { createMembershipSnapshot } from '@/lib/actions/membership'
import { FormField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'
import { todayISO } from '@/lib/utils'

export const metadata: Metadata = { title: 'Record Membership Snapshot' }

export default function NewMembershipSnapshotPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/council/membership" className="text-sm text-slate-500 hover:text-slate-700">← Back to membership</Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">Record Membership Snapshot</h1>
      </div>

      <form action={createMembershipSnapshot} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Snapshot date" name="snapshot_date" type="date" required defaultValue={todayISO()} />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Total members" name="total_members" type="number" placeholder="0" />
          <FormField label="Active players" name="active_players" type="number" placeholder="0" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Paid members" name="paid_members" type="number" placeholder="0" />
          <FormField label="Unpaid members" name="unpaid_members" type="number" placeholder="0" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Male" name="male_members" type="number" placeholder="0" />
          <FormField label="Female" name="female_members" type="number" placeholder="0" />
          <FormField label="Rookies" name="rookies" type="number" placeholder="0" />
        </div>
        <FormField label="Inactive players" name="inactive_players" type="number" placeholder="0" />
        <TextareaField label="Notes" name="notes" rows={2} placeholder="Any context for this snapshot..." />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Save Snapshot" />
          <Link href="/council/membership" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
