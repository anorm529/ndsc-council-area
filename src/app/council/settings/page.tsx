import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { canManageSettings } from '@/lib/permissions'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { createCouncilMember, deactivateCouncilMember } from '@/lib/actions/settings'
import { FormField, SelectField, SubmitButton } from '@/components/council/ui/FormField'
import { ConfirmButton } from '@/components/council/ui/ConfirmButton'

export const metadata: Metadata = { title: 'Settings' }

const ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'chair', label: 'Chair' },
  { value: 'vice_chair', label: 'Vice Chair' },
  { value: 'secretary', label: 'Secretary' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'media_officer', label: 'Media Officer' },
  { value: 'captain', label: 'Captain' },
  { value: 'welfare_officer', label: 'Welfare Officer' },
  { value: 'tournament_officer', label: 'Tournament Officer' },
  { value: 'council_member', label: 'Council Member' },
  { value: 'viewer', label: 'Viewer' },
]

export default async function SettingsPage() {
  const user = await getCurrentUser()

  const members = await prisma.councilMember.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    include: { permissions: true },
  })

  const canManage = user && canManageSettings(user)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Settings"
        description="Council configuration and member management."
      />

      {/* Council members */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Council Members</h2>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Active</th>
                {canManage && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    No council members added yet.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const deactivate = deactivateCouncilMember.bind(null, m.id)
                  return (
                    <tr key={m.id} className={`hover:bg-slate-50 ${!m.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 font-medium text-slate-900">{m.name}</td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{m.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-slate-700">{m.role.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {m.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          {m.isActive && (
                            <ConfirmButton
                              action={deactivate}
                              message={`Deactivate ${m.name}?`}
                              label="Deactivate"
                              className="text-xs text-red-500 hover:underline"
                            />
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Add member form */}
        {canManage && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Add Council Member</h3>
            <form action={createCouncilMember} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Name" name="name" required placeholder="Full name" />
              <FormField label="Email" name="email" type="email" placeholder="email@example.com" />
              <SelectField
                label="Role"
                name="role"
                required
                options={ROLES}
                placeholder="Select role"
              />
              <div className="flex items-end">
                <SubmitButton label="Add Member" />
              </div>
            </form>
          </div>
        )}
      </section>

      {/* Auth connection info */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Authentication</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-sm text-blue-800">
          <p className="font-medium mb-2">Central login not yet connected</p>
          <p>
            The council hub uses a mock auth helper (<code className="bg-blue-100 px-1 rounded">getCurrentUser()</code>) that
            returns a hardcoded admin user. When the centralised login system is ready, replace
            this function in <code className="bg-blue-100 px-1 rounded">src/lib/auth.ts</code> with a real session lookup.
          </p>
          <p className="mt-2">
            Each <code className="bg-blue-100 px-1 rounded">CouncilMember</code> record has an{' '}
            <code className="bg-blue-100 px-1 rounded">external_user_id</code> field for linking to the central user DB.
            Use <code className="bg-blue-100 px-1 rounded">getCouncilMemberByExternalUserId()</code> to resolve the link.
          </p>
        </div>
      </section>

      {/* Permission model */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Permission Model</h2>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 text-sm text-slate-700">
          <p className="mb-3">Permissions are resolved in this order:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-600">
            <li>Explicit <code className="bg-slate-100 px-1 rounded">council_permissions</code> records for the member</li>
            <li>Role-based defaults (see <code className="bg-slate-100 px-1 rounded">src/lib/permissions.ts</code>)</li>
          </ol>
          <p className="mt-3 text-slate-500">
            Fine-grained permission overrides can be added to the <code className="bg-slate-100 px-1 rounded">council_permissions</code> table manually or via a future UI.
          </p>
        </div>
      </section>
    </div>
  )
}
