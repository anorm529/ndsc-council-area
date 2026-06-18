'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'

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
