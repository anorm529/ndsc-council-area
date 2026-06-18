import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createMeeting } from '@/lib/actions/meetings'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'
import { todayISO } from '@/lib/utils'

export const metadata: Metadata = { title: 'New Meeting' }

export default async function NewMeetingPage() {
  const members = await prisma.councilMember.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, role: true },
  })

  const memberOptions = members.map((m) => ({
    value: m.id,
    label: `${m.name} (${m.role})`,
  }))

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/council/meetings" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to meetings
        </Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">Schedule a Meeting</h1>
      </div>

      <form action={createMeeting} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Title" name="title" required placeholder="e.g. June Council Meeting" />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Type"
            name="meeting_type"
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
            defaultValue="scheduled"
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        <FormField label="Date" name="meeting_date" type="date" required defaultValue={todayISO()} />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start time" name="start_time" type="time" />
          <FormField label="End time" name="end_time" type="time" />
        </div>

        <FormField label="Location" name="location" placeholder="e.g. Softball Pitch, Online (Zoom)" />

        <SelectField
          label="Chair"
          name="chair_id"
          options={memberOptions}
          placeholder="Select chair"
        />
        <SelectField
          label="Minute taker"
          name="minute_taker_id"
          options={memberOptions}
          placeholder="Select minute taker"
        />

        <TextareaField
          label="Agenda"
          name="agenda"
          rows={5}
          placeholder="List agenda items..."
        />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Create Meeting" />
          <Link href="/council/meetings" className="text-sm text-slate-500 hover:text-slate-700">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
