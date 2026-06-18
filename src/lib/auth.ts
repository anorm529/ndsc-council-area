/**
 * Auth helpers for the NDSC Council Hub.
 *
 * These are mock implementations designed to be replaced when the centralised
 * login system is connected. Replace getCurrentUser() with a real session
 * lookup (e.g. using next-auth or a JWT cookie check against the central DB).
 *
 * The central login will eventually supply:
 *   userId, email, name, role, linkedPlayerId, councilPermissions, isAdmin
 */

import { prisma } from '@/lib/prisma'

export type CouncilUser = {
  id: string
  externalUserId: string | null
  name: string
  email: string | null
  role: string
  isActive: boolean
  permissions: string[]
}

/**
 * Returns the currently authenticated council user.
 *
 * MOCK: Always returns a hardcoded owner user for development.
 * Replace this with a real session lookup when auth is connected.
 */
export async function getCurrentUser(): Promise<CouncilUser | null> {
  // TODO: Replace with real session lookup from centralised auth
  // e.g. const session = await getServerSession(authOptions)
  //      if (!session?.user?.externalId) return null
  //      return getCouncilMemberByExternalUserId(session.user.externalId)

  // For now, return a mock admin user so the hub is usable
  return {
    id: 'mock-owner-id',
    externalUserId: null,
    name: 'Council Admin',
    email: 'admin@northdownsoftballclub.co.uk',
    role: 'owner',
    isActive: true,
    permissions: [
      'meetings:view', 'meetings:edit',
      'actions:view', 'actions:edit',
      'decisions:view', 'decisions:edit',
      'finance:view', 'finance:edit',
      'welfare:view', 'welfare:edit',
      'documents:view', 'documents:edit',
      'equipment:view', 'equipment:edit',
      'communications:view', 'communications:edit',
      'settings:manage',
    ],
  }
}

/**
 * Looks up a CouncilMember by their external (central login) user ID.
 * Call this after authenticating via the centralised login to get
 * the council-specific user record.
 */
export async function getCouncilMemberByExternalUserId(
  externalUserId: string
): Promise<CouncilUser | null> {
  const member = await prisma.councilMember.findFirst({
    where: { externalUserId, isActive: true },
    include: { permissions: true },
  })

  if (!member) return null

  return {
    id: member.id,
    externalUserId: member.externalUserId,
    name: member.name,
    email: member.email,
    role: member.role,
    isActive: member.isActive,
    permissions: member.permissions
      .filter((p) => p.granted)
      .map((p) => p.permissionKey),
  }
}

/**
 * Throws if no authenticated user is found.
 * Use at the top of server actions and protected API routes.
 */
export async function requireCouncilAccess(): Promise<CouncilUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorised: council access required')
  }
  return user
}
