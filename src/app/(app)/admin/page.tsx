'use client'

import { useState } from "react"
import { ShieldAlert, Users, CheckCircle, FileText, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Mock Data
const PENDING_VERIFICATIONS = [
  { id: "v1", name: "David Ojo", matric: "21/4402", date: "Today" },
  { id: "v2", name: "Sarah Bakes", matric: "19/2004", date: "Yesterday" },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "posts" | "announcements">("users")

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto pb-20">
      
      {/* Header */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <ShieldAlert className="h-32 w-32 text-red-500" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-red-500 flex items-center gap-2">
            <ShieldAlert className="h-7 w-7" />
            Admin Dashboard
          </h1>
          <p className="text-red-400/80 font-medium text-sm">
            Restricted Access. Manage users, posts, and announcements.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto hide-scrollbar">
        {[
          { id: "users", icon: Users, label: "Users & Verification" },
          { id: "posts", icon: FileText, label: "Manage Posts" },
          { id: "announcements", icon: ShieldAlert, label: "Announcements" },
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

      {/* Content */}
      <div className="pt-2">
        {activeTab === "users" && (
          <div className="flex flex-col gap-6">
             <div className="bg-[#121212] border border-white/10 rounded-2xl p-5">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-gold" />
                  Pending Verifications ({PENDING_VERIFICATIONS.length})
                </h2>
                
                <div className="flex flex-col gap-3">
                  {PENDING_VERIFICATIONS.map(req => (
                     <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                        <div>
                          <p className="font-bold text-white">{req.name}</p>
                          <p className="text-sm text-white/50">{req.matric} • Applied {req.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-red-400 border-red-400/30 hover:bg-red-500/10">Reject</Button>
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">Approve</Button>
                        </div>
                     </div>
                  ))}
                </div>
             </div>
             
             <div className="bg-[#121212] border border-white/10 rounded-2xl p-5">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-500" />
                  User Search & Ban
                </h2>
                <p className="text-white/50 text-sm mb-4">Search by email or matric number to manage user accounts.</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="student@university.edu" className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30" />
                  <Button variant="secondary">Search</Button>
                </div>
             </div>
          </div>
        )}

        {activeTab === "posts" && (
           <div className="text-center py-20 text-white/50 border border-white/5 border-dashed rounded-2xl">
              Post management interface goes here.
           </div>
        )}

        {activeTab === "announcements" && (
           <div className="flex flex-col gap-4">
              <div className="bg-[#121212] border border-white/10 rounded-2xl p-5">
                <h2 className="text-lg font-bold mb-4">Create Announcement</h2>
                <div className="flex flex-col gap-4">
                  <input type="text" placeholder="Announcement Title" className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30" />
                  <textarea placeholder="Write message here..." className="w-full h-32 rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-white placeholder:text-white/30 resize-none" />
                  <div className="flex justify-end">
                     <Button className="bg-purple-500 hover:bg-purple-600 text-white">Publish to Campus</Button>
                  </div>
                </div>
              </div>
           </div>
        )}
      </div>

    </div>
  )
}
