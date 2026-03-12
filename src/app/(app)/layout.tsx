import { TopBar } from "@/components/layout/TopBar"
import { BottomNav } from "@/components/layout/BottomNav"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-navy text-white selection:bg-gold selection:text-navy">
      <TopBar />
      
      {/* Main content area - pad bottom for mobile nav */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
