import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { FormField, SelectField, SubmitButton } from '@/components/council/ui/FormField'
import { updateClubMember } from '@/lib/actions/membership'

export const metadata: Metadata = { title: 'Edit Member' }

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer not to say', label: 'Prefer not to say' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 80 }, (_, i) => {
  const y = CURRENT_YEAR - 10 - i
  return { value: String(y), label: String(y) }
})

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const member = await prisma.clubMember.findUnique({ where: { id } })
  if (!member) notFound()

  const action = updateClubMember.bind(null, id)

  return (
    <div className="p-6 max-w-xl mx-auto">
      <PageHeader
        title={`Edit — ${member.firstName} ${member.lastName}`}
        description="Update member details and database linking."
      />

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <form action={action} className="space-y-4">

          {/* Basic details */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First name" name="first_name" required defaultValue={member.firstName} />
            <FormField label="Last name" name="last_name" required defaultValue={member.lastName} />
          </div>
          <FormField label="Email" name="email" type="email" defaultValue={member.email ?? ''} />
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Gender"
              name="gender"
              options={GENDER_OPTIONS}
              placeholder="Select gender"
              defaultValue={member.gender ?? ''}
            />
            <FormField label="Postcode" name="postcode" defaultValue={member.postcode ?? ''} />
          </div>
          <SelectField
            label="Year of birth"
            name="year_of_birth"
            options={YEAR_OPTIONS}
            placeholder="Select year"
            defaultValue={member.yearOfBirth ? String(member.yearOfBirth) : ''}
          />
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="is_rookie" defaultChecked={member.isRookie} className="rounded border-slate-300" />
              Rookie
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="is_umpire" defaultChecked={member.isUmpire} className="rounded border-slate-300" />
              Umpire
            </label>
          </div>

          <hr className="border-slate-200" />

          {/* Main DB linking */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Main Database Linking</h3>

            <label className="flex items-start gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                name="is_non_player"
                defaultChecked={member.isNonPlayer}
                className="mt-0.5 rounded border-slate-300"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Non-player (exclude from reconciliation)</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Use for club volunteers, dedicated umpires, or committee members who are not registered
                  players in the main database. They will show as "Non-player" instead of "Not in main DB".
                </p>
              </div>
            </label>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Manual player ID override
              </label>
              <input
                type="text"
                name="manual_player_id"
                defaultValue={member.manualPlayerLink ? (member.mainDbPlayerId ?? '') : ''}
                placeholder="Paste player UUID from main database…"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <p className="text-xs text-slate-500">
                Use when automatic name-matching fails (e.g. spelling differs). Leave blank to use
                name matching. Clears any existing manual link if left empty.
              </p>
              {member.mainDbPlayerId && (
                <p className="text-xs text-slate-400 mt-1">
                  Current: <code className="bg-slate-100 px-1 rounded">{member.mainDbPlayerId}</code>
                  {member.manualPlayerLink && <span className="ml-2 text-amber-600">(manually set)</span>}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <SubmitButton label="Save changes" />
            <Link
              href="/council/membership"
              className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
