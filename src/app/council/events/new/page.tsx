import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createEvent } from '@/lib/actions/events'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'

export const metadata: Metadata = { title: 'New Event' }

export default async function NewEventPage() {
  const members = await prisma.councilMember.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/council/events" className="text-sm text-slate-500 hover:text-slate-700">← Back to events</Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">New Event</h1>
      </div>

      <form action={createEvent} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Event name" name="title" required placeholder="e.g. NDSC Try Softball Day 2025" />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Event type"
            name="event_type"
            options={[
              { value: 'tournament', label: 'Tournament' },
              { value: 'awards_night', label: 'Awards night' },
              { value: 'try_softball', label: 'Try softball' },
              { value: 'fundraiser', label: 'Fundraiser' },
              { value: 'social', label: 'Social' },
              { value: 'training', label: 'Training' },
              { value: 'council_event', label: 'Council event' },
            ]}
            placeholder="Select type"
          />
          <SelectField
            label="Status"
            name="status"
            defaultValue="planning"
            options={[
              { value: 'idea', label: 'Idea' },
              { value: 'planning', label: 'Planning' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'live', label: 'Live' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        <FormField label="Event date" name="event_date" type="date" />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start time" name="start_time" type="time" />
          <FormField label="End time" name="end_time" type="time" />
        </div>

        <FormField label="Location" name="location" />
        <FormField label="Budget (£)" name="budget" type="number" placeholder="0.00" />

        <SelectField
          label="Event lead"
          name="lead_id"
          options={members.map((m) => ({ value: m.id, label: m.name }))}
          placeholder="Assign lead..."
        />

        <TextareaField label="Description" name="description" rows={3} />
        <TextareaField label="Notes" name="notes" rows={2} />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Create Event" />
          <Link href="/council/events" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
