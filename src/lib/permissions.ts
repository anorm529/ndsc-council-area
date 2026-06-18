import type { CouncilUser } from '@/lib/auth'

export const OWNER_ROLES = ['owner', 'chair'] as const

export const PERMISSION_KEYS = [
  'meetings:view',
  'meetings:edit',
  'actions:view',
  'actions:edit',
  'decisions:view',
  'decisions:edit',
  'finance:view',
  'finance:edit',
  'welfare:view',
  'welfare:edit',
  'documents:view',
  'documents:edit',
  'equipment:view',
  'equipment:edit',
  'communications:view',
  'communications:edit',
  'settings:manage',
] as const

export type PermissionKey = (typeof PERMISSION_KEYS)[number]

/** Role-based default permissions. Applied when no explicit permission record exists. */
const ROLE_DEFAULT_PERMISSIONS: Record<string, PermissionKey[]> = {
  owner: PERMISSION_KEYS as unknown as PermissionKey[],
  chair: PERMISSION_KEYS as unknown as PermissionKey[],
  vice_chair: [
    'meetings:view', 'meetings:edit',
    'actions:view', 'actions:edit',
    'decisions:view', 'decisions:edit',
    'finance:view',
    'welfare:view',
    'documents:view', 'documents:edit',
    'equipment:view',
    'communications:view', 'communications:edit',
  ],
  secretary: [
    'meetings:view', 'meetings:edit',
    'actions:view', 'actions:edit',
    'decisions:view', 'decisions:edit',
    'documents:view', 'documents:edit',
    'communications:view', 'communications:edit',
  ],
  treasurer: [
    'meetings:view',
    'actions:view',
    'decisions:view',
    'finance:view', 'finance:edit',
    'documents:view',
  ],
  media_officer: [
    'meetings:view',
    'communications:view', 'communications:edit',
    'documents:view',
  ],
  captain: [
    'meetings:view',
    'actions:view',
    'documents:view',
    'equipment:view',
  ],
  welfare_officer: [
    'meetings:view',
    'actions:view',
    'welfare:view', 'welfare:edit',
    'documents:view',
  ],
  tournament_officer: [
    'meetings:view',
    'actions:view',
    'documents:view',
    'equipment:view',
  ],
  council_member: [
    'meetings:view',
    'actions:view',
    'decisions:view',
    'documents:view',
  ],
  viewer: [
    'meetings:view',
    'decisions:view',
    'documents:view',
  ],
}

/**
 * Returns true if the user has the given permission.
 * Explicit permission records (from council_permissions table) take precedence.
 * Falls back to role-based defaults.
 */
export function hasCouncilPermission(
  user: CouncilUser,
  permission: PermissionKey
): boolean {
  // Explicit permission record overrides role defaults
  if (user.permissions.includes(permission)) return true

  // Owners always have all permissions
  if (OWNER_ROLES.includes(user.role as (typeof OWNER_ROLES)[number])) {
    return true
  }

  const defaults = ROLE_DEFAULT_PERMISSIONS[user.role] ?? []
  return defaults.includes(permission)
}

export function canViewWelfare(user: CouncilUser): boolean {
  return hasCouncilPermission(user, 'welfare:view')
}

export function canEditWelfare(user: CouncilUser): boolean {
  return hasCouncilPermission(user, 'welfare:edit')
}

export function canViewFinance(user: CouncilUser): boolean {
  return hasCouncilPermission(user, 'finance:view')
}

export function canEditFinance(user: CouncilUser): boolean {
  return hasCouncilPermission(user, 'finance:edit')
}

export function canManageSettings(user: CouncilUser): boolean {
  return hasCouncilPermission(user, 'settings:manage')
}
