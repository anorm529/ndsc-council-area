'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'

export async function createDecision(formData: FormData) {
  await requireCouncilAccess()

  const title = formData.get('title') as string
  const decisionDateRaw = formData.get('decision_date') as string
  const description = (formData.get('description') as string) || null
  const rationale = (formData.get('rationale') as string) || null
  const outcome = (formData.get('outcome') as string) || null
  const relatedMeetingId = (formData.get('related_meeting_id') as string) || null
  const proposedById = (formData.get('proposed_by_id') as string) || null
  const status = (formData.get('status') as string) || 'proposed'
  const voteForRaw = formData.get('vote_for') as string
  const voteAgainstRaw = formData.get('vote_against') as string
  const voteAbstainRaw = formData.get('vote_abstain') as string

  if (!title || !decisionDateRaw) throw new Error('Title and date are required')

  await prisma.councilDecision.create({
    data: {
      title,
      decisionDate: new Date(decisionDateRaw),
      description,
      rationale,
      outcome,
      relatedMeetingId: relatedMeetingId || null,
      proposedById: proposedById || null,
      status,
      voteFor: voteForRaw ? parseInt(voteForRaw) : null,
      voteAgainst: voteAgainstRaw ? parseInt(voteAgainstRaw) : null,
      voteAbstain: voteAbstainRaw ? parseInt(voteAbstainRaw) : null,
    },
  })

  revalidatePath('/council/decisions')
  revalidatePath('/council/dashboard')
  redirect('/council/decisions')
}

export async function updateDecision(id: string, formData: FormData) {
  await requireCouncilAccess()

  const title = formData.get('title') as string
  const decisionDateRaw = formData.get('decision_date') as string
  const description = (formData.get('description') as string) || null
  const rationale = (formData.get('rationale') as string) || null
  const outcome = (formData.get('outcome') as string) || null
  const relatedMeetingId = (formData.get('related_meeting_id') as string) || null
  const proposedById = (formData.get('proposed_by_id') as string) || null
  const status = (formData.get('status') as string) || 'proposed'
  const voteForRaw = formData.get('vote_for') as string
  const voteAgainstRaw = formData.get('vote_against') as string
  const voteAbstainRaw = formData.get('vote_abstain') as string

  await prisma.councilDecision.update({
    where: { id },
    data: {
      title,
      decisionDate: new Date(decisionDateRaw),
      description,
      rationale,
      outcome,
      relatedMeetingId: relatedMeetingId || null,
      proposedById: proposedById || null,
      status,
      voteFor: voteForRaw ? parseInt(voteForRaw) : null,
      voteAgainst: voteAgainstRaw ? parseInt(voteAgainstRaw) : null,
      voteAbstain: voteAbstainRaw ? parseInt(voteAbstainRaw) : null,
    },
  })

  revalidatePath('/council/decisions')
  redirect('/council/decisions')
}
