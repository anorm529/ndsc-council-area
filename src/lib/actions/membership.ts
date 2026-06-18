'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'
import { getMainPool } from '@/lib/main-db'

// ---------------------------------------------------------------------------
// Internal reconciliation — no auth, no redirect, never throws
// ---------------------------------------------------------------------------
async function performReconciliation() {
  const pool = getMainPool()
  if (!pool) return

  try {
    const allMembers = await prisma.clubMember.findMany({
      select: { id: true, firstName: true, lastName: true, isNonPlayer: true, manualPlayerLink: true, mainDbPlayerId: true },
    })
    if (allMembers.length === 0) return

    // Non-players: mark status and skip reconciliation
    const nonPlayerIds = allMembers.filter((m) => m.isNonPlayer).map((m) => m.id)

    // Members with a manual player ID override: refresh team only, don't re-match
    const manualMembers = allMembers.filter((m) => !m.isNonPlayer && m.manualPlayerLink && m.mainDbPlayerId)

    // Everyone else: name-match against main DB
    const autoMembers = allMembers.filter((m) => !m.isNonPlayer && !m.manualPlayerLink)

    // 1. Active season
    const seasonResult = await pool.query<{ id: string }>(
      `SELECT id FROM seasons WHERE is_active = true LIMIT 1`
    )
    const activeSeasonId = seasonResult.rows[0]?.id ?? null

    // Helper: get team for a list of player IDs in the active season
    async function fetchTeams(playerIds: string[]): Promise<Map<string, { teamId: string; teamName: string }>> {
      const map = new Map<string, { teamId: string; teamName: string }>()
      if (playerIds.length === 0 || !activeSeasonId) return map
      const result = await pool!.query<{ player_id: string; team_id: string; team_name: string }>(
        `SELECT pts.player_id, t.id AS team_id, t.name AS team_name
         FROM player_team_seasons pts
         JOIN teams t ON t.id = pts.team_id
         WHERE pts.player_id = ANY($1::uuid[])
           AND pts.season_id = $2`,
        [playerIds, activeSeasonId]
      )
      for (const row of result.rows) {
        map.set(row.player_id, { teamId: row.team_id, teamName: row.team_name })
      }
      return map
    }

    // 2. Name-match auto members
    const nameToMemberId = new Map<string, string>()
    for (const m of autoMembers) {
      const key = `${m.firstName.trim()} ${m.lastName.trim()}`.toLowerCase()
      nameToMemberId.set(key, m.id)
    }

    const normalizedNames = Array.from(nameToMemberId.keys())
    const nameToPlayerId = new Map<string, string>()

    if (normalizedNames.length > 0) {
      const playerResult = await pool.query<{ id: string; normalized_name: string }>(
        `SELECT id, normalized_name FROM players WHERE normalized_name = ANY($1::text[])`,
        [normalizedNames]
      )
      for (const row of playerResult.rows) {
        nameToPlayerId.set(row.normalized_name, row.id)
      }
    }

    // 3. Fetch teams for auto-matched + manual members
    const autoMatchedPlayerIds = Array.from(nameToPlayerId.values())
    const manualPlayerIds = manualMembers.map((m) => m.mainDbPlayerId as string)
    const allPlayerIdsForTeam = [...new Set([...autoMatchedPlayerIds, ...manualPlayerIds])]
    const playerIdToTeam = await fetchTeams(allPlayerIdsForTeam)

    // 4. Build update payloads
    const now = new Date()
    const updates: ReturnType<typeof prisma.clubMember.update>[] = []

    // Non-players
    for (const id of nonPlayerIds) {
      updates.push(prisma.clubMember.update({
        where: { id },
        data: { mainDbStatus: 'non_player', mainDbPlayerId: null, currentTeamId: null, currentTeamName: null },
      }))
    }

    // Manual overrides — refresh team, preserve player ID
    for (const m of manualMembers) {
      const team = playerIdToTeam.get(m.mainDbPlayerId!)
      updates.push(prisma.clubMember.update({
        where: { id: m.id },
        data: {
          mainDbStatus: 'linked',
          currentTeamId: team?.teamId ?? null,
          currentTeamName: team?.teamName ?? null,
          linkedAt: now,
        },
      }))
    }

    // Auto name-matched
    for (const m of autoMembers) {
      const key = `${m.firstName.trim()} ${m.lastName.trim()}`.toLowerCase()
      const playerId = nameToPlayerId.get(key) ?? null
      if (playerId) {
        const team = playerIdToTeam.get(playerId)
        updates.push(prisma.clubMember.update({
          where: { id: m.id },
          data: { mainDbPlayerId: playerId, mainDbStatus: 'linked', currentTeamId: team?.teamId ?? null, currentTeamName: team?.teamName ?? null, linkedAt: now },
        }))
      } else {
        updates.push(prisma.clubMember.update({
          where: { id: m.id },
          data: { mainDbPlayerId: null, mainDbStatus: 'not_found', currentTeamId: null, currentTeamName: null },
        }))
      }
    }

    // 5. Run in a single transaction
    await prisma.$transaction(updates)
  } catch (err) {
    // Log but don't crash the caller — reconciliation is best-effort
    console.error('[reconcile] failed:', err)
  }
}

