import Link from "next/link"
import { HandHeart, Plus, Clock, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock Data
const MOCK_REQUESTS = [
  {
    id: "r1",
    title: "Need a standing fan urgently",
    body: "My room is too hot, looking to buy a functioning fairly used standing fan. Budget is 15k.",
    author: "Freshman Boy",
    timeAgo: "2 hours ago",
    replies: 4,
    status: "open"
  },
  {
    id: "r2",
    title: "Looking for MTH101 Tutor",
    body: "I need someone to put me through differentiation and integration before the test next week. Willing to pay.",
    author: "Jane Smith",
    timeAgo: "5 hours ago",
    replies: 12,
    status: "open"
  },
  {
    id: "r3",
    title: "Need roommate in Phase 2",
    body: "Got a 2-bedroom flat, looking for one more person to split the rent. Must be neat.",
    author: "Senior Man",
    timeAgo: "1 day ago",
    replies: 1,
    status: "open"
  }
]

export default function RequestsPage() {
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
      <div className="flex flex-col gap-4">
        {MOCK_REQUESTS.map(req => (
           <div key={req.id} className="bg-[#121212] border border-white/10 rounded-3xl p-6 transition-all hover:bg-white/5 hover:border-pink-500/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold border border-pink-500/30">
                     {req.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{req.author}</p>
                    <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {req.timeAgo}
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
              <p className="text-white/70 leading-relaxed text-sm mb-6">
                {req.body}
              </p>
              
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                 <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
                    <MessageSquare className="h-4 w-4" />
                    {req.replies} Replies
                 </div>
                 <Button variant="ghost" className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 rounded-full h-9 px-4 text-xs font-bold uppercase tracking-wider">
                   Reply
                 </Button>
              </div>
           </div>
        ))}
      </div>

    </div>
  )
}
