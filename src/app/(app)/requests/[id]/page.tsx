'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Clock, Send, MessageSquare, HandHeart, ChevronLeft, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [request, setRequest] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyBody, setReplyBody] = useState("")
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: reqData, error: reqError } = await supabase
        .from('requests')
        .select('*, profiles(full_name)')
        .eq('id', params.id)
        .single()

      if (reqError) {
        toast.error("Request not found")
        router.push('/requests')
        return
      }

      setRequest(reqData)

      const { data: repData, error: repError } = await supabase
        .from('request_replies')
        .select('*, profiles(full_name)')
        .eq('request_id', params.id)
        .order('created_at', { ascending: true })

      if (!repError) {
        setReplies(repData)
      }

      setLoading(false)
    }

    fetchData()
  }, [params.id, router])

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyBody.trim()) return

    if (!user) {
      toast.error("Please login to reply")
      router.push('/login')
      return
    }

    setSubmitting(true)
    const { data, error } = await supabase
      .from('request_replies')
      .insert({
        request_id: params.id,
        user_id: user.id,
        body: replyBody.trim()
      })
      .select('*, profiles(full_name)')
      .single()

    if (error) {
      toast.error("Failed to post reply")
    } else {
      setReplies([...replies, data])
      setReplyBody("")
      toast.success("Reply posted!")
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 pt-6 container mx-auto pb-20 max-w-4xl">
      
      <Link href="/requests" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors w-fit group">
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Requests
      </Link>

      {/* Request Header */}
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
           <HandHeart className="h-32 w-32" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold border border-pink-500/30 text-xl">
              {request.profiles.full_name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-white uppercase tracking-wider">{request.profiles.full_name}</p>
              <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" /> {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <h1 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tight">{request.title}</h1>
          <p className="text-lg text-white/70 leading-relaxed font-light mb-8 whitespace-pre-wrap">
            {request.body}
          </p>

          <div className="flex items-center gap-4">
             <span className="bg-pink-500/10 text-pink-400 text-xs font-black px-4 py-1.5 rounded-full border border-pink-500/20 uppercase tracking-widest">
               {request.status}
             </span>
             <span className="text-white/30 text-xs font-bold uppercase tracking-widest">
               Expires: {new Date(request.expires_at).toLocaleDateString()}
             </span>
          </div>
        </div>
      </div>

      {/* Replies Section */}
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-black text-white italic uppercase tracking-widest flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-pink-500" />
          Replies ({replies.length})
        </h2>

        <div className="flex flex-col gap-4">
          {replies.length > 0 ? (
            replies.map(reply => (
              <div key={reply.id} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 flex gap-4">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-white">{reply.profiles.full_name}</p>
                    <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">
                      {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{reply.body}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
               <p className="text-white/30 font-bold uppercase tracking-widest text-xs">No replies yet. Be the first to help!</p>
            </div>
          )}
        </div>

        {/* Reply Form */}
        <div className="mt-4">
          <form onSubmit={handleReply} className="relative group">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write a helpful reply..."
              className="w-full bg-[#121212] border border-white/10 rounded-3xl p-6 pr-16 text-sm text-white focus:outline-none focus:border-pink-500/50 min-h-[120px] transition-all resize-none group-hover:border-white/20"
            />
            <Button 
              type="submit" 
              disabled={submitting || !replyBody.trim()}
              className="absolute bottom-4 right-4 bg-pink-500 hover:bg-pink-600 text-white h-10 w-10 rounded-full flex items-center justify-center p-0 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <p className="text-[10px] text-white/20 mt-3 font-bold uppercase tracking-widest ml-4">
            Helping others builds your campus reputation
          </p>
        </div>
      </div>

    </div>
  )
}
