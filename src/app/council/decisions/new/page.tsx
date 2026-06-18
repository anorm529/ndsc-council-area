import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createDecision } from '@/lib/actions/decisions'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'
import { todayISO } from '@/lib/utils'

export const metadata: Metadata = { title: 'Log Decision' }

export default async function NewDecisionPage({
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
        <Link href="/council/decisions" className="text-sm text-slate-500 hover:text-slate-700">← Back to decisions</Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">Log a Decision</h1>
      </div>

      <form action={createDecision} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Title" name="title" required placeholder="Brief title for this decision" />
        <FormField label="Decision date" name="decision_date" type="date" required defaultValue={todayISO()} />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Status"
            name="status"
            defaultValue="approved"
            options={[
              { value: 'proposed', label: 'Proposed' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'deferred', label: 'Deferred' },
              { value: 'superseded', label: 'Superseded' },
            ]}
          />
          <SelectField
            label="Proposed by"
            name="proposed_by_id"
            options={members.map((m) => ({ value: m.id, label: m.name }))}
            placeholder="Select member"
          />
        </div>

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

        <TextareaField label="Description" name="description" rows={3} placeholder="What was decided?" />
        <TextareaField label="Rationale" name="rationale" rows={2} placeholder="Why was this decision made?" />
        <TextareaField label="Outcome / actions" name="outcome" rows={2} />

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Votes for" name="vote_for" type="number" placeholder="0" />
          <FormField label="Votes against" name="vote_against" type="number" placeholder="0" />
          <FormField label="Abstentions" name="vote_abstain" type="number" placeholder="0" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Log Decision" />
          <Link href="/council/decisions" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
