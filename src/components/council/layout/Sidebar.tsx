'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_SECTIONS = [
  {
    items: [
      { href: '/council/dashboard', label: 'Dashboard', icon: 'grid' },
    ],
  },
  {
    heading: 'Governance',
    items: [
      { href: '/council/meetings', label: 'Meetings', icon: 'calendar' },
      { href: '/council/actions', label: 'Action Tracker', icon: 'check-circle' },
      { href: '/council/decisions', label: 'Decision Log', icon: 'gavel' },
      { href: '/council/reports', label: 'Officer Reports', icon: 'file-text' },
    ],
  },
  {
    heading: 'Club',
    items: [
      { href: '/council/finance', label: 'Finance', icon: 'pound' },
      { href: '/council/membership', label: 'Membership', icon: 'users' },
      { href: '/council/teams', label: 'Team Reports', icon: 'shield' },
      { href: '/council/welfare', label: 'Welfare', icon: 'heart' },
      { href: '/council/equipment', label: 'Equipment', icon: 'tool' },
    ],
  },
  {
    heading: 'Planning',
    items: [
      { href: '/council/events', label: 'Events', icon: 'star' },
      { href: '/council/grants', label: 'Grants', icon: 'award' },
      { href: '/council/sponsorship', label: 'Sponsorship', icon: 'briefcase' },
      { href: '/council/communications', label: 'Communications', icon: 'megaphone' },
    ],
  },
  {
    heading: 'Resources',
    items: [
      { href: '/council/documents', label: 'Documents', icon: 'folder' },
      { href: '/council/settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

const ICONS: Record<string, React.ReactNode> = {
  grid: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2"/>
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2"/>
      <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2"/>
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/>
      <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'check-circle': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" strokeWidth="2"/>
      <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  gavel: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M3 21l9-9M13.5 7.5l3-3M5 5l9 9M15 3l6 6-1.5 1.5-6-6L15 3zM3 21l1.5-1.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'file-text': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" strokeWidth="2"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  pound: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M6 18h12M12 6c-2.2 0-4 1.8-4 4v8M8 12h6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 6c1.1 0 2 .9 2 2" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  users: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="2"/>
      <circle cx="9" cy="7" r="4" strokeWidth="2"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeWidth="2"/>
    </svg>
  ),
  shield: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2"/>
    </svg>
  ),
  heart: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeWidth="2"/>
    </svg>
  ),
  tool: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeWidth="2"/>
    </svg>
  ),
  star: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2"/>
    </svg>
  ),
  award: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="6" strokeWidth="2"/>
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" strokeWidth="2"/>
    </svg>
  ),
  briefcase: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="2" strokeWidth="2"/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeWidth="2"/>
    </svg>
  ),
  megaphone: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M3 11l19-9-9 19-2-8-8-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  folder: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" strokeWidth="2"/>
    </svg>
  ),
  settings: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" strokeWidth="2"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeWidth="2"/>
    </svg>
  ),
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/council/dashboard') return pathname === '/council/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold">
          NC
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">NDSC Council Hub</div>
          <div className="text-xs text-slate-400">North Down Softball Club</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto flex-shrink-0 p-1 rounded hover:bg-slate-700 lg:hidden"
            aria-label="Close menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_SECTIONS.map((section, i) => (
          <div key={i} className="mb-4">
            {section.heading && (
              <div className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {section.heading}
              </div>
            )}
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors mb-0.5 ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex-shrink-0">{ICONS[item.icon]}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700">
        <div className="text-xs text-slate-500">Council Member</div>
        <div className="text-sm text-slate-300 font-medium">Council Admin</div>
      </div>
    </div>
  )
}
