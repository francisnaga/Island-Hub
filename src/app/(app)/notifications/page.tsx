import { Bell, Heart, MessageSquare, UserPlus, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock Data
const MOCK_NOTIFICATIONS = [
  {
    id: "n1",
    type: "like",
    content: "Jane Doe liked your request 'Need a standing fan urgently'",
    timeAgo: "10 mins ago",
    isRead: false
  },
  {
    id: "n2",
    type: "reply",
    content: "Admin Bookstore replied to your question on MTH101 Textbook",
    timeAgo: "2 hours ago",
    isRead: false
  },
  {
    id: "n3",
    type: "follow",
    content: "Freshman Boy started following you",
    timeAgo: "1 day ago",
    isRead: true
  },
  {
    id: "n4",
    type: "verification",
    content: "Your account verification has been approved. You can now post listings.",
    timeAgo: "2 days ago",
    isRead: true
  }
]

export default function NotificationsPage() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="h-5 w-5 text-red-500 fill-red-500/20" />
      case 'reply': return <MessageSquare className="h-5 w-5 text-blue-500 fill-blue-500/20" />
      case 'follow': return <UserPlus className="h-5 w-5 text-green-500" />
      case 'verification': return <CheckCircle className="h-5 w-5 text-gold" />
      default: return <Bell className="h-5 w-5 text-white/50" />
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto pb-20 max-w-3xl">
      
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
          <Bell className="h-7 w-7 text-white/80" />
          Notifications
        </h1>
        <p className="text-white/60 font-light text-sm">
          Stay updated on your activity and campus alerts.
        </p>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {MOCK_NOTIFICATIONS.map(note => (
           <div 
             key={note.id} 
             className={cn(
               "flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
               note.isRead 
                 ? "bg-[#121212] border-white/5 opacity-70 hover:opacity-100" 
                 : "bg-[#1A1A24] border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
             )}
           >
             <div className="mt-1 bg-white/5 rounded-full p-2 border border-white/10">
               {getIcon(note.type)}
             </div>
             
             <div className="flex-1">
               <p className={cn(
                 "text-sm mb-1 leading-relaxed",
                 note.isRead ? "text-white/70" : "text-white font-medium"
               )}>
                 {note.content}
               </p>
               <p className="text-xs text-white/40 font-medium">
                 {note.timeAgo}
               </p>
             </div>
             
             {!note.isRead && (
               <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
             )}
           </div>
        ))}
      </div>

    </div>
  )
}
