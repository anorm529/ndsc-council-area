import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createGrant } from '@/lib/actions/grants'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'

export const metadata: Metadata = { title: 'Add Grant' }

export default async function NewGrantPage() {
  const members = await prisma.councilMember.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/council/grants" className="text-sm text-slate-500 hover:text-slate-700">← Back to grants</Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">Add Grant</h1>
      </div>

      <form action={createGrant} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Grant name" name="grant_name" required placeholder="e.g. Sport NI Small Grants" />
        <FormField label="Provider / funder" name="provider" placeholder="e.g. Sport Northern Ireland" />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Status"
            name="status"
            defaultValue="researching"
            options={[
              { value: 'researching', label: 'Researching' },
              { value: 'drafting', label: 'Drafting' },
              { value: 'submitted', label: 'Submitted' },
              { value: 'awarded', label: 'Awarded' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'reporting_due', label: 'Reporting due' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
          <SelectField
            label="Owner"
            name="owner_id"
            options={members.map((m) => ({ value: m.id, label: m.name }))}
            placeholder="Assign owner"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Amount requested (£)" name="amount_requested" type="number" placeholder="0.00" />
          <FormField label="Amount awarded (£)" name="amount_awarded" type="number" placeholder="0.00" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Application deadline" name="deadline" type="date" />
          <FormField label="Submitted date" name="submitted_date" type="date" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Outcome date" name="outcome_date" type="date" />
          <FormField label="Reporting deadline" name="reporting_deadline" type="date" />
        </div>

        <TextareaField label="Purpose" name="purpose" rows={2} placeholder="What will the grant be used for?" />
        <TextareaField label="Required documents" name="required_documents" rows={2} placeholder="Checklist of documents needed..." />
        <TextareaField label="Notes" name="notes" rows={2} />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Save Grant" />
          <Link href="/council/grants" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
