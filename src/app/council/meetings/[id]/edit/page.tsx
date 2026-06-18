import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { updateMeeting } from '@/lib/actions/meetings'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'

export const metadata: Metadata = { title: 'Edit Meeting' }

export default async function EditMeetingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [meeting, members] = await Promise.all([
    prisma.councilMeeting.findUnique({ where: { id } }),
    prisma.councilMember.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, role: true },
    }),
  ])

  if (!meeting) notFound()

  const memberOptions = members.map((m) => ({
    value: m.id,
    label: `${m.name} (${m.role})`,
  }))

  const updateWithId = updateMeeting.bind(null, id)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/council/meetings/${id}`} className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to meeting
        </Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">Edit Meeting</h1>
      </div>

      <form action={updateWithId} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Title" name="title" required defaultValue={meeting.title} />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Type"
            name="meeting_type"
            defaultValue={meeting.meetingType ?? ''}
            options={[
              { value: 'council', label: 'Council' },
              { value: 'committee', label: 'Committee' },
              { value: 'agm', label: 'AGM' },
              { value: 'egm', label: 'EGM' },
              { value: 'finance', label: 'Finance' },
              { value: 'tournament', label: 'Tournament' },
              { value: 'welfare', label: 'Welfare' },
            ]}
            placeholder="Select type"
          />
          <SelectField
            label="Status"
            name="status"
            defaultValue={meeting.status}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        <FormField
          label="Date"
          name="meeting_date"
          type="date"
          required
          defaultValue={meeting.meetingDate.toISOString().split('T')[0]}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start time" name="start_time" type="time" defaultValue={meeting.startTime ?? ''} />
          <FormField label="End time" name="end_time" type="time" defaultValue={meeting.endTime ?? ''} />
        </div>

        <FormField label="Location" name="location" defaultValue={meeting.location ?? ''} />

        <SelectField
          label="Chair"
          name="chair_id"
          defaultValue={meeting.chairId ?? ''}
          options={memberOptions}
          placeholder="Select chair"
        />
        <SelectField
          label="Minute taker"
          name="minute_taker_id"
          defaultValue={meeting.minuteTakerId ?? ''}
          options={memberOptions}
          placeholder="Select minute taker"
        />

        <TextareaField label="Agenda" name="agenda" rows={5} defaultValue={meeting.agenda ?? ''} />
        <TextareaField label="Minutes" name="minutes" rows={8} defaultValue={meeting.minutes ?? ''} />
        <TextareaField label="Summary" name="summary" rows={3} defaultValue={meeting.summary ?? ''} />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Save Changes" />
          <Link href={`/council/meetings/${id}`} className="text-sm text-slate-500 hover:text-slate-700">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
