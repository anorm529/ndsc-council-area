'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'

export async function createEquipmentItem(formData: FormData) {
  await requireCouncilAccess()

  const itemName = formData.get('item_name') as string
  const category = (formData.get('category') as string) || null
  const quantityRaw = (formData.get('quantity') as string) || '1'
  const condition = (formData.get('condition') as string) || null
  const assignedToId = (formData.get('assigned_to_id') as string) || null
  const teamSlug = (formData.get('team_slug') as string) || null
  const storageLocation = (formData.get('storage_location') as string) || null
  const purchaseDateRaw = (formData.get('purchase_date') as string) || null
  const purchaseCostRaw = (formData.get('purchase_cost') as string) || null
  const supplier = (formData.get('supplier') as string) || null
  const replacementNeeded = formData.get('replacement_needed') === 'true'
  const notes = (formData.get('notes') as string) || null

  if (!itemName) throw new Error('Item name is required')

  await prisma.councilEquipment.create({
    data: {
      itemName,
      category,
      quantity: parseInt(quantityRaw),
      condition,
      assignedToId: assignedToId || null,
      teamSlug: teamSlug || null,
      storageLocation,
      purchaseDate: purchaseDateRaw ? new Date(purchaseDateRaw) : null,
      purchaseCost: purchaseCostRaw ? parseFloat(purchaseCostRaw) : null,
      supplier,
      replacementNeeded,
      notes,
    },
  })

  revalidatePath('/council/equipment')
  redirect('/council/equipment')
}

export async function markEquipmentChecked(id: string) {
  await requireCouncilAccess()

  await prisma.councilEquipment.update({
    where: { id },
    data: { lastChecked: new Date() },
  })

  revalidatePath('/council/equipment')
}
