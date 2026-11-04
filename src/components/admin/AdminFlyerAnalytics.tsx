'use client'

import { useState, useEffect } from 'react'
import {
  QrCode,
  Copy,
  Check,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Eye,
  ShoppingBag,
  Store,
  MessageCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface TagStat {
  tag: string
  label: string
  channel: string
  target: 'buyers' | 'sellers'
  visits: number
  sell_flow_starts: number
  stores_created: number
  whatsapp_taps: number
  conversionRate: number
}

interface StatsResponse {
  timeframe: string
  totalVisits: number
  totalSellStarts: number
  totalStoresCreated: number
  totalWhatsAppTaps: number
  tags: TagStat[]
}

export function AdminFlyerAnalytics() {
  const [timeframe, setTimeframe] = useState<'today' | '7d' | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [copiedTag, setCopiedTag] = useState<string | null>(null)

  const fetchStats = async (tf = timeframe) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/stats?timeframe=${tf}`)
      const data = await res.json()
      if (res.ok) {
        setStats(data)
      }
    } catch {
      toast.error('Failed to load flyer statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats(timeframe)
  }, [timeframe])

  const copyQrUrl = (tag: string) => {
    const url = `https://jetty.francisnaga.site/?s=${tag}`
    navigator.clipboard.writeText(url)
    setCopiedTag(tag)
    toast.success(`Copied link for tag "${tag}": ${url}`)
    setTimeout(() => setCopiedTag(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <QrCode className="w-3.5 h-3.5" />
            <span>Campus Flyers &amp; QR Source Tracking</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground font-sans tracking-tight mt-1">
            Flyer QR Performance
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time attribution for A3 wall posters, A5 hand flyers, and WhatsApp campaign images.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="inline-flex items-center p-1 rounded-xl bg-muted border border-border">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7 Days' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeframe(t.id)}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer',
                  timeframe === t.id
                    ? 'bg-card text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchStats()}
            disabled={loading}
            className="w-8 h-8 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Refresh stats"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">QR Scans / Visits</span>
            <Eye className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums font-sans">
            {stats ? stats.totalVisits.toLocaleString('en-NG') : '—'}
          </div>
          <p className="text-[11px] text-muted-foreground">Unique visitors per day</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Sell Flow Starts</span>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums font-sans">
            {stats ? stats.totalSellStarts.toLocaleString('en-NG') : '—'}
          </div>
          <p className="text-[11px] text-muted-foreground">Opened sell sheet or /sell</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Stores Created</span>
            <Store className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums font-sans">
            {stats ? stats.totalStoresCreated.toLocaleString('en-NG') : '—'}
          </div>
          <p className="text-[11px] text-muted-foreground">Completed seller setup</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">WhatsApp Taps</span>
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums font-sans">
            {stats ? stats.totalWhatsAppTaps.toLocaleString('en-NG') : '—'}
          </div>
          <p className="text-[11px] text-muted-foreground">Direct seller enquiry clicks</p>
        </div>
      </div>

      {/* Main Campaign Breakdown Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground">Flyer Campaign Tags</h3>
            <span className="px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
              {stats?.tags.length || 7} channels
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Tag</th>
                <th className="py-3 px-4">Channel &amp; Target</th>
                <th className="py-3 px-4 text-right">Visits</th>
                <th className="py-3 px-4 text-right">Sell Starts</th>
                <th className="py-3 px-4 text-right">Stores Created</th>
                <th className="py-3 px-4 text-right">WhatsApp Taps</th>
                <th className="py-3 px-4 text-right">Conversion</th>
                <th className="py-3 px-4 text-center">Print QR Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {stats?.tags.map((row) => (
                <tr key={row.tag} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    <span className="px-2 py-0.5 rounded bg-muted border border-border">
                      {row.tag}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground text-xs">{row.label}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span>{row.channel}</span>
                      <span>·</span>
                      <span className={cn(
                        'capitalize font-medium',
                        row.target === 'sellers' ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'
                      )}>
                        {row.target}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-foreground tabular-nums">
                    {row.visits.toLocaleString('en-NG')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-foreground tabular-nums">
                    {row.sell_flow_starts.toLocaleString('en-NG')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-foreground tabular-nums">
                    {row.stores_created.toLocaleString('en-NG')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {row.whatsapp_taps.toLocaleString('en-NG')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-foreground tabular-nums">
                    {row.conversionRate}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => copyQrUrl(row.tag)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer text-[11px] font-medium"
                      title={`Copy https://jetty.francisnaga.site/?s=${row.tag}`}
                    >
                      {copiedTag === row.tag ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Copy link</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
