import Link from "next/link"
import { HandHeart, Plus, Clock, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"

export default async function RequestsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: requests, error } = await supabase
    .from('requests')
    .select(`
      *,
      profiles(full_name),
      replies:request_replies(count)
    `)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto pb-20 max-w-4xl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
            <HandHeart className="h-7 w-7 text-pink-400" />
            Community Requests
          </h1>
          <p className="text-white/60 font-light text-sm sm:text-base">
            Ask for what you need, help others out.
          </p>
        </div>
        <Link href="/requests/new">
          <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Post Request
          </Button>
        </Link>
      </div>

      {/* Feed */}
      {requests && requests.length > 0 ? (
        <div className="flex flex-col gap-4">
          {requests.map(req => (
            <div key={req.id} className="bg-[#121212] border border-white/10 rounded-3xl p-6 transition-all hover:bg-white/5 hover:border-pink-500/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold border border-pink-500/30">
                       {(req.profiles as any)?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{(req.profiles as any)?.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {req.status === 'open' && (
                    <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-500/20 uppercase tracking-wider">
                      Open
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{req.title}</h3>
                <p className="text-white/70 leading-relaxed text-sm mb-6 line-clamp-3">
                  {req.body}
                </p>
                
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                   <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
                      <MessageSquare className="h-4 w-4" />
                      {(req.replies as any)?.[0]?.count || 0} Replies
                   </div>
                   <Link href={`/requests/${req.id}`}>
                    <Button variant="ghost" className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 rounded-full h-9 px-4 text-xs font-bold uppercase tracking-wider">
                      View & Reply
                    </Button>
                   </Link>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-white/50">
           <HandHeart className="h-12 w-12 mx-auto mb-4 opacity-20" />
           <p>No active requests found.</p>
        </div>
      )}

    </div>
  )
}
