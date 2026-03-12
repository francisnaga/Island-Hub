'use client'

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface FollowButtonProps {
  followingId: string
  initialIsFollowing?: boolean
  followerCount?: number
  onCountChange?: (newCount: number) => void
}

export function FollowButton({ 
  followingId, 
  initialIsFollowing = false,
  followerCount = 0,
  onCountChange
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const [currentCount, setCurrentCount] = useState(followerCount)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function checkFollowStatus() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
        .single()

      if (data && !error) {
        setIsFollowing(true)
      }
    }
    checkFollowStatus()
  }, [followingId, supabase])

  const toggleFollow = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please login to follow vendors")
      setIsLoading(false)
      return
    }

    if (user.id === followingId) {
      toast.error("You cannot follow yourself")
      setIsLoading(false)
      return
    }

    if (isFollowing) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId)

      if (!error) {
        setIsFollowing(false)
        const newCount = Math.max(0, currentCount - 1)
        setCurrentCount(newCount)
        onCountChange?.(newCount)
        toast.success("Unfollowed")
      } else {
        toast.error("Failed to unfollow")
      }
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: followingId
        })

      if (!error) {
        setIsFollowing(true)
        const newCount = currentCount + 1
        setCurrentCount(newCount)
        onCountChange?.(newCount)
        toast.success("Following!")
      } else {
        // Handled if already following
        if (error.code === '23505') {
            setIsFollowing(true)
        } else {
            toast.error("Failed to follow")
        }
      }
    }
    setIsLoading(false)
  }

  return (
    <Button
      onClick={toggleFollow}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      className={cn(
        "rounded-full px-6 font-semibold transition-all",
        isFollowing 
          ? "border-white/20 bg-white/5 text-white hover:bg-white/10" 
          : "bg-gold text-navy hover:bg-gold/90"
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="mr-2 h-4 w-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  )
}
