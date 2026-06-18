import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { FormField, SelectField, SubmitButton } from '@/components/council/ui/FormField'

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer not to say', label: 'Prefer not to say' },
]
import { createClubMember } from '@/lib/actions/membership'

export const metadata: Metadata = { title: 'Add Member' }

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 80 }, (_, i) => {
  const y = CURRENT_YEAR - 10 - i
  return { value: String(y), label: String(y) }
})

export default function NewMemberPage() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <PageHeader title="Add Member" description="Add a single club member to the register." />

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <form action={createClubMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First name" name="first_name" required placeholder="First name" />
            <FormField label="Last name" name="last_name" required placeholder="Last name" />
          </div>
          <FormField label="Email" name="email" type="email" placeholder="member@example.com" />
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Gender"
              name="gender"
              options={GENDER_OPTIONS}
              placeholder="Select gender"
            />
            <FormField label="Postcode" name="postcode" placeholder="BT20 4AB" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Year of birth"
              name="year_of_birth"
              options={YEAR_OPTIONS}
              placeholder="Select year"
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="is_rookie" className="rounded border-slate-300" />
              Rookie
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="is_umpire" className="rounded border-slate-300" />
              Umpire
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <SubmitButton label="Add Member" />
            <Link
              href="/council/membership"
              className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
