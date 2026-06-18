import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createTeamReport } from '@/lib/actions/teams'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'
import { todayISO } from '@/lib/utils'

export const metadata: Metadata = { title: 'New Team Report' }

export default async function NewTeamReportPage() {
  const [members, meetings] = await Promise.all([
    prisma.councilMember.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.councilMeeting.findMany({ orderBy: { meetingDate: 'desc' }, take: 20, select: { id: true, title: true, meetingDate: true } }),
  ])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/council/teams" className="text-sm text-slate-500 hover:text-slate-700">← Back to team reports</Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">New Team Report</h1>
      </div>

      <form action={createTeamReport} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Title" name="title" required placeholder="e.g. Buccaneers Update – June 2025" />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Team"
            name="team_slug"
            required
            options={[
              { value: 'buccaneers', label: 'Buccaneers' },
              { value: 'barracudas', label: 'Barracudas' },
              { value: 'sluggers', label: 'Sluggers' },
            ]}
            placeholder="Select team"
          />
          <SelectField
            label="Captain"
            name="captain_id"
            options={members.map((m) => ({ value: m.id, label: m.name }))}
            placeholder="Select captain"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Report date" name="report_date" type="date" required defaultValue={todayISO()} />
          <SelectField
            label="Status"
            name="status"
            defaultValue="draft"
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'submitted', label: 'Submitted' },
              { value: 'reviewed', label: 'Reviewed' },
            ]}
          />
        </div>

        <SelectField
          label="Related meeting"
          name="related_meeting_id"
          options={meetings.map((m) => ({ value: m.id, label: `${m.title} (${new Date(m.meetingDate).toLocaleDateString('en-GB')})` }))}
          placeholder="Link to meeting..."
        />

        <TextareaField label="Squad update" name="squad_update" rows={3} placeholder="Player availability, new players, departures..." />
        <TextareaField label="Performance update" name="performance_update" rows={3} placeholder="Recent results, form, upcoming fixtures..." />
        <TextareaField label="Issues" name="issues" rows={2} placeholder="Any problems to raise..." />
        <TextareaField label="Equipment needs" name="equipment_needs" rows={2} />
        <TextareaField label="Player concerns" name="player_concerns" rows={2} hint="Keep confidential — welfare officer should be involved if needed." />
        <TextareaField label="Requests to council" name="requests" rows={2} />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Save Report" />
          <Link href="/council/teams" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
