import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createOfficerReport } from '@/lib/actions/reports'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'

export const metadata: Metadata = { title: 'New Officer Report' }

export default async function NewReportPage() {
  const [members, meetings] = await Promise.all([
    prisma.councilMember.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true, role: true } }),
    prisma.councilMeeting.findMany({ orderBy: { meetingDate: 'desc' }, take: 20, select: { id: true, title: true, meetingDate: true } }),
  ])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/council/reports" className="text-sm text-slate-500 hover:text-slate-700">← Back to reports</Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">New Officer Report</h1>
      </div>

      <form action={createOfficerReport} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Title" name="title" required placeholder="e.g. Chair Report – June 2025" />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Report type"
            name="report_type"
            required
            options={[
              { value: 'chair', label: 'Chair' },
              { value: 'vice_chair', label: 'Vice Chair' },
              { value: 'secretary', label: 'Secretary' },
              { value: 'treasurer', label: 'Treasurer' },
              { value: 'media', label: 'Media' },
              { value: 'captain', label: 'Captain' },
              { value: 'welfare', label: 'Welfare' },
              { value: 'tournament', label: 'Tournament' },
              { value: 'sponsorship', label: 'Sponsorship' },
            ]}
            placeholder="Select type"
          />
          <SelectField
            label="Author"
            name="author_id"
            required
            options={members.map((m) => ({ value: m.id, label: `${m.name} (${m.role})` }))}
            placeholder="Select author"
          />
        </div>

        <SelectField
          label="Related meeting"
          name="related_meeting_id"
          options={meetings.map((m) => ({
            value: m.id,
            label: `${m.title} (${new Date(m.meetingDate).toLocaleDateString('en-GB')})`,
          }))}
          placeholder="Link to meeting..."
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Reporting period start" name="reporting_period_start" type="date" />
          <FormField label="Reporting period end" name="reporting_period_end" type="date" />
        </div>

        <SelectField
          label="Status"
          name="status"
          defaultValue="draft"
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'submitted', label: 'Submitted' },
            { value: 'reviewed', label: 'Reviewed' },
            { value: 'archived', label: 'Archived' },
          ]}
        />

        <TextareaField label="Content" name="content" required rows={8} placeholder="Main report body..." />
        <TextareaField label="Highlights" name="highlights" rows={3} placeholder="Key achievements or positive news..." />
        <TextareaField label="Risks / concerns" name="risks" rows={3} placeholder="Issues or risks to flag..." />
        <TextareaField label="Requests" name="requests" rows={2} placeholder="Anything you need from the council..." />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Save Report" />
          <Link href="/council/reports" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