// ---------------------------------------------------------------------------
// Exported server actions
// ---------------------------------------------------------------------------

export async function reconcileClubMembers() {
  await requireCouncilAccess()
  await performReconciliation()
  revalidatePath('/council/membership')
}

export async function createClubMember(formData: FormData) {
  await requireCouncilAccess()

  const firstName = (formData.get('first_name') as string).trim()
  const lastName = (formData.get('last_name') as string).trim()
  const email = (formData.get('email') as string)?.trim() || null
  const yearOfBirthRaw = formData.get('year_of_birth') as string
  const postcode = (formData.get('postcode') as string)?.trim().toUpperCase() || null
  const gender = (formData.get('gender') as string)?.trim() || null
  const isRookie = formData.get('is_rookie') === 'on'
  const isUmpire = formData.get('is_umpire') === 'on'

  await prisma.clubMember.create({
    data: { firstName, lastName, email, yearOfBirth: yearOfBirthRaw ? parseInt(yearOfBirthRaw) : null, postcode, gender, isRookie, isUmpire },
  })

  await performReconciliation()
  revalidatePath('/council/membership')
  redirect('/council/membership')
}

export async function deactivateClubMember(id: string) {
  await requireCouncilAccess()
  await prisma.clubMember.update({ where: { id }, data: { isActive: false } })
  revalidatePath('/council/membership')
}

export async function updateClubMember(id: string, formData: FormData) {
  await requireCouncilAccess()

  const firstName = (formData.get('first_name') as string).trim()
  const lastName = (formData.get('last_name') as string).trim()
  const email = (formData.get('email') as string)?.trim() || null
  const yearOfBirthRaw = formData.get('year_of_birth') as string
  const postcode = (formData.get('postcode') as string)?.trim().toUpperCase() || null
  const gender = (formData.get('gender') as string)?.trim() || null
  const isRookie = formData.get('is_rookie') === 'on'
  const isUmpire = formData.get('is_umpire') === 'on'
  const isNonPlayer = formData.get('is_non_player') === 'on'
  // player_select (dropdown of unmatched players) takes priority over typed UUID
  const playerSelectRaw = (formData.get('player_select') as string)?.trim() || null
  const manualPlayerIdRaw = (formData.get('manual_player_id') as string)?.trim() || null
  const manualPlayerIdFinal = playerSelectRaw || manualPlayerIdRaw || null

  // Determine link state
  let mainDbPlayerId: string | null = null
  let manualPlayerLink = false
  let mainDbStatus = 'pending'
  let currentTeamId: string | null = null
  let currentTeamName: string | null = null
  let linkedAt: Date | null = null

  if (isNonPlayer) {
    mainDbStatus = 'non_player'
  } else if (manualPlayerIdFinal) {
    // Manual override (dropdown or typed UUID): try to look up team from main DB right away
    mainDbPlayerId = manualPlayerIdFinal
    manualPlayerLink = true
    mainDbStatus = 'linked'
    linkedAt = new Date()

    const pool = getMainPool()
    if (pool) {
      try {
        const seasonResult = await pool.query<{ id: string }>(
          `SELECT id FROM seasons WHERE is_active = true LIMIT 1`
        )
        const activeSeasonId = seasonResult.rows[0]?.id ?? null
        if (activeSeasonId) {
          const teamResult = await pool.query<{ team_id: string; team_name: string }>(
            `SELECT t.id AS team_id, t.name AS team_name
             FROM player_team_seasons pts
             JOIN teams t ON t.id = pts.team_id
             WHERE pts.player_id = $1 AND pts.season_id = $2 LIMIT 1`,
            [manualPlayerIdFinal, activeSeasonId]
          )
          if (teamResult.rows[0]) {
            currentTeamId = teamResult.rows[0].team_id
            currentTeamName = teamResult.rows[0].team_name
          }
        }
      } catch {
        // Main DB unavailable — link saved, team will populate on next reconcile
      }
    }
  }

  await prisma.clubMember.update({
    where: { id },
    data: {
      firstName,
      lastName,
      email,
      yearOfBirth: yearOfBirthRaw ? parseInt(yearOfBirthRaw) : null,
      postcode,
      gender,
      isRookie,
      isUmpire,
      isNonPlayer,
      mainDbPlayerId,
      manualPlayerLink,
      mainDbStatus,
      currentTeamId,
      currentTeamName,
      linkedAt: linkedAt ?? undefined,
    },
  })

  revalidatePath('/council/membership')
  redirect('/council/membership')
}

