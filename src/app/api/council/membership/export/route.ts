import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const members = await prisma.clubMember.findMany({
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })

  const headers = ['first_name', 'last_name', 'email', 'gender', 'year_of_birth', 'postcode', 'is_rookie', 'is_umpire', 'is_active']

  const rows = members.map((m) => [
    csvEscape(m.firstName),
    csvEscape(m.lastName),
    csvEscape(m.email ?? ''),
    csvEscape(m.gender ?? ''),
    csvEscape(m.yearOfBirth != null ? String(m.yearOfBirth) : ''),
    csvEscape(m.postcode ?? ''),
    m.isRookie ? 'true' : 'false',
    m.isUmpire ? 'true' : 'false',
    m.isActive ? 'true' : 'false',
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')

  const date = new Date().toISOString().split('T')[0]
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ndsc-members-${date}.csv"`,
    },
  })
}

function csvEscape(val: string): string {
  if (/[",\r\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`
  return val
}
