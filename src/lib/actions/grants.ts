'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCouncilAccess } from '@/lib/auth'

export async function createGrant(formData: FormData) {
  await requireCouncilAccess()

  const grantName = formData.get('grant_name') as string
  const provider = (formData.get('provider') as string) || null
  const amountRequestedRaw = (formData.get('amount_requested') as string) || null
  const amountAwardedRaw = (formData.get('amount_awarded') as string) || null
  const deadlineRaw = (formData.get('deadline') as string) || null
  const submittedDateRaw = (formData.get('submitted_date') as string) || null
  const outcomeDateRaw = (formData.get('outcome_date') as string) || null
  const status = (formData.get('status') as string) || 'researching'
  const ownerId = (formData.get('owner_id') as string) || null
  const purpose = (formData.get('purpose') as string) || null
  const requiredDocuments = (formData.get('required_documents') as string) || null
  const reportingDeadlineRaw = (formData.get('reporting_deadline') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!grantName) throw new Error('Grant name is required')

  await prisma.councilGrant.create({
    data: {
      grantName,
      provider,
      amountRequested: amountRequestedRaw ? parseFloat(amountRequestedRaw) : null,
      amountAwarded: amountAwardedRaw ? parseFloat(amountAwardedRaw) : null,
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      submittedDate: submittedDateRaw ? new Date(submittedDateRaw) : null,
      outcomeDate: outcomeDateRaw ? new Date(outcomeDateRaw) : null,
      status,
      ownerId: ownerId || null,
      purpose,
      requiredDocuments,
      reportingDeadline: reportingDeadlineRaw ? new Date(reportingDeadlineRaw) : null,
      notes,
    },
  })

  revalidatePath('/council/grants')
  redirect('/council/grants')
}

export async function createSponsorship(formData: FormData) {
  await requireCouncilAccess()

  const sponsorName = formData.get('sponsor_name') as string
  const contactName = (formData.get('contact_name') as string) || null
  const contactEmail = (formData.get('contact_email') as string) || null
  const packageName = (formData.get('package_name') as string) || null
  const valueRaw = (formData.get('value') as string) || null
  const startDateRaw = (formData.get('start_date') as string) || null
  const endDateRaw = (formData.get('end_date') as string) || null
  const renewalDateRaw = (formData.get('renewal_date') as string) || null
  const invoiceStatus = (formData.get('invoice_status') as string) || null
  const deliverables = (formData.get('deliverables') as string) || null
  const status = (formData.get('status') as string) || 'prospect'
  const ownerId = (formData.get('owner_id') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!sponsorName) throw new Error('Sponsor name is required')

  await prisma.councilSponsorship.create({
    data: {
      sponsorName,
      contactName,
      contactEmail,
      packageName,
      value: valueRaw ? parseFloat(valueRaw) : null,
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      endDate: endDateRaw ? new Date(endDateRaw) : null,
      renewalDate: renewalDateRaw ? new Date(renewalDateRaw) : null,
      invoiceStatus,
      deliverables,
      status,
      ownerId: ownerId || null,
      notes,
    },
  })

  revalidatePath('/council/sponsorship')
  redirect('/council/sponsorship')
}
