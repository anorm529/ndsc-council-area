'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'

export async function createMeeting(formData: FormData) {
  await requireCouncilAccess()

  const title = formData.get('title') as string
  const meetingType = (formData.get('meeting_type') as string) || null
  const meetingDateRaw = formData.get('meeting_date') as string
  const startTime = (formData.get('start_time') as string) || null
  const endTime = (formData.get('end_time') as string) || null
  const location = (formData.get('location') as string) || null
  const status = (formData.get('status') as string) || 'draft'
  const chairId = (formData.get('chair_id') as string) || null
  const minuteTakerId = (formData.get('minute_taker_id') as string) || null
  const agenda = (formData.get('agenda') as string) || null

  if (!title || !meetingDateRaw) {
    throw new Error('Title and meeting date are required')
  }

  const meeting = await prisma.councilMeeting.create({
    data: {
      title,
      meetingType,
      meetingDate: new Date(meetingDateRaw),
      startTime,
      endTime,
      location,
      status,
      chairId: chairId || null,
      minuteTakerId: minuteTakerId || null,
      agenda,
    },
  })

  revalidatePath('/council/meetings')
  revalidatePath('/council/dashboard')
  redirect(`/council/meetings/${meeting.id}`)
}

export async function updateMeeting(id: string, formData: FormData) {
  await requireCouncilAccess()

  const title = formData.get('title') as string
  const meetingType = (formData.get('meeting_type') as string) || null
  const meetingDateRaw = formData.get('meeting_date') as string
  const startTime = (formData.get('start_time') as string) || null
  const endTime = (formData.get('end_time') as string) || null
  const location = (formData.get('location') as string) || null
  const status = (formData.get('status') as string) || 'draft'
  const chairId = (formData.get('chair_id') as string) || null
  const minuteTakerId = (formData.get('minute_taker_id') as string) || null
  const agenda = (formData.get('agenda') as string) || null
  const minutes = (formData.get('minutes') as string) || null
  const summary = (formData.get('summary') as string) || null

  await prisma.councilMeeting.update({
    where: { id },
    data: {
      title,
      meetingType,
      meetingDate: new Date(meetingDateRaw),
      startTime,
      endTime,
      location,
      status,
      chairId: chairId || null,
      minuteTakerId: minuteTakerId || null,
      agenda,
      minutes,
      summary,
    },
  })

  revalidatePath(`/council/meetings/${id}`)
  revalidatePath('/council/meetings')
  redirect(`/council/meetings/${id}`)
}

export async function approveMeetingMinutes(id: string) {
  await requireCouncilAccess()

  await prisma.councilMeeting.update({
    where: { id },
    data: { approved: true, approvedAt: new Date() },
  })

  revalidatePath(`/council/meetings/${id}`)
}

export async function deleteMeeting(id: string) {
  await requireCouncilAccess()

  await prisma.councilMeeting.delete({ where: { id } })

  revalidatePath('/council/meetings')
  revalidatePath('/council/dashboard')
  redirect('/council/meetings')
}
