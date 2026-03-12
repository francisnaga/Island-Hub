'use client'

import { useState, useEffect } from "react"
import { Settings, Bookmark, Grid, LogOut, CheckCircle2, Loader2, Package, Home as HomeIcon, Zap } from "lucide-react"
import { VerificationBadge } from "@/components/badges/VerificationBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ProfilePage({ searchParams }: { searchParams?: { tab?: string } }) {
  const router = useRouter()
  const initialTab = searchParams?.tab === 'settings' ? 'settings' : 'posts'
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "settings">(initialTab as any)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [savedItems, setSavedItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function getProfileData() {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)

      // Fetch My Posts (All tables)
      const [houses, services, marketplace] = await Promise.all([
        supabase.from('listings').select('*').eq('user_id', user.id),
        supabase.from('services').select('*').eq('vendor_id', user.id),
        supabase.from('marketplace_items').select('*').eq('seller_id', user.id)
      ])

      const allPosts = [
        ...(houses.data || []).map(i => ({ ...i, type: 'house' })),
        ...(services.data || []).map(i => ({ ...i, type: 'service' })),
        ...(marketplace.data || []).map(i => ({ ...i, type: 'marketplace' }))
      ].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setMyPosts(allPosts)

      // Fetch Saved Items
      const { data: savedData } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', user.id)
      
      setSavedItems(savedData || [])
      setIsLoading(false)
    }

    getProfileData()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
        <p className="text-white/40 text-sm font-medium animate-pulse">Loading your profile...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto">
      
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-white/10 bg-[#121212] p-8 text-center flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/10 blur-[50px] rounded-full" />
        
        <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-white/10 bg-midnight ring-4 ring-[#0A111F]">
           <div className="flex h-full w-full items-center justify-center bg-gray-800 text-3xl font-bold text-white">
              {profile.full_name?.charAt(0)}
           </div>
        </div>

        <h1 className="mb-1 flex items-center justify-center gap-1 text-2xl font-bold tracking-tight text-white">
          {profile.full_name}
          {profile.badge !== "none" && <VerificationBadge type={profile.badge} />}
        </h1>
        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-white/50">
          {profile.role} • {profile.matric_number || "MATRIC PENDING"}
        </p>

        <div className="flex items-center gap-6 mt-2 mb-4">
           <div className="flex flex-col">
              <span className="text-white font-bold">{profile.follower_count || 0}</span>
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Followers</span>
           </div>
           <div className="h-4 w-px bg-white/10" />
           <div className="flex flex-col">
              <span className="text-white font-bold">{profile.following_count || 0}</span>
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Following</span>
           </div>
        </div>

        {profile.is_verified ? (
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
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto hide-scrollbar">
        {[
          { id: "posts", icon: Grid, label: `My Posts (${myPosts.length})` },
          { id: "saved", icon: Bookmark, label: `Saved (${savedItems.length})` },
          { id: "settings", icon: Settings, label: "Settings" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
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
          <div className="flex flex-col gap-4">
            {myPosts.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myPosts.map(post => (
                     <div key={post.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3 group hover:border-white/20 transition-all">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gold/80 flex items-center gap-1">
                              {post.type === 'house' && <HomeIcon className="h-2.5 w-2.5" />}
                              {post.type === 'service' && <Zap className="h-2.5 w-2.5" />}
                              {post.type === 'marketplace' && <Package className="h-2.5 w-2.5" />}
                              {post.type}
                           </span>
                           <span className="text-[10px] text-white/30 font-medium">
                              {new Date(post.created_at).toLocaleDateString()}
                           </span>
                        </div>
                        <h4 className="font-bold text-white truncate group-hover:text-gold transition-colors">{post.title || post.name}</h4>
                        <p className="text-xl font-black text-white/90">₦{Number(post.price).toLocaleString()}</p>
                     </div>
                  ))}
               </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 border-dashed py-20 bg-white/[0.02]">
                <Grid className="h-10 w-10 text-white/20 mb-3" />
                <p className="text-white/50 text-sm">You haven't posted anything yet.</p>
                {profile.is_verified && (
                   <div className="flex gap-2 mt-4">
                      <Link href="/houses/new"><Button size="sm" variant="outline" className="rounded-full border-white/10">House</Button></Link>
                      <Link href="/services/new"><Button size="sm" variant="outline" className="rounded-full border-white/10">Service</Button></Link>
                   </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 border-dashed py-20 bg-white/[0.02]">
            <Bookmark className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-white/50 text-sm">{savedItems.length === 0 ? "No saved items yet." : `You have ${savedItems.length} saved items.`}</p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#121212] p-6">
              <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-3">Account Verification</h3>
              {!profile.is_verified ? (
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
