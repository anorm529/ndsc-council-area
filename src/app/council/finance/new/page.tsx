import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createFinanceItem } from '@/lib/actions/finance'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'
import { todayISO } from '@/lib/utils'

export const metadata: Metadata = { title: 'Add Finance Item' }

export default async function NewFinancePage() {
  const members = await prisma.councilMember.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/council/finance" className="text-sm text-slate-500 hover:text-slate-700">← Back to finance</Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">Add Finance Item</h1>
      </div>

      <form action={createFinanceItem} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Title" name="title" required placeholder="e.g. Equipment purchase – bats" />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Type"
            name="item_type"
            required
            options={[
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
              { value: 'reimbursement', label: 'Reimbursement' },
              { value: 'grant_income', label: 'Grant income' },
              { value: 'sponsorship_income', label: 'Sponsorship income' },
              { value: 'membership_income', label: 'Membership income' },
            ]}
            placeholder="Select type"
          />
          <SelectField
            label="Category"
            name="category"
            options={[
              { value: 'equipment', label: 'Equipment' },
              { value: 'venue', label: 'Venue' },
              { value: 'tournament', label: 'Tournament' },
              { value: 'membership', label: 'Membership' },
              { value: 'sponsorship', label: 'Sponsorship' },
              { value: 'grant', label: 'Grant' },
              { value: 'social', label: 'Social' },
              { value: 'website', label: 'Website' },
              { value: 'insurance', label: 'Insurance' },
            ]}
            placeholder="Select category"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Amount (£)" name="amount" type="number" required placeholder="0.00" hint="Enter positive number for all types" />
          <FormField label="Date" name="item_date" type="date" required defaultValue={todayISO()} />
        </div>

        <SelectField
          label="Status"
          name="status"
          defaultValue="pending"
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'paid', label: 'Paid' },
            { value: 'received', label: 'Received' },
            { value: 'rejected', label: 'Rejected' },
          ]}
        />

        <SelectField
          label="Submitted by"
          name="submitted_by_id"
          options={members.map((m) => ({ value: m.id, label: m.name }))}
          placeholder="Select member"
        />

        <FormField label="Receipt URL" name="receipt_url" placeholder="https://..." />
        <TextareaField label="Description / notes" name="notes" rows={3} />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Add Item" />
          <Link href="/council/finance" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
