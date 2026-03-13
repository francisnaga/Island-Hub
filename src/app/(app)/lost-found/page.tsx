import Link from "next/link"
export const dynamic = "force-dynamic"
import { MapPin, Plus, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { cn } from "@/lib/utils"
import { SearchInput } from "@/components/ui/SearchInput"

export default async function LostFoundPage({ searchParams }: { searchParams: { type?: string, q?: string } }) {
  const queryText = searchParams?.q || ''
  const filterType = searchParams?.type || 'all'

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let dbQuery = supabase
    .from('lost_found')
    .select('*, profiles(full_name)')
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (filterType !== 'all') {
    dbQuery = dbQuery.eq('type', filterType)
  }

  if (queryText) {
    dbQuery = dbQuery.ilike('title', `%${queryText}%`)
  }

  const { data: items, error } = await dbQuery

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

      <SearchInput placeholder="Search reports..." className="mb-2" />

      {/* Filters */}
      <div className="flex items-center gap-3">
        {(["all", "lost", "found"] as const).map(type => (
          <Link
            key={type}
            href={`/lost-found?type=${type}`}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
              filterType === type
                ? type === "lost" ? "bg-red-500 text-white border-red-500" 
                  : type === "found" ? "bg-green-500 text-white border-green-500" 
                  : "bg-white text-navy border-white"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white"
            )}
          >
            {type}
          </Link>
        ))}
      </div>

      {/* List */}
      {items && items.length > 0 ? (
        <div className="flex flex-col gap-4">
          {items.map(item => (
            <Link href={`/lost-found/${item.id}`} key={item.id} className="relative bg-[#121212] border border-white/10 rounded-2xl p-5 overflow-hidden transition-all hover:bg-white/5">
                
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
                      <Clock className="h-3 w-3" /> {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/70 text-sm mb-4 leading-relaxed line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 text-sm">
                    <span className="flex items-center gap-1.5 text-white/50">
                      <MapPin className="h-4 w-4" />
                      {item.location}
                    </span>
                    <span className="font-semibold text-white/60">
                      {(item.profiles as any)?.full_name || 'Anonymous'}
                    </span>
                  </div>
                </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-white/50 flex items-center justify-center flex-col gap-3">
           <AlertCircle className="h-10 w-10 text-white/20" />
           <p>No items found matching this filter.</p>
        </div>
      )}

    </div>
  )
}
