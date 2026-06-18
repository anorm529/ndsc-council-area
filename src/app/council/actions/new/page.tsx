import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createCouncilAction } from '@/lib/actions/council-actions'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'
import { todayISO } from '@/lib/utils'

export const metadata: Metadata = { title: 'New Action' }

export default async function NewActionPage({
  searchParams,
}: {
  searchParams: Promise<{ meeting?: string }>
}) {
  const { meeting: meetingId } = await searchParams

  const [members, meetings] = await Promise.all([
    prisma.councilMember.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.councilMeeting.findMany({ orderBy: { meetingDate: 'desc' }, take: 20, select: { id: true, title: true, meetingDate: true } }),
  ])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/council/actions" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to actions
        </Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">New Action</h1>
      </div>

      <form action={createCouncilAction} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Title" name="title" required placeholder="What needs to be done?" />

        <TextareaField label="Description" name="description" rows={3} />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Owner"
            name="owner_id"
            options={members.map((m) => ({ value: m.id, label: m.name }))}
            placeholder="Assign to..."
          />
          <SelectField
            label="Priority"
            name="priority"
            defaultValue="medium"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Status"
            name="status"
            defaultValue="not_started"
            options={[
              { value: 'not_started', label: 'Not started' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'blocked', label: 'Blocked' },
              { value: 'complete', label: 'Complete' },
              { value: 'deferred', label: 'Deferred' },
            ]}
          />
          <SelectField
            label="Category"
            name="category"
            options={[
              { value: 'governance', label: 'Governance' },
              { value: 'finance', label: 'Finance' },
              { value: 'facilities', label: 'Facilities' },
              { value: 'media', label: 'Media' },
              { value: 'team', label: 'Team' },
              { value: 'welfare', label: 'Welfare' },
              { value: 'tournament', label: 'Tournament' },
              { value: 'sponsorship', label: 'Sponsorship' },
              { value: 'equipment', label: 'Equipment' },
            ]}
            placeholder="Select category"
          />
        </div>

        <FormField label="Due date" name="due_date" type="date" />

        <SelectField
          label="Related meeting"
          name="related_meeting_id"
          defaultValue={meetingId ?? ''}
          options={meetings.map((m) => ({
            value: m.id,
            label: `${m.title} (${new Date(m.meetingDate).toLocaleDateString('en-GB')})`,
          }))}
          placeholder="Link to a meeting..."
        />

        <TextareaField label="Notes" name="notes" rows={2} />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Create Action" />
          <Link href="/council/actions" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
