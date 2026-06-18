import type { Metadata } from 'next'
import { Sidebar } from '@/components/council/layout/Sidebar'
import { MobileNav } from '@/components/council/layout/MobileNav'

export const metadata: Metadata = {
  title: { template: '%s | NDSC Council Hub', default: 'NDSC Council Hub' },
  description: 'Internal governance hub for North Down Softball Club council.',
}

export default function CouncilLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileNav />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
