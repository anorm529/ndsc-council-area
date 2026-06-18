const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700 font-semibold',
}

export function PriorityBadge({ priority }: { priority: string }) {
  const style = PRIORITY_STYLES[priority] ?? 'bg-slate-100 text-slate-600'
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs capitalize ${style}`}
    >
      {priority === 'urgent' && <span className="mr-1">!</span>}
      {priority}
    </span>
  )
}
