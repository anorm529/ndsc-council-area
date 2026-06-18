'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'

export async function createFinanceItem(formData: FormData) {
  await requireCouncilAccess()

  const title = formData.get('title') as string
  const itemType = formData.get('item_type') as string
  const amountRaw = formData.get('amount') as string
  const itemDateRaw = formData.get('item_date') as string
  const category = (formData.get('category') as string) || null
  const status = (formData.get('status') as string) || 'pending'
  const description = (formData.get('description') as string) || null
  const notes = (formData.get('notes') as string) || null
  const submittedById = (formData.get('submitted_by_id') as string) || null
  const receiptUrl = (formData.get('receipt_url') as string) || null

  if (!title || !itemType || !amountRaw || !itemDateRaw) {
    throw new Error('Required fields missing')
  }

  await prisma.councilFinanceItem.create({
    data: {
      title,
      itemType,
      amount: parseFloat(amountRaw),
      itemDate: new Date(itemDateRaw),
      category,
      status,
      description,
      notes,
      submittedById: submittedById || null,
      receiptUrl,
    },
  })

  revalidatePath('/council/finance')
  revalidatePath('/council/dashboard')
  redirect('/council/finance')
}

export async function updateFinanceStatus(id: string, status: string, approvedById: string) {
  await requireCouncilAccess()

  await prisma.councilFinanceItem.update({
    where: { id },
    data: {
      status,
      approvedById: approvedById || null,
    },
  })

  revalidatePath('/council/finance')
}
