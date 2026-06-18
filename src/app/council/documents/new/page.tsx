import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createDocument } from '@/lib/actions/communications'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'
import { todayISO } from '@/lib/utils'

export const metadata: Metadata = { title: 'Add Document' }

export default async function NewDocumentPage() {
  const members = await prisma.councilMember.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/council/documents" className="text-sm text-slate-500 hover:text-slate-700">← Back to documents</Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">Add Document</h1>
      </div>

      <form action={createDocument} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Title" name="title" required placeholder="e.g. NDSC Club Constitution" />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Type"
            name="document_type"
            options={[
              { value: 'constitution', label: 'Constitution' },
              { value: 'policy', label: 'Policy' },
              { value: 'procedure', label: 'Procedure' },
              { value: 'minutes', label: 'Minutes' },
              { value: 'report', label: 'Report' },
              { value: 'risk_assessment', label: 'Risk assessment' },
              { value: 'finance', label: 'Finance' },
              { value: 'tournament', label: 'Tournament' },
              { value: 'other', label: 'Other' },
            ]}
            placeholder="Select type"
          />
          <FormField label="Version" name="version" placeholder="e.g. 1.0" />
        </div>

        <SelectField
          label="Status"
          name="status"
          defaultValue="active"
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active' },
            { value: 'under_review', label: 'Under review' },
            { value: 'archived', label: 'Archived' },
          ]}
        />

        <FormField label="Document URL" name="document_url" placeholder="https://drive.google.com/..." hint="Link to Google Drive, Dropbox, or any URL" />

        <SelectField
          label="Owner"
          name="owner_id"
          options={members.map((m) => ({ value: m.id, label: m.name }))}
          placeholder="Assign owner"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Last reviewed" name="last_reviewed" type="date" defaultValue={todayISO()} />
          <FormField label="Next review date" name="next_review_date" type="date" />
        </div>

        <TextareaField label="Summary" name="summary" rows={3} placeholder="Brief description of what this document covers..." />
        <TextareaField label="Notes" name="notes" rows={2} />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Add Document" />
          <Link href="/council/documents" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
