import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createWelfareCase } from '@/lib/actions/welfare'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'
import { todayISO } from '@/lib/utils'

export const metadata: Metadata = { title: 'New Welfare Case' }

export default async function NewWelfareCasePage() {
  const members = await prisma.councilMember.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/council/welfare" className="text-sm text-slate-500 hover:text-slate-700">← Back to welfare log</Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">New Welfare / Conduct Case</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
        ⚠ This record is confidential. Only welfare officers and senior council can view it.
      </div>

      <form action={createWelfareCase} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Title / reference" name="title" required placeholder="e.g. Conduct complaint – June 2025" />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Case type"
            name="case_type"
            required
            options={[
              { value: 'welfare', label: 'Welfare' },
              { value: 'conduct', label: 'Conduct' },
              { value: 'injury', label: 'Injury' },
              { value: 'safeguarding', label: 'Safeguarding' },
              { value: 'complaint', label: 'Complaint' },
              { value: 'disciplinary', label: 'Disciplinary' },
              { value: 'general_incident', label: 'General incident' },
            ]}
            placeholder="Select type"
          />
          <SelectField
            label="Severity"
            name="severity"
            defaultValue="low"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Incident date" name="incident_date" type="date" />
          <FormField label="Reported date" name="reported_date" type="date" required defaultValue={todayISO()} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Reported by"
            name="reported_by_id"
            options={members.map((m) => ({ value: m.id, label: m.name }))}
            placeholder="Select member"
          />
          <SelectField
            label="Assigned to"
            name="assigned_to_id"
            options={members.map((m) => ({ value: m.id, label: m.name }))}
            placeholder="Select assignee"
          />
        </div>

        <SelectField
          label="Status"
          name="status"
          defaultValue="open"
          options={[
            { value: 'open', label: 'Open' },
            { value: 'under_review', label: 'Under review' },
            { value: 'action_required', label: 'Action required' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ]}
        />

        <TextareaField label="Summary" name="summary" rows={3} placeholder="Non-confidential overview..." />
        <TextareaField label="Confidential notes" name="confidential_notes" rows={4} placeholder="Detailed confidential information — restricted to welfare roles..." />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Create Case" />
          <Link href="/council/welfare" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
