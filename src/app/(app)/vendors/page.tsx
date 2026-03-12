'use client'

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { VendorCard } from "@/components/cards/VendorCard"
import { cn } from "@/lib/utils"

// Mock Data
const MOCK_VENDORS = [
  { id: "v1", name: "Cloudinary", role: "OFFICIAL LOGISTICS", rating: 5.0, badge: "gold" as const },
  { id: "v2", name: "Admin Bookstore", role: "OFFICIAL PARTNER", rating: 4.9, badge: "gold" as const },
  { id: "v3", name: "Titilayo Uba", role: "CAMPUS MERCHANT", rating: 4.8, badge: "blue" as const },
  { id: "v4", name: "Obi's Salon", role: "GROOMING", rating: 4.5, badge: "blue" as const },
  { id: "v5", name: "Alex Repairs", role: "TECH REPAIRS", rating: 4.2, badge: "none" as const },
  { id: "v6", name: "Sarah Bakes", role: "FOOD & CASTRY", rating: 4.7, badge: "none" as const },
]

export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "verified">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter and Sort Logic
  const filteredVendors = MOCK_VENDORS.filter(v => {
    // 1. Search filter
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.role.toLowerCase().includes(searchQuery.toLowerCase())
    
    // 2. Tab filter
    const matchesTab = activeTab === "all" || (activeTab === "verified" && v.badge !== "none")

    return matchesSearch && matchesTab
  }).sort((a, b) => {
    // Sort: Gold -> Blue -> None
    const rank = { gold: 3, blue: 2, none: 1 }
    return rank[b.badge] - rank[a.badge]
  })

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto">
      
      {/* Search Bar */}
      <div className="relative w-full mb-2">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for sellers, service teams..." 
          className="h-14 w-full rounded-2xl border-white/10 bg-[#121212] pl-12 pr-4 text-white placeholder:text-white/40 focus:border-gold focus:ring-1 focus:ring-gold text-md"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "rounded-full px-6 py-2.5 text-sm font-bold tracking-wide transition-all",
            activeTab === "all" 
              ? "bg-[#1DA1F2] text-white shadow-[0_0_15px_rgba(29,161,242,0.4)]" 
              : "bg-[#121212] border border-white/10 text-white/60 hover:text-white"
          )}
        >
          ALL SELLERS
        </button>
        <button
          onClick={() => setActiveTab("verified")}
          className={cn(
            "rounded-full px-6 py-2.5 text-sm font-bold tracking-wide transition-all",
            activeTab === "verified" 
              ? "bg-[#1DA1F2] text-white shadow-[0_0_15px_rgba(29,161,242,0.4)]" 
              : "bg-[#121212] border border-white/10 text-white/60 hover:text-white"
          )}
        >
          VERIFIED
        </button>
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
        {filteredVendors.length > 0 ? (
          filteredVendors.map(vendor => (
            <VendorCard key={vendor.id} {...vendor} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-white/50">
            No vendors found matching your search.
          </div>
        )}
      </div>

    </div>
  )
}
