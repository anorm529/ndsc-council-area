'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'

export async function createCommunication(formData: FormData) {
  await requireCouncilAccess()

  const title = formData.get('title') as string
  const channel = (formData.get('channel') as string) || null
  const contentType = (formData.get('content_type') as string) || null
  const plannedDateRaw = (formData.get('planned_date') as string) || null
  const ownerId = (formData.get('owner_id') as string) || null
  const status = (formData.get('status') as string) || 'idea'
  const relatedTeamSlug = (formData.get('related_team_slug') as string) || null
  const relatedEventId = (formData.get('related_event_id') as string) || null
  const copy = (formData.get('copy') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!title) throw new Error('Title is required')

  await prisma.councilCommunication.create({
    data: {
      title,
      channel,
      contentType,
      plannedDate: plannedDateRaw ? new Date(plannedDateRaw) : null,
      ownerId: ownerId || null,
      status,
      relatedTeamSlug: relatedTeamSlug || null,
      relatedEventId: relatedEventId || null,
      copy,
      notes,
    },
  })

  revalidatePath('/council/communications')
  redirect('/council/communications')
}

export async function createDocument(formData: FormData) {
  await requireCouncilAccess()

  const title = formData.get('title') as string
  const documentType = (formData.get('document_type') as string) || null
  const version = (formData.get('version') as string) || null
  const documentUrl = (formData.get('document_url') as string) || null
  const ownerId = (formData.get('owner_id') as string) || null
  const status = (formData.get('status') as string) || 'draft'
  const lastReviewedRaw = (formData.get('last_reviewed') as string) || null
  const nextReviewDateRaw = (formData.get('next_review_date') as string) || null
  const summary = (formData.get('summary') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!title) throw new Error('Title is required')

  await prisma.councilDocument.create({
    data: {
      title,
      documentType,
      version,
      documentUrl,
      ownerId: ownerId || null,
      status,
      lastReviewed: lastReviewedRaw ? new Date(lastReviewedRaw) : null,
      nextReviewDate: nextReviewDateRaw ? new Date(nextReviewDateRaw) : null,
      summary,
      notes,
    },
  })

  revalidatePath('/council/documents')
  redirect('/council/documents')
}