export async function importClubMembers(formData: FormData) {
  await requireCouncilAccess()

  const file = formData.get('csv_file') as File
  const replaceAll = formData.get('replace_all') === 'on'

  if (!file || file.size === 0) throw new Error('No file provided')

  const text = await file.text()
  const rows = parseCSV(text)
  if (rows.length === 0) throw new Error('CSV file is empty or has no data rows')

  const now = new Date()
  const members = rows
    .map((row) => ({
      firstName: (row['first_name'] ?? row['First Name'] ?? row['firstname'] ?? '').trim(),
      lastName: (row['last_name'] ?? row['Last Name'] ?? row['lastname'] ?? row['surname'] ?? '').trim(),
      email: (row['email'] ?? row['Email'] ?? '').trim() || null,
      yearOfBirth: parseIntOrNull(row['year_of_birth'] ?? row['Year of Birth'] ?? row['year_birth'] ?? ''),
      postcode: (row['postcode'] ?? row['Postcode'] ?? row['post_code'] ?? '').trim().toUpperCase() || null,
      gender: (row['gender'] ?? row['Gender'] ?? row['sex'] ?? row['Sex'] ?? '').trim() || null,
      isRookie: parseBool(row['is_rookie'] ?? row['Rookie'] ?? row['rookie'] ?? ''),
      isUmpire: parseBool(row['is_umpire'] ?? row['Umpire'] ?? row['umpire'] ?? ''),
      isActive: parseBoolDefault(row['is_active'] ?? row['Is Active'] ?? row['active'] ?? '', true),
      importedAt: now,
    }))
    .filter((m) => m.firstName || m.lastName)

  if (replaceAll) await prisma.clubMember.deleteMany({})
  await prisma.clubMember.createMany({ data: members, skipDuplicates: false })

  await performReconciliation()
  revalidatePath('/council/membership')
  redirect('/council/membership')
}

export async function createMembershipSnapshot(formData: FormData) {
  await requireCouncilAccess()

  const snapshotDateRaw = formData.get('snapshot_date') as string
  const totalMembers = formData.get('total_members') as string
  const maleMembers = formData.get('male_members') as string
  const femaleMembers = formData.get('female_members') as string
  const rookies = formData.get('rookies') as string
  const paidMembers = formData.get('paid_members') as string
  const unpaidMembers = formData.get('unpaid_members') as string
  const activePlayers = formData.get('active_players') as string
  const inactivePlayers = formData.get('inactive_players') as string
  const notes = (formData.get('notes') as string) || null

  await prisma.councilMembershipSnapshot.create({
    data: {
      snapshotDate: new Date(snapshotDateRaw),
      totalMembers: totalMembers ? parseInt(totalMembers) : null,
      maleMembers: maleMembers ? parseInt(maleMembers) : null,
      femaleMembers: femaleMembers ? parseInt(femaleMembers) : null,
      rookies: rookies ? parseInt(rookies) : null,
      paidMembers: paidMembers ? parseInt(paidMembers) : null,
      unpaidMembers: unpaidMembers ? parseInt(unpaidMembers) : null,
      activePlayers: activePlayers ? parseInt(activePlayers) : null,
      inactivePlayers: inactivePlayers ? parseInt(inactivePlayers) : null,
      notes,
    },
  })

  revalidatePath('/council/membership')
  redirect('/council/membership')
}

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

function parseCSV(text: string): Record<string, string>[] {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim())
  if (lines.length < 2) return []
  const headers = parseLine(lines[0])
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])
    if (values.every((v) => !v)) continue
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h.trim()] = values[idx]?.trim() ?? '' })
    rows.push(row)
  }
  return rows
}

function parseLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else { inQuotes = !inQuotes }
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function parseIntOrNull(val: string): number | null {
  if (!val) return null
  const n = parseInt(val.trim())
  return isNaN(n) ? null : n
}

// Yes/yes/true/1/y → true, No/no/false/0/n/empty → false
function parseBool(val: string): boolean {
  return ['true', 'yes', '1', 'y'].includes((val ?? '').toLowerCase().trim())
}

// Same but with a configurable default for missing/empty values
function parseBoolDefault(val: string, defaultVal: boolean): boolean {
  const v = (val ?? '').toLowerCase().trim()
  if (!v) return defaultVal
  return ['true', 'yes', '1', 'y'].includes(v)
}
