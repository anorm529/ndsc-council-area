import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createEquipmentItem } from '@/lib/actions/equipment'
import { FormField, SelectField, TextareaField, SubmitButton } from '@/components/council/ui/FormField'

export const metadata: Metadata = { title: 'Add Equipment' }

export default async function NewEquipmentPage() {
  const members = await prisma.councilMember.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/council/equipment" className="text-sm text-slate-500 hover:text-slate-700">← Back to equipment</Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">Add Equipment Item</h1>
      </div>

      <form action={createEquipmentItem} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Item name" name="item_name" required placeholder="e.g. Softball bats (set of 4)" />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Category"
            name="category"
            options={[
              { value: 'bats', label: 'Bats' },
              { value: 'balls', label: 'Balls' },
              { value: 'bases', label: 'Bases' },
              { value: 'tees', label: 'Tees' },
              { value: 'first_aid', label: 'First aid' },
              { value: 'catcher_gear', label: 'Catcher gear' },
              { value: 'team_bag', label: 'Team bag' },
              { value: 'storage', label: 'Storage' },
              { value: 'scoreboard', label: 'Scoreboard' },
              { value: 'clothing', label: 'Clothing' },
              { value: 'other', label: 'Other' },
            ]}
            placeholder="Select category"
          />
          <FormField label="Quantity" name="quantity" type="number" defaultValue="1" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Condition"
            name="condition"
            defaultValue="good"
            options={[
              { value: 'new', label: 'New' },
              { value: 'good', label: 'Good' },
              { value: 'fair', label: 'Fair' },
              { value: 'poor', label: 'Poor' },
              { value: 'needs_replacement', label: 'Needs replacement' },
              { value: 'retired', label: 'Retired' },
            ]}
          />
          <SelectField
            label="Team"
            name="team_slug"
            options={[
              { value: 'buccaneers', label: 'Buccaneers' },
              { value: 'barracudas', label: 'Barracudas' },
              { value: 'sluggers', label: 'Sluggers' },
            ]}
            placeholder="Not team-specific"
          />
        </div>

        <FormField label="Storage location" name="storage_location" placeholder="e.g. Equipment shed, Boot of kit car" />

        <SelectField
          label="Assigned to"
          name="assigned_to_id"
          options={members.map((m) => ({ value: m.id, label: m.name }))}
          placeholder="Not assigned"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Purchase date" name="purchase_date" type="date" />
          <FormField label="Purchase cost (£)" name="purchase_cost" type="number" placeholder="0.00" />
        </div>

        <FormField label="Supplier" name="supplier" placeholder="Where was this purchased?" />

        <SelectField
          label="Replacement needed?"
          name="replacement_needed"
          defaultValue="false"
          options={[
            { value: 'false', label: 'No' },
            { value: 'true', label: 'Yes – needs replacement' },
          ]}
        />

        <TextareaField label="Notes" name="notes" rows={2} />

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Add Item" />
          <Link href="/council/equipment" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
