'use client'

import Link from "next/link"
import { Calendar, Speaker, ArrowRight } from "lucide-react"

// Mock Data
const MOCK_ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "End of Semester Examination Schedule Released",
    excerpt: "The final timetable for the upcoming semester examinations has been published by the academic board...",
    date: "Dec 12, 2025",
    author: "Admin Desk"
  },
  {
    id: "a2",
    title: "Campus Power Outage Notice",
    excerpt: "Please be informed that there will be a scheduled power outage this Saturday for routine maintenance of the main generator...",
    date: "Dec 10, 2025",
    author: "Facility Management"
  },
  {
    id: "a3",
    title: "New Vendor Registration Open",
    excerpt: "Students looking to register their businesses on IslandHub can now apply for the Blue Tick verification...",
    date: "Dec 05, 2025",
    author: "IslandHub Support"
  }
]

export default function AnnouncementsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto pb-20">
      
      <div className="mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
          <Speaker className="h-7 w-7 text-purple-400" />
          Campus News
        </h1>
        <p className="text-white/60 font-light">
          Official updates and announcements from the admin desk.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {MOCK_ANNOUNCEMENTS.map(post => (
          <Link href={`/announcements/${post.id}`} key={post.id} className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#121212] p-5 transition-all hover:bg-white/5 hover:border-white/20">
            <h2 className="text-xl font-bold tracking-tight group-hover:text-purple-400 transition-colors">
              {post.title}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-4">
               <div className="flex items-center gap-4 text-xs font-semibold text-white/40 uppercase tracking-wide">
                 <span className="flex items-center gap-1.5">
                   <Calendar className="h-3.5 w-3.5" />
                   {post.date}
                 </span>
                 <span className="flex items-center gap-1.5">
                   • {post.author}
                 </span>
               </div>
               
               <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 group-hover:bg-purple-500 group-hover:text-white transition-all">
                  <ArrowRight className="h-4 w-4" />
               </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
