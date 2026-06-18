'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'

export async function createEvent(formData: FormData) {
  await requireCouncilAccess()

  const title = formData.get('title') as string
  const eventType = (formData.get('event_type') as string) || null
  const eventDateRaw = (formData.get('event_date') as string) || null
  const startTime = (formData.get('start_time') as string) || null
  const endTime = (formData.get('end_time') as string) || null
  const location = (formData.get('location') as string) || null
  const leadId = (formData.get('lead_id') as string) || null
  const status = (formData.get('status') as string) || 'idea'
  const budgetRaw = (formData.get('budget') as string) || null
  const description = (formData.get('description') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!title) throw new Error('Title is required')

  const event = await prisma.councilEvent.create({
    data: {
      title,
      eventType,
      eventDate: eventDateRaw ? new Date(eventDateRaw) : null,
      startTime,
      endTime,
      location,
      leadId: leadId || null,
      status,
      budget: budgetRaw ? parseFloat(budgetRaw) : null,
      description,
      notes,
    },
  })

  revalidatePath('/council/events')
  revalidatePath('/council/dashboard')
  redirect(`/council/events/${event.id}`)
}

export async function createEventTask(eventId: string, formData: FormData) {
  await requireCouncilAccess()

  const title = formData.get('title') as string
  const ownerId = (formData.get('owner_id') as string) || null
  const priority = (formData.get('priority') as string) || 'medium'
  const status = (formData.get('status') as string) || 'not_started'
  const dueDateRaw = (formData.get('due_date') as string) || null
  const description = (formData.get('description') as string) || null

  if (!title) throw new Error('Title is required')

  await prisma.councilEventTask.create({
    data: {
      eventId,
      title,
      ownerId: ownerId || null,
      priority,
      status,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      description,
    },
  })

  revalidatePath(`/council/events/${eventId}`)
}

export async function updateEventTaskStatus(taskId: string, status: string, eventId: string) {
  await requireCouncilAccess()

  await prisma.councilEventTask.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === 'complete' ? new Date() : null,
    },
  })

  revalidatePath(`/council/events/${eventId}`)
}
