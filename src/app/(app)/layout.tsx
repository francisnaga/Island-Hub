import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getCurrentUserContext } from '@/lib/queries'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, vendor } = await getCurrentUserContext()

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6] text-slate-900">
      <Navbar user={user} profile={profile} vendor={vendor} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
