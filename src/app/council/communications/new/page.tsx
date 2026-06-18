import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createCommunication } from '@/lib/actions/communications'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'

export const metadata: Metadata = { title: 'New Communication' }

export default async function NewCommunicationPage() {
  const [members, events] = await Promise.all([
    prisma.councilMember.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.councilEvent.findMany({ orderBy: { eventDate: 'desc' }, take: 20, select: { id: true, title: true } }),
  ])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/council/communications" className="text-sm text-slate-500 hover:text-slate-700">← Back to communications</Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">Plan a Communication</h1>
      </div>

      <form action={createCommunication} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Title" name="title" required placeholder="e.g. June match report – Buccaneers vs Barracudas" />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Channel"
            name="channel"
            options={[
              { value: 'facebook', label: 'Facebook' },
              { value: 'instagram', label: 'Instagram' },
              { value: 'website', label: 'Website' },
              { value: 'local_paper', label: 'Local paper' },
              { value: 'email', label: 'Email' },
              { value: 'newsletter', label: 'Newsletter' },
              { value: 'sponsor_post', label: 'Sponsor post' },
            ]}
            placeholder="Select channel"
          />
          <SelectField
            label="Content type"
            name="content_type"
            options={[
              { value: 'match_report', label: 'Match report' },
              { value: 'club_report', label: 'Club report' },
              { value: 'event_post', label: 'Event post' },
              { value: 'sponsor_post', label: 'Sponsor post' },
              { value: 'announcement', label: 'Announcement' },
              { value: 'recruitment', label: 'Recruitment' },
              { value: 'award', label: 'Award' },
            ]}
            placeholder="Select type"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Planned date" name="planned_date" type="date" />
          <SelectField
            label="Status"
            name="status"
            defaultValue="idea"
            options={[
              { value: 'idea', label: 'Idea' },
              { value: 'draft', label: 'Draft' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'published', label: 'Published' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        <SelectField
          label="Owner"
          name="owner_id"
          options={members.map((m) => ({ value: m.id, label: m.name }))}
          placeholder="Assign owner"
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Related team"
            name="related_team_slug"
            options={[
              { value: 'buccaneers', label: 'Buccaneers' },
              { value: 'barracudas', label: 'Barracudas' },
              { value: 'sluggers', label: 'Sluggers' },
            ]}
            placeholder="Not team-specific"
          />
          <SelectField
            label="Related event"
            name="related_event_id"
            options={events.map((e) => ({ value: e.id, label: e.title }))}
            placeholder="Not event-specific"
          />
        </div>

        <TextareaField label="Copy / content" name="copy" rows={5} placeholder="Draft the post or article copy here..." />
        <TextareaField label="Notes" name="notes" rows={2} />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Save" />
          <Link href="/council/communications" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
