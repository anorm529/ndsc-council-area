import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getMainPool } from '@/lib/main-db'
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

type UnmatchedPlayer = { id: string; display_name: string; team_name: string | null }

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const member = await prisma.clubMember.findUnique({ where: { id } })
  if (!member) notFound()

  // Fetch unmatched players from main DB (players not yet linked to any council member)
  let unmatchedPlayers: UnmatchedPlayer[] = []
  const pool = getMainPool()
  if (pool && !member.isNonPlayer) {
    try {
      const result = await pool.query<UnmatchedPlayer>(
        `SELECT p.id, p.display_name, t.name AS team_name
         FROM players p
         LEFT JOIN player_team_seasons pts
           ON pts.player_id = p.id
           AND pts.season_id = (SELECT id FROM seasons WHERE is_active = true LIMIT 1)
         LEFT JOIN teams t ON t.id = pts.team_id
         WHERE p.active = true
           AND p.id NOT IN (
             SELECT c.main_db_player_id
             FROM club_members c
             WHERE c.main_db_player_id IS NOT NULL
               AND c.id != $1
           )
         ORDER BY p.display_name`,
        [id]
      )
      unmatchedPlayers = result.rows
    } catch {
      // Main DB unavailable — fall back to manual UUID input only
    }
  }

  const action = updateClubMember.bind(null, id)

  const showLinkingSection = !member.isNonPlayer
  const isNotFound = member.mainDbStatus === 'not_found' || member.mainDbStatus === 'pending'

  return (
    <div className="p-6 max-w-xl mx-auto">
      <PageHeader
        title={`Edit — ${member.firstName} ${member.lastName}`}
        description="Update member details and database linking."
      />

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
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
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Main Database Linking</h3>

            {/* Non-player toggle */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_non_player"
                defaultChecked={member.isNonPlayer}
                className="mt-0.5 rounded border-slate-300"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Non-player (exclude from reconciliation)</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Use for club volunteers, committee members, or dedicated umpires who are not
                  registered players in the main database.
                </p>
              </div>
            </label>

            {/* Current link status */}
            {member.mainDbPlayerId && (
              <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800">
                Currently linked to player ID{' '}
                <code className="bg-green-100 px-1 rounded font-mono">{member.mainDbPlayerId}</code>
                {member.currentTeamName && <span> · <strong>{member.currentTeamName}</strong></span>}
                {member.manualPlayerLink && <span className="ml-2 text-amber-700">(manually set)</span>}
              </div>
            )}

            {/* Unmatched player picker — only shown when main DB is reachable */}
            {unmatchedPlayers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isNotFound
                    ? 'Pick the correct player from the main database'
                    : 'Re-link to a different player'}
                </label>
                {isNotFound && (
                  <p className="text-xs text-slate-500 mb-2">
                    These are players in the main database not yet linked to anyone. Pick the one
                    that matches <strong>{member.firstName} {member.lastName}</strong>.
                  </p>
                )}
                <select
                  name="player_select"
                  defaultValue=""
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">— No selection —</option>
                  {unmatchedPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.display_name}{p.team_name ? ` (${p.team_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Manual UUID fallback */}
            {showLinkingSection && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {unmatchedPlayers.length > 0
                    ? 'Or enter player UUID directly'
                    : 'Manual player ID override'}
                </label>
                <input
                  type="text"
                  name="manual_player_id"
                  defaultValue={member.manualPlayerLink ? (member.mainDbPlayerId ?? '') : ''}
                  placeholder="Paste player UUID from main database…"
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {unmatchedPlayers.length > 0
                    ? 'The dropdown above takes priority if both are filled.'
                    : 'Use when automatic name-matching fails. Leave blank to use name matching.'}
                </p>
              </div>
            )}
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
