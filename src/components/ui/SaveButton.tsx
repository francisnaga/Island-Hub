'use client'

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SaveButtonProps {
  itemId: string
  itemType: 'house' | 'service' | 'marketplace'
  initialIsSaved?: boolean
}

export function SaveButton({ 
  itemId, 
  itemType,
  initialIsSaved = false
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function checkSaveStatus() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .single()

      if (data && !error) {
        setIsSaved(true)
      }
    }
    checkSaveStatus()
  }, [itemId, supabase])

  const toggleSave = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please login to save items")
      setIsLoading(false)
      return
    }

    if (isSaved) {
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)

      if (!error) {
        setIsSaved(false)
        toast.success("Removed from saved")
      } else {
        toast.error("Failed to unsave")
      }
    } else {
      const { error } = await supabase
        .from('saved_items')
        .insert({
          user_id: user.id,
          item_id: itemId,
          item_type: itemType
        })

      if (!error) {
        setIsSaved(true)
        toast.success("Saved for later!")
      } else {
        if (error.code === '23505') {
            setIsSaved(true)
        } else {
            toast.error("Failed to save")
        }
      }
    }
    setIsLoading(false)
  }

  return (
    <Button
      onClick={toggleSave}
      disabled={isLoading}
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9 rounded-full transition-all",
        isSaved 
          ? "text-gold bg-gold/10" 
          : "text-white/50 hover:bg-white/10 hover:text-white"
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck className="h-5 w-5" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
    </Button>
  )
}
