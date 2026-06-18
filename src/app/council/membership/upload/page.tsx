import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/council/ui/PageHeader'
import { SubmitButton } from '@/components/council/ui/FormField'
import { importClubMembers } from '@/lib/actions/membership'

export const metadata: Metadata = { title: 'Upload Members CSV' }

export default function UploadMembersPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader
        title="Upload Members CSV"
        description="Import club members from a CSV file."
      />

      {/* Format guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
        <p className="font-medium mb-2">Expected CSV headers</p>
        <code className="block bg-blue-100 rounded px-3 py-2 text-xs font-mono break-all">
          first_name,last_name,email,gender,year_of_birth,postcode,is_rookie,is_umpire
        </code>
        <ul className="mt-3 space-y-1 text-xs text-blue-700 list-disc list-inside">
          <li><strong>first_name</strong> and <strong>last_name</strong> are required; all other columns are optional</li>
          <li><strong>is_rookie</strong> / <strong>is_umpire</strong> — use <code>true</code>, <code>yes</code>, or <code>1</code> for yes</li>
          <li><strong>year_of_birth</strong> — four-digit year, e.g. <code>1990</code></li>
          <li>Column names are case-insensitive; common variants are also accepted</li>
          <li>You can download the current member list as a template using the button on the membership page</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <form action={importClubMembers} className="space-y-5" encType="multipart/form-data">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              CSV file <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="csv_file"
              accept=".csv,text/csv"
              required
              className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-slate-300 file:text-sm file:bg-white file:text-slate-700 hover:file:bg-slate-50"
            />
          </div>

          <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="replace_all" className="mt-0.5 rounded border-slate-300" />
              <div>
                <span className="text-sm font-medium text-amber-900">Replace all existing members</span>
                <p className="text-xs text-amber-700 mt-0.5">
                  If checked, <strong>all existing member records will be deleted</strong> before importing.
                  Use this when re-uploading a corrected full list. If unchecked, the uploaded members
                  are appended to existing records.
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-1">
            <SubmitButton label="Import Members" />
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
