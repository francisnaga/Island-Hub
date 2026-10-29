import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { NavigationFeedback } from '@/components/layout/NavigationFeedback'
import { getCurrentUserContext } from '@/lib/queries'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, vendor } = await getCurrentUserContext()

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-clip flex-col bg-background text-foreground pb-15 md:pb-0">
      <Suspense fallback={null}>
        <NavigationFeedback />
      </Suspense>
      <Navbar user={user} profile={profile} vendor={vendor} />
      <main className="flex-1 min-w-0 w-full">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
