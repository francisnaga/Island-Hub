import Link from 'next/link'
import { CheckSquare, ArrowRight } from 'lucide-react'

export function FresherBanner() {
  return (
    <div className="px-4">
      <Link
        href="/fresher-kit"
        className="w-full h-[72px] rounded-[12px] bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#DCE8E8] dark:border-[#1F3333] flex items-center justify-between gap-3 px-4 transition-all hover:border-[#0F6E6E]/60 shadow-2xs group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[10px] bg-card text-[#0F6E6E] dark:text-[#E8B84A] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <CheckSquare className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div className="min-w-0 text-left">
            <b className="block text-[15px] font-bold text-foreground leading-tight truncate">
              NMU Fresher Kit
            </b>
            <small className="text-[13px] text-muted-foreground font-normal leading-normal truncate block">
              Week-1 cadet and hostel checklist
            </small>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  )
}
