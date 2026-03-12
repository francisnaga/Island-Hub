'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, HandHeart, Users, Speaker, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "Home", href: "/home" },
  { icon: HandHeart, label: "Requests", href: "/requests" },
  { icon: Users, label: "Vendors", href: "/vendors" },
  { icon: Speaker, label: "News", href: "/announcements" },
  { icon: UserCircle, label: "Profile", href: "/profile" },
]

export function BottomNav() {
  const pathname = usePathname()

  // Don't show on desktop, typically we'd use a CSS media query, but checking client-side works too visually via Tailwind
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-white/5 bg-[#0B1120]/90 backdrop-blur-xl md:hidden pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-gold" : "text-white/50 hover:text-white/80"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "fill-gold/20" : "")} />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
