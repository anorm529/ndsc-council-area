'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'
import { canManageSettings } from '@/lib/permissions'

export async function createCouncilMember(formData: FormData) {
  const user = await requireCouncilAccess()
  if (!canManageSettings(user)) throw new Error('Settings access required')

  const name = formData.get('name') as string
  const email = (formData.get('email') as string) || null
  const role = formData.get('role') as string
  const isActive = formData.get('is_active') !== 'false'
  const notes = (formData.get('notes') as string) || null

  if (!name || !role) throw new Error('Name and role are required')

  await prisma.councilMember.create({
    data: {
      name,
      email,
      role,
      isActive,
      notes,
    },
  })

  revalidatePath('/council/settings')
  redirect('/council/settings')
}

export async function updateCouncilMember(id: string, formData: FormData) {
  const user = await requireCouncilAccess()
  if (!canManageSettings(user)) throw new Error('Settings access required')

  const name = formData.get('name') as string
  const email = (formData.get('email') as string) || null
  const role = formData.get('role') as string
  const isActive = formData.get('is_active') !== 'false'
  const notes = (formData.get('notes') as string) || null

  await prisma.councilMember.update({
    where: { id },
    data: { name, email, role, isActive, notes },
  })

  revalidatePath('/council/settings')
  redirect('/council/settings')
}

export async function deactivateCouncilMember(id: string) {
  const user = await requireCouncilAccess()
  if (!canManageSettings(user)) throw new Error('Settings access required')

  await prisma.councilMember.update({
    where: { id },
    data: { isActive: false },
  })

  revalidatePath('/council/settings')
}
