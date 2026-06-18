'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'

export async function createCouncilAction(formData: FormData) {
  await requireCouncilAccess()

  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const ownerId = (formData.get('owner_id') as string) || null
  const relatedMeetingId = (formData.get('related_meeting_id') as string) || null
  const category = (formData.get('category') as string) || null
  const priority = (formData.get('priority') as string) || 'medium'
  const status = (formData.get('status') as string) || 'not_started'
  const dueDateRaw = (formData.get('due_date') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!title) throw new Error('Title is required')

  await prisma.councilAction.create({
    data: {
      title,
      description,
      ownerId: ownerId || null,
      relatedMeetingId: relatedMeetingId || null,
      category,
      priority,
      status,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      notes,
    },
  })

  revalidatePath('/council/actions')
  revalidatePath('/council/dashboard')
  redirect('/council/actions')
}

export async function updateCouncilAction(id: string, formData: FormData) {
  await requireCouncilAccess()

  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const ownerId = (formData.get('owner_id') as string) || null
  const relatedMeetingId = (formData.get('related_meeting_id') as string) || null
  const category = (formData.get('category') as string) || null
  const priority = (formData.get('priority') as string) || 'medium'
  const status = (formData.get('status') as string) || 'not_started'
  const dueDateRaw = (formData.get('due_date') as string) || null
  const notes = (formData.get('notes') as string) || null

  const completedAt =
    status === 'complete' ? new Date() : null

  await prisma.councilAction.update({
    where: { id },
    data: {
      title,
      description,
      ownerId: ownerId || null,
      relatedMeetingId: relatedMeetingId || null,
      category,
      priority,
      status,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      notes,
      completedAt,
    },
  })

  revalidatePath('/council/actions')
  revalidatePath('/council/dashboard')
  redirect('/council/actions')
}

export async function markActionComplete(id: string) {
  await requireCouncilAccess()

  await prisma.councilAction.update({
    where: { id },
    data: { status: 'complete', completedAt: new Date() },
  })

  revalidatePath('/council/actions')
  revalidatePath('/council/dashboard')
}

export async function deleteCouncilAction(id: string) {
  await requireCouncilAccess()
  await prisma.councilAction.delete({ where: { id } })
  revalidatePath('/council/actions')
  revalidatePath('/council/dashboard')
  redirect('/council/actions')
}
