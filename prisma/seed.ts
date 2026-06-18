/**
 * Seed script for NDSC Council Hub.
 *
 * Run with: npx tsx prisma/seed.ts
 *
 * This populates the database with realistic sample data for development.
 * Do NOT run this in production.
 */

import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding NDSC Council Hub...')

  // Council members
  const chair = await prisma.councilMember.upsert({
    where: { id: 'seed-member-chair' },
    update: {},
    create: {
      id: 'seed-member-chair',
      name: 'Sarah Mitchell',
      email: 'sarah@northdownsoftballclub.co.uk',
      role: 'chair',
      isActive: true,
    },
  })

  const secretary = await prisma.councilMember.upsert({
    where: { id: 'seed-member-secretary' },
    update: {},
    create: {
      id: 'seed-member-secretary',
      name: 'James O\'Brien',
      email: 'james@northdownsoftballclub.co.uk',
      role: 'secretary',
      isActive: true,
    },
  })

  const treasurer = await prisma.councilMember.upsert({
    where: { id: 'seed-member-treasurer' },
    update: {},
    create: {
      id: 'seed-member-treasurer',
      name: 'Emma Thompson',
      email: 'emma@northdownsoftballclub.co.uk',
      role: 'treasurer',
      isActive: true,
    },
  })

  const welfareOfficer = await prisma.councilMember.upsert({
    where: { id: 'seed-member-welfare' },
    update: {},
    create: {
      id: 'seed-member-welfare',
      name: 'Dr. Kevin Walsh',
      email: 'kevin@northdownsoftballclub.co.uk',
      role: 'welfare_officer',
      isActive: true,
    },
  })

  const captainBucc = await prisma.councilMember.upsert({
    where: { id: 'seed-member-captain-bucc' },
    update: {},
    create: {
      id: 'seed-member-captain-bucc',
      name: 'Tony Gallagher',
      email: 'tony@northdownsoftballclub.co.uk',
      role: 'captain',
      isActive: true,
    },
  })

  const captainBarr = await prisma.councilMember.upsert({
    where: { id: 'seed-member-captain-barr' },
    update: {},
    create: {
      id: 'seed-member-captain-barr',
      name: 'Lisa Chen',
      email: 'lisa@northdownsoftballclub.co.uk',
      role: 'captain',
      isActive: true,
    },
  })

  console.log('✓ Council members created')

  // Meeting
  const meeting = await prisma.councilMeeting.upsert({
    where: { id: 'seed-meeting-june' },
    update: {},
    create: {
      id: 'seed-meeting-june',
      title: 'June Council Meeting',
      meetingType: 'council',
      meetingDate: new Date('2025-06-10'),
      startTime: '19:00',
      endTime: '21:00',
      location: 'Bangor Sportsplex, Meeting Room 2',
      status: 'scheduled',
      chairId: chair.id,
      minuteTakerId: secretary.id,
      agenda: `1. Apologies\n2. Minutes from previous meeting\n3. Chair's report\n4. Treasurer's report\n5. Team captain reports\n6. Tournament planning update\n7. Grants update\n8. AOB`,
    },
  })

  console.log('✓ Meeting created')

  // Actions
  await prisma.councilAction.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-action-1',
        title: 'Renew club insurance policy',
        description: 'Annual renewal due. Get 3 quotes and present to council.',
        ownerId: chair.id,
        relatedMeetingId: meeting.id,
        category: 'governance',
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date('2025-07-01'),
      },
      {
        id: 'seed-action-2',
        title: 'Purchase new batting helmets',
        description: 'Order 4 adult batting helmets. Budget approved at last meeting.',
        ownerId: captainBucc.id,
        relatedMeetingId: meeting.id,
        category: 'equipment',
        priority: 'medium',
        status: 'not_started',
        dueDate: new Date('2025-06-30'),
      },
      {
        id: 'seed-action-3',
        title: 'Submit Sport NI small grant application',
        description: 'Complete and submit the application form.',
        ownerId: secretary.id,
        relatedMeetingId: meeting.id,
        category: 'sponsorship',
        priority: 'urgent',
        status: 'in_progress',
        dueDate: new Date('2025-06-15'),
      },
      {
        id: 'seed-action-4',
        title: 'Update club constitution',
        description: 'Review and update to reflect 2025 structure changes.',
        ownerId: chair.id,
        category: 'governance',
        priority: 'low',
        status: 'not_started',
        dueDate: new Date('2025-09-01'),
      },
    ],
  })

  console.log('✓ Actions created')

  // Decisions
  await prisma.councilDecision.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-decision-1',
        title: 'Approve 2025-26 club membership fee increase',
        decisionDate: new Date('2025-04-15'),
        description: 'Membership fees to increase by £5 per player for 2025-26 season.',
        rationale: 'Cover increased venue costs and equipment replacement budget.',
        status: 'approved',
        voteFor: 8,
        voteAgainst: 1,
        voteAbstain: 0,
        relatedMeetingId: meeting.id,
        proposedById: treasurer.id,
      },
      {
        id: 'seed-decision-2',
        title: 'Host annual Try Softball Day in August',
        decisionDate: new Date('2025-04-15'),
        description: 'Organise a public Try Softball day to recruit new members.',
        status: 'approved',
        voteFor: 9,
        voteAgainst: 0,
        voteAbstain: 0,
        relatedMeetingId: meeting.id,
        proposedById: captainBucc.id,
      },
    ],
  })

  console.log('✓ Decisions created')

  // Finance items
  await prisma.councilFinanceItem.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-finance-1',
        title: 'Venue hire – Spring season',
        itemType: 'expense',
        amount: 480,
        itemDate: new Date('2025-04-01'),
        category: 'venue',
        status: 'paid',
        submittedById: treasurer.id,
      },
      {
        id: 'seed-finance-2',
        title: 'Sport NI grant',
        itemType: 'grant_income',
        amount: 2000,
        itemDate: new Date('2025-05-15'),
        category: 'grant',
        status: 'received',
        submittedById: secretary.id,
      },
      {
        id: 'seed-finance-3',
        title: 'Summer kit order – Buccaneers',
        itemType: 'expense',
        amount: 340,
        itemDate: new Date('2025-05-20'),
        category: 'equipment',
        status: 'approved',
        submittedById: captainBucc.id,
        approvedById: treasurer.id,
      },
    ],
  })

  console.log('✓ Finance items created')

  // Equipment
  await prisma.councilEquipment.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-equip-1',
        itemName: 'Softball bats (aluminium)',
        category: 'bats',
        quantity: 6,
        condition: 'good',
        teamSlug: 'buccaneers',
        storageLocation: 'Equipment shed',
      },
      {
        id: 'seed-equip-2',
        itemName: 'Softballs (yellow 12" match)',
        category: 'balls',
        quantity: 24,
        condition: 'fair',
        storageLocation: 'Equipment shed',
      },
      {
        id: 'seed-equip-3',
        itemName: 'Rubber bases (set)',
        category: 'bases',
        quantity: 4,
        condition: 'good',
        storageLocation: 'Equipment shed',
      },
      {
        id: 'seed-equip-4',
        itemName: 'Batting tees',
        category: 'tees',
        quantity: 2,
        condition: 'poor',
        replacementNeeded: true,
        storageLocation: 'Equipment shed',
      },
    ],
  })

  console.log('✓ Equipment created')

  // Membership snapshot
  await prisma.councilMembershipSnapshot.upsert({
    where: { id: 'seed-snapshot-1' },
    update: {},
    create: {
      id: 'seed-snapshot-1',
      snapshotDate: new Date('2025-06-01'),
      totalMembers: 52,
      maleMembers: 28,
      femaleMembers: 24,
      rookies: 8,
      paidMembers: 47,
      unpaidMembers: 5,
      activePlayers: 48,
      inactivePlayers: 4,
      notes: 'Start of summer season count.',
    },
  })

  console.log('✓ Membership snapshot created')

  // Grant
  await prisma.councilGrant.upsert({
    where: { id: 'seed-grant-1' },
    update: {},
    create: {
      id: 'seed-grant-1',
      grantName: 'Sport NI Small Clubs Fund 2025',
      provider: 'Sport Northern Ireland',
      amountRequested: 3000,
      status: 'submitted',
      ownerId: secretary.id,
      purpose: 'Equipment purchase and facility improvements',
      deadline: new Date('2025-06-30'),
      submittedDate: new Date('2025-06-05'),
    },
  })

  console.log('✓ Grant created')

  // Document
  await prisma.councilDocument.upsert({
    where: { id: 'seed-doc-1' },
    update: {},
    create: {
      id: 'seed-doc-1',
      title: 'NDSC Club Constitution',
      documentType: 'constitution',
      version: '3.2',
      status: 'active',
      ownerId: chair.id,
      lastReviewed: new Date('2024-10-01'),
      nextReviewDate: new Date('2025-10-01'),
      summary: 'Official club constitution covering governance, membership, and elections.',
    },
  })

  await prisma.councilDocument.upsert({
    where: { id: 'seed-doc-2' },
    update: {},
    create: {
      id: 'seed-doc-2',
      title: 'Safeguarding Policy',
      documentType: 'policy',
      version: '2.0',
      status: 'active',
      ownerId: welfareOfficer.id,
      lastReviewed: new Date('2025-01-15'),
      nextReviewDate: new Date('2026-01-15'),
      summary: 'Club safeguarding and child protection policy.',
    },
  })

  console.log('✓ Documents created')

  console.log('\n✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
