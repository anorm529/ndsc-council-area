'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'
import { canViewWelfare } from '@/lib/permissions'

export async function createWelfareCase(formData: FormData) {
  const user = await requireCouncilAccess()
  if (!canViewWelfare(user)) throw new Error('Welfare access required')

  const title = formData.get('title') as string
  const caseType = formData.get('case_type') as string
  const incidentDateRaw = (formData.get('incident_date') as string) || null
  const reportedDateRaw = formData.get('reported_date') as string
  const reportedById = (formData.get('reported_by_id') as string) || null
  const assignedToId = (formData.get('assigned_to_id') as string) || null
  const status = (formData.get('status') as string) || 'open'
  const severity = (formData.get('severity') as string) || 'low'
  const summary = (formData.get('summary') as string) || null
  const confidentialNotes = (formData.get('confidential_notes') as string) || null

  if (!title || !caseType || !reportedDateRaw) throw new Error('Required fields missing')

  const welfareCase = await prisma.councilWelfareCase.create({
    data: {
      title,
      caseType,
      incidentDate: incidentDateRaw ? new Date(incidentDateRaw) : null,
      reportedDate: new Date(reportedDateRaw),
      reportedById: reportedById || null,
      assignedToId: assignedToId || null,
      status,
      severity,
      summary,
      confidentialNotes,
    },
  })

  revalidatePath('/council/welfare')
  redirect(`/council/welfare/${welfareCase.id}`)
}

export async function updateWelfareStatus(id: string, formData: FormData) {
  const user = await requireCouncilAccess()
  if (!canViewWelfare(user)) throw new Error('Welfare access required')

  const status = formData.get('status') as string
  const actionsTaken = (formData.get('actions_taken') as string) || null
  const followUpRequired = formData.get('follow_up_required') === 'true'
  const followUpDateRaw = (formData.get('follow_up_date') as string) || null
  const confidentialNotes = (formData.get('confidential_notes') as string) || null

  await prisma.councilWelfareCase.update({
    where: { id },
    data: {
      status,
      actionsTaken,
      followUpRequired,
      followUpDate: followUpDateRaw ? new Date(followUpDateRaw) : null,
      confidentialNotes,
    },
  })

  revalidatePath(`/council/welfare/${id}`)
  revalidatePath('/council/welfare')
  redirect(`/council/welfare/${id}`)
}
