'use client'

import { useState } from "react"
import { Settings, Bookmark, Grid, LogOut, CheckCircle2 } from "lucide-react"
import { VerificationBadge } from "@/components/badges/VerificationBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

export default function ProfilePage({ searchParams }: { searchParams?: { tab?: string } }) {
  const router = useRouter()
  const initialTab = searchParams?.tab === 'settings' ? 'settings' : 'posts'
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "settings">(initialTab as any)

  // Mock Data (will be replaced by Supabase fetch)
  const mockUser = {
    name: "John Doe",
    role: "student",
    matric: "20/0045",
    badge: "none" as const,
    rating: 0,
    isVerified: false
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto">
      
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-white/10 bg-[#121212] p-8 text-center flex flex-col items-center relative overflow-hidden">
        {/* Abstract bg element */}
        <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/10 blur-[50px] rounded-full" />
        
        {/* Avatar */}
        <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-white/10 bg-midnight ring-4 ring-[#0A111F]">
           <div className="flex h-full w-full items-center justify-center bg-gray-800 text-3xl font-bold text-white">
              {mockUser.name.charAt(0)}
           </div>
        </div>

        {/* Info */}
        <h1 className="mb-1 flex items-center justify-center gap-1 text-2xl font-bold tracking-tight text-white">
          {mockUser.name}
          {mockUser.badge !== "none" && <VerificationBadge type={mockUser.badge} />}
        </h1>
        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-white/50">
          {mockUser.role} • {mockUser.matric}
        </p>

        {/* Verification Status */}
        {mockUser.isVerified ? (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 border border-green-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Verified Student
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400 border border-yellow-500/20">
            Pending Verification
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: "posts", icon: Grid, label: "My Posts" },
          { id: "saved", icon: Bookmark, label: "Saved" },
          { id: "settings", icon: Settings, label: "Settings" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
              activeTab === tab.id 
                ? "bg-white/10 text-white" 
                : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Areas */}
      <div className="pb-20">
        {activeTab === "posts" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 border-dashed py-20 bg-white/[0.02]">
            <Grid className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-white/50 text-sm">You haven't posted anything yet.</p>
            {mockUser.isVerified ? (
               <Button className="mt-4 bg-gold text-navy hover:bg-gold/90 font-semibold rounded-full px-6">
                 Create Post
               </Button>
            ) : (
               <p className="text-yellow-400/80 text-xs mt-3 bg-yellow-400/10 px-3 py-1 rounded-full">
                  Verify your account to post.
               </p>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 border-dashed py-20 bg-white/[0.02]">
            <Bookmark className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-white/50 text-sm">No saved items yet.</p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#121212] p-6">
              <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-3">Account Verification</h3>
              {!mockUser.isVerified ? (
                 <div className="flex flex-col gap-3">
                   <p className="text-sm text-white/60 mb-2">
                     To post houses, services, or marketplace items, you need to verify your student status.
                   </p>
                   <Button variant="outline" className="w-full justify-start rounded-xl border-white/20 hover:bg-white/10 hover:text-white">
                     Request Verification
                   </Button>
                 </div>
              ) : (
                 <p className="text-sm text-green-400">Your account is fully verified.</p>
              )}
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 mt-4">
              <h3 className="text-lg font-bold text-red-400 mb-4 border-b border-red-500/20 pb-3">Danger Zone</h3>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full justify-start bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 rounded-xl"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
