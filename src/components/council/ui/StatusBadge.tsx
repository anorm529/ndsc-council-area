const STATUS_STYLES: Record<string, string> = {
  // Meeting
  draft: 'bg-slate-100 text-slate-700',
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  // Action
  not_started: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-800',
  blocked: 'bg-red-100 text-red-700',
  complete: 'bg-green-100 text-green-800',
  deferred: 'bg-yellow-100 text-yellow-800',
  // Decision
  proposed: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  superseded: 'bg-slate-100 text-slate-600',
  // Report
  submitted: 'bg-blue-100 text-blue-800',
  reviewed: 'bg-green-100 text-green-800',
  archived: 'bg-slate-100 text-slate-600',
  // Finance
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  received: 'bg-green-100 text-green-800',
  // Welfare
  open: 'bg-red-100 text-red-700',
  under_review: 'bg-yellow-100 text-yellow-800',
  action_required: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-slate-100 text-slate-600',
  // Equipment condition
  new: 'bg-green-100 text-green-800',
  good: 'bg-green-100 text-green-700',
  fair: 'bg-yellow-100 text-yellow-700',
  poor: 'bg-orange-100 text-orange-700',
  needs_replacement: 'bg-red-100 text-red-700',
  retired: 'bg-slate-100 text-slate-600',
  // Event
  idea: 'bg-slate-100 text-slate-700',
  planning: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-800',
  live: 'bg-green-100 text-green-800',
  // Grant
  researching: 'bg-slate-100 text-slate-700',
  drafting: 'bg-blue-100 text-blue-700',
  awarded: 'bg-green-100 text-green-800',
  reporting_due: 'bg-orange-100 text-orange-800',
  // Sponsorship
  prospect: 'bg-slate-100 text-slate-700',
  contacted: 'bg-blue-100 text-blue-700',
  agreed: 'bg-indigo-100 text-indigo-800',
  active: 'bg-green-100 text-green-800',
  renewal_due: 'bg-yellow-100 text-yellow-800',
  ended: 'bg-slate-100 text-slate-600',
  // Communications
  published: 'bg-green-100 text-green-800',
  // Main DB reconciliation
  linked: 'bg-green-100 text-green-800',
  not_found: 'bg-red-100 text-red-700',
}

const LABEL_MAP: Record<string, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  action_required: 'Action required',
  under_review: 'Under review',
  needs_replacement: 'Needs replacement',
  reporting_due: 'Reporting due',
  renewal_due: 'Renewal due',
  not_found: 'Not in main DB',
}

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-700'
  const label = LABEL_MAP[status] ?? status.replace(/_/g, ' ')
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${style}`}
    >
      {label}
    </span>
  )
}
