'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'

export async function createTeamReport(formData: FormData) {
  await requireCouncilAccess()

  const teamSlug = formData.get('team_slug') as string
  const title = formData.get('title') as string
  const captainId = (formData.get('captain_id') as string) || null
  const relatedMeetingId = (formData.get('related_meeting_id') as string) || null
  const reportDateRaw = formData.get('report_date') as string
  const squadUpdate = (formData.get('squad_update') as string) || null
  const performanceUpdate = (formData.get('performance_update') as string) || null
  const issues = (formData.get('issues') as string) || null
  const equipmentNeeds = (formData.get('equipment_needs') as string) || null
  const playerConcerns = (formData.get('player_concerns') as string) || null
  const requests = (formData.get('requests') as string) || null
  const status = (formData.get('status') as string) || 'draft'

  if (!teamSlug || !title || !reportDateRaw) throw new Error('Required fields missing')

  await prisma.councilTeamReport.create({
    data: {
      teamSlug,
      title,
      captainId: captainId || null,
      relatedMeetingId: relatedMeetingId || null,
      reportDate: new Date(reportDateRaw),
      squadUpdate,
      performanceUpdate,
      issues,
      equipmentNeeds,
      playerConcerns,
      requests,
      status,
    },
  })

  revalidatePath('/council/teams')
  redirect('/council/teams')
}
