'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Top bar for mobile */}
      <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 text-white border-b border-slate-700">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md hover:bg-slate-700"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <span className="text-sm font-semibold">NDSC Council Hub</span>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>
    </>
  )
}
