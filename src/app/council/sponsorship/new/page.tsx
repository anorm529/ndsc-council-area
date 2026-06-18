import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createSponsorship } from '@/lib/actions/grants'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'

export const metadata: Metadata = { title: 'Add Sponsor' }

export default async function NewSponsorshipPage() {
  const members = await prisma.councilMember.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/council/sponsorship" className="text-sm text-slate-500 hover:text-slate-700">← Back to sponsorship</Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">Add Sponsor</h1>
      </div>

      <form action={createSponsorship} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Sponsor name" name="sponsor_name" required placeholder="Company or individual name" />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Contact name" name="contact_name" />
          <FormField label="Contact email" name="contact_email" type="email" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Package name" name="package_name" placeholder="e.g. Gold sponsor" />
          <FormField label="Value (£/yr)" name="value" type="number" placeholder="0.00" />
        </div>

        <SelectField
          label="Status"
          name="status"
          defaultValue="prospect"
          options={[
            { value: 'prospect', label: 'Prospect' },
            { value: 'contacted', label: 'Contacted' },
            { value: 'agreed', label: 'Agreed' },
            { value: 'active', label: 'Active' },
            { value: 'renewal_due', label: 'Renewal due' },
            { value: 'ended', label: 'Ended' },
          ]}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start date" name="start_date" type="date" />
          <FormField label="End date" name="end_date" type="date" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Renewal date" name="renewal_date" type="date" />
          <SelectField
            label="Invoice status"
            name="invoice_status"
            options={[
              { value: 'not_required', label: 'Not required' },
              { value: 'pending', label: 'Pending' },
              { value: 'sent', label: 'Sent' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' },
            ]}
            placeholder="Select..."
          />
        </div>

        <SelectField
          label="Owner"
          name="owner_id"
          options={members.map((m) => ({ value: m.id, label: m.name }))}
          placeholder="Assign owner"
        />

        <TextareaField label="Deliverables" name="deliverables" rows={3} placeholder="What does the sponsor receive in return?" />
        <TextareaField label="Notes" name="notes" rows={2} />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Save Sponsor" />
          <Link href="/council/sponsorship" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
