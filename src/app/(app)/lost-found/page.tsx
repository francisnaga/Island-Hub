'use client'

import { useState } from "react"
import Link from "next/link"
import { MapPin, Plus, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Mock Data
const MOCK_ITEMS = [
  {
    id: "lf1",
    title: "Lost iPhone 13 Pro Max",
    description: "I lost my blue iPhone around the Engineering block. It has a transparent case. Please contact me if found.",
    location: "Engineering Block",
    type: "lost",
    author: "Jane Smith",
    timeAgo: "2 hours ago"
  },
  {
    id: "lf2",
    title: "Found a Set of Keys",
    description: "Found a bunch of keys with a red lanyard near the library entrance. Dropped it at the security post.",
    location: "Library Entrance",
    type: "found",
    author: "Admin Security",
    timeAgo: "1 day ago"
  }
]

export default function LostFoundPage() {
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all")

  const filteredItems = MOCK_ITEMS.filter(item => 
    filter === "all" ? true : item.type === filter
  )

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto pb-20 max-w-4xl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
            <MapPin className="h-7 w-7 text-yellow-500" />
            Lost & Found
          </h1>
          <p className="text-white/60 font-light text-sm sm:text-base">
            Report lost items or help return found ones.
          </p>
        </div>
        <Link href="/lost-found/new">
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-navy font-bold rounded-full">
            <Plus className="h-4 w-4 mr-2 text-navy" />
            Report Item
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        {(["all", "lost", "found"] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
              filter === type
                ? type === "lost" ? "bg-red-500 text-white border-red-500" 
                  : type === "found" ? "bg-green-500 text-white border-green-500" 
                  : "bg-white text-navy border-white"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {filteredItems.map(item => (
           <div key={item.id} className="relative bg-[#121212] border border-white/10 rounded-2xl p-5 overflow-hidden transition-all hover:bg-white/5">
              
              {/* Type indicator line */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5",
                item.type === "lost" ? "bg-red-500" : "bg-green-500"
              )} />
              
              <div className="pl-2">
                <div className="flex items-center justify-between mb-3">
                  <span className={cn(
                    "text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-sm",
                    item.type === "lost" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                  )}>
                    {item.type}
                  </span>
                  <span className="text-xs text-white/40 flex items-center gap-1 font-medium">
                    <Clock className="h-3 w-3" /> {item.timeAgo}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">{item.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-sm">
                  <span className="flex items-center gap-1.5 text-white/50">
                    <MapPin className="h-4 w-4" />
                    {item.location}
                  </span>
                  <span className="font-semibold text-white/60">
                    {item.author}
                  </span>
                </div>
              </div>
           </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="py-20 text-center text-white/50 flex items-center justify-center flex-col gap-3">
             <AlertCircle className="h-10 w-10 text-white/20" />
             <p>No items found matching this filter.</p>
          </div>
        )}
      </div>

    </div>
  )
}
