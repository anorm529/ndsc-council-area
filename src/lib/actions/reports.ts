'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'

export async function createOfficerReport(formData: FormData) {
  await requireCouncilAccess()

  const title = formData.get('title') as string
  const reportType = formData.get('report_type') as string
  const authorId = formData.get('author_id') as string
  const relatedMeetingId = (formData.get('related_meeting_id') as string) || null
  const periodStart = (formData.get('reporting_period_start') as string) || null
  const periodEnd = (formData.get('reporting_period_end') as string) || null
  const content = formData.get('content') as string
  const highlights = (formData.get('highlights') as string) || null
  const risks = (formData.get('risks') as string) || null
  const requests = (formData.get('requests') as string) || null
  const status = (formData.get('status') as string) || 'draft'

  if (!title || !reportType || !authorId || !content) {
    throw new Error('Required fields missing')
  }

  const report = await prisma.councilOfficerReport.create({
    data: {
      title,
      reportType,
      authorId,
      relatedMeetingId: relatedMeetingId || null,
      reportingPeriodStart: periodStart ? new Date(periodStart) : null,
      reportingPeriodEnd: periodEnd ? new Date(periodEnd) : null,
      content,
      highlights,
      risks,
      requests,
      status,
    },
  })

  revalidatePath('/council/reports')
  redirect(`/council/reports/${report.id}`)
}

export async function updateOfficerReport(id: string, formData: FormData) {
  await requireCouncilAccess()

  const title = formData.get('title') as string
  const reportType = formData.get('report_type') as string
  const authorId = formData.get('author_id') as string
  const relatedMeetingId = (formData.get('related_meeting_id') as string) || null
  const periodStart = (formData.get('reporting_period_start') as string) || null
  const periodEnd = (formData.get('reporting_period_end') as string) || null
  const content = formData.get('content') as string
  const highlights = (formData.get('highlights') as string) || null
  const risks = (formData.get('risks') as string) || null
  const requests = (formData.get('requests') as string) || null
  const status = (formData.get('status') as string) || 'draft'

  await prisma.councilOfficerReport.update({
    where: { id },
    data: {
      title,
      reportType,
      authorId,
      relatedMeetingId: relatedMeetingId || null,
      reportingPeriodStart: periodStart ? new Date(periodStart) : null,
      reportingPeriodEnd: periodEnd ? new Date(periodEnd) : null,
      content,
      highlights,
      risks,
      requests,
      status,
    },
  })

  revalidatePath('/council/reports')
  revalidatePath(`/council/reports/${id}`)
  redirect(`/council/reports/${id}`)
}
