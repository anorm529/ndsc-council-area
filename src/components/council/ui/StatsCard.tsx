interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: 'default' | 'green' | 'red' | 'amber' | 'blue'
}

const ACCENT_STYLES = {
  default: 'border-l-slate-400',
  green: 'border-l-green-500',
  red: 'border-l-red-500',
  amber: 'border-l-amber-400',
  blue: 'border-l-blue-500',
}

export function StatsCard({ label, value, sub, accent = 'default' }: StatsCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-4 border-l-4 ${ACCENT_STYLES[accent]}`}>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}
