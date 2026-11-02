import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { FloatingSellButton } from '@/components/layout/FloatingSellButton'
import { NavigationFeedback } from '@/components/layout/NavigationFeedback'
import { getCurrentUserContext } from '@/lib/queries'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, vendor } = await getCurrentUserContext()
  const hasStore = Boolean(user && vendor && vendor.shop_name)

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] flex-col bg-background text-foreground pb-[calc(68px+env(safe-area-inset-bottom,0px))] md:pb-0">
      <Suspense fallback={null}>
        <NavigationFeedback />
      </Suspense>
      <Navbar user={user} profile={profile} vendor={vendor} />
      <main className="flex-1 min-w-0 w-full overflow-x-clip">{children}</main>
      <Footer />
      <FloatingSellButton initialHasStore={hasStore} />
      <MobileBottomNav hasStore={hasStore} />
    </div>
  )
}
