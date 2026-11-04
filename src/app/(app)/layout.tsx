import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { NavigationFeedback } from '@/components/layout/NavigationFeedback'
import { SourceTracker } from '@/components/analytics/SourceTracker'
import { getCurrentUserContext } from '@/lib/queries'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, vendor } = await getCurrentUserContext()
  const hasStore = Boolean(user && vendor && vendor.shop_name)

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] flex-col bg-[#0A4F4F] text-foreground">
      <Suspense fallback={null}>
        <NavigationFeedback />
      </Suspense>
      <Suspense fallback={null}>
        <SourceTracker />
      </Suspense>
      <Navbar user={user} profile={profile} vendor={vendor} />
      <main className="flex-1 min-w-0 w-full bg-background">{children}</main>
      <Footer />
      <MobileBottomNav hasStore={hasStore} />
    </div>
  )
}
