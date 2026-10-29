'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Store,
  Package,
  Flag,
  FolderKanban,
  History,
  CheckCircle2,
  XCircle,
  Ban,
  Plus,
  Sparkles,
  RotateCcw,
  Trash2,
  Building2,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Category,
  ModerationLog,
  Product,
  ProductApprovalStatus,
  ReportRecord,
  Vendor,
  VendorVerificationStatus,
} from '@/lib/types'
import { formatNaira } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AdminDashboardClientProps {
  adminId: string
  initialVendors: Vendor[]
  initialProducts: Product[]
  initialReports: ReportRecord[]
  initialCategories: Category[]
  initialLogs: ModerationLog[]
}

export function AdminDashboardClient({
  adminId,
  initialVendors,
  initialProducts,
  initialReports,
  initialCategories,
  initialLogs,
}: AdminDashboardClientProps) {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [reports, setReports] = useState<ReportRecord[]>(initialReports)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [logs, setLogs] = useState<ModerationLog[]>(initialLogs)

  const [activeTab, setActiveTab] = useState<
    'vendors' | 'products' | 'reports' | 'categories' | 'logs'
  >('vendors')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [purgingDemo, setPurgingDemo] = useState(false)

  // New Category Form
  const [newCatName, setNewCatName] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [newCatPriority, setNewCatPriority] = useState(false)
  const [creatingCat, setCreatingCat] = useState(false)

  const pendingVendors = vendors.filter((v) => v.verification_status === 'pending')
  const bannedVendors = vendors.filter((v) => v.verification_status === 'suspended')
  const pendingProducts = products.filter((p) => p.status === 'pending_review')
  const openReports = reports.filter((r) => r.status === 'open')
  const demoVendorsCount = vendors.filter((v) => v.is_demo).length
  const demoProductsCount = products.filter((p) => p.is_demo).length

  const recordLog = async (
    actionType: string,
    targetType: ModerationLog['target_type'],
    targetId: string,
    reason?: string
  ) => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('moderation_logs')
        .insert({
          admin_id: adminId,
          action_type: actionType,
          target_type: targetType,
          target_id: targetId,
          reason: reason || null,
        })
        .select('*')
        .single()

      if (data) {
        setLogs((prev) => [data as ModerationLog, ...prev])
      }
    } catch {
      // Ignore if moderation_logs table is pending
    }
  }

  // Ban or Unban / Verify Vendor + Archive or Restore all vendor items
  const handleVendorStatus = async (
    vendor: Vendor,
    nextStatus: VendorVerificationStatus
  ) => {
    let reason: string | undefined
    if (nextStatus === 'suspended') {
      const input = window.prompt(
        `Ban vendor "${vendor.shop_name}" and archive all their listings from the public marketplace? Enter reason:`,
        'Banned due to marketplace policy violation or scam report.'
      )
      if (input === null) return
      reason = input.trim()
    } else if (nextStatus === 'rejected') {
      const input = window.prompt(
        `Enter reason for rejecting vendor "${vendor.shop_name}":`,
        'Could not verify WhatsApp contact or campus identity.'
      )
      if (input === null) return
      reason = input.trim()
    }

    setBusyId(vendor.id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('vendors')
        .update({
          verification_status: nextStatus,
          rejection_reason: reason || null,
          ...(nextStatus === 'suspended' ? { is_featured: false } : {}),
        })
        .eq('id', vendor.id)

      if (error) {
        toast.error(error.message)
        return
      }

      // If banning vendor -> archive all their items so they disappear from public pages
      if (nextStatus === 'suspended') {
        await supabase
          .from('products')
          .update({ status: 'archived', is_featured: false })
          .eq('vendor_id', vendor.id)

        setProducts((prev) =>
          prev.map((p) =>
            p.vendor_id === vendor.id
              ? {
                  ...p,
                  status: 'archived',
                  is_featured: false,
                  vendor: p.vendor
                    ? { ...p.vendor, verification_status: 'suspended' }
                    : p.vendor,
                }
              : p
          )
        )
      }

      // If unbanning / verifying a previously banned vendor -> restore their archived items to approved
      if (nextStatus === 'verified' && vendor.verification_status === 'suspended') {
        await supabase
          .from('products')
          .update({ status: 'approved' })
          .eq('vendor_id', vendor.id)
          .eq('status', 'archived')

        setProducts((prev) =>
          prev.map((p) =>
            p.vendor_id === vendor.id && p.status === 'archived'
              ? {
                  ...p,
                  status: 'approved',
                  vendor: p.vendor
                    ? { ...p.vendor, verification_status: 'verified' }
                    : p.vendor,
                }
              : p
          )
        )
      }

      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendor.id
            ? {
                ...v,
                verification_status: nextStatus,
                rejection_reason: reason || null,
                ...(nextStatus === 'suspended' ? { is_featured: false } : {}),
              }
            : v
        )
      )

      await recordLog(`vendor_${nextStatus}`, 'vendor', vendor.id, reason)
      toast.success(
        nextStatus === 'suspended'
          ? `Banned "${vendor.shop_name}" and archived all their listings.`
          : nextStatus === 'verified' && vendor.verification_status === 'suspended'
          ? `Unbanned "${vendor.shop_name}" and restored their listings!`
          : `Vendor "${vendor.shop_name}" marked as ${nextStatus}.`
      )
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  // Toggle Featured Vendor
  const handleToggleVendorFeatured = async (vendor: Vendor) => {
    const nextFeatured = !vendor.is_featured
    setBusyId(vendor.id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('vendors')
        .update({ is_featured: nextFeatured })
        .eq('id', vendor.id)

      if (error) {
        toast.error(error.message)
        return
      }

      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendor.id ? { ...v, is_featured: nextFeatured } : v
        )
      )
      await recordLog(
        nextFeatured ? 'vendor_featured' : 'vendor_unfeatured',
        'vendor',
        vendor.id,
        vendor.shop_name
      )
      toast.success(
        nextFeatured
          ? `"${vendor.shop_name}" is now Featured!`
          : `Removed Featured badge from "${vendor.shop_name}".`
      )
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  // Toggle Business Verified
  const handleToggleBusinessVerified = async (vendor: Vendor) => {
    const nextBiz = !vendor.business_verified
    setBusyId(vendor.id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('vendors')
        .update({ business_verified: nextBiz, seller_type: 'business' })
        .eq('id', vendor.id)

      if (error) {
        toast.error(error.message)
        return
      }

      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendor.id
            ? { ...v, business_verified: nextBiz, seller_type: 'business' }
            : v
        )
      )
      toast.success(
        nextBiz
          ? `Marked "${vendor.shop_name}" as a Verified Business`
          : `Removed Business Verification from "${vendor.shop_name}"`
      )
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  // Product Moderation Action
  const handleProductStatus = async (
    product: Product,
    nextStatus: ProductApprovalStatus
  ) => {
    let reason: string | undefined
    if (nextStatus === 'rejected' || nextStatus === 'suspended' || nextStatus === 'archived') {
      const input = window.prompt(
        `Enter reason for marking "${product.title}" as ${nextStatus}:`,
        nextStatus === 'rejected'
          ? 'Please upload clearer photos or provide an accurate product description.'
          : 'Archived/suspended by moderator.'
      )
      if (input === null) return
      reason = input.trim()
    }

    setBusyId(product.id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .update({
          status: nextStatus,
          rejection_reason: reason || null,
          ...(nextStatus !== 'approved' ? { is_featured: false } : {}),
        })
        .eq('id', product.id)

      if (error) {
        toast.error(error.message)
        return
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                status: nextStatus,
                rejection_reason: reason || null,
                ...(nextStatus !== 'approved' ? { is_featured: false } : {}),
              }
            : p
        )
      )
      await recordLog(`product_${nextStatus}`, 'product', product.id, reason)
      toast.success(`Listing "${product.title}" marked as ${nextStatus}`)
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  // Toggle Featured Product
  const handleToggleProductFeatured = async (product: Product) => {
    const nextFeatured = !product.is_featured
    setBusyId(product.id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .update({ is_featured: nextFeatured })
        .eq('id', product.id)

      if (error) {
        toast.error(error.message)
        return
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_featured: nextFeatured } : p
        )
      )
      await recordLog(
        nextFeatured ? 'product_featured' : 'product_unfeatured',
        'product',
        product.id,
        product.title
      )
      toast.success(
        nextFeatured
          ? `"${product.title}" is now Featured on the homepage!`
          : `Removed "${product.title}" from Featured items.`
      )
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  // Purge All Demo / Mock Data for Production Launch
  const handlePurgeDemoData = async () => {
    if (
      !window.confirm(
        `Remove all ${demoVendorsCount} demo vendor storefronts, ${demoProductsCount} demo items, and mock user profiles for production launch? Real signed-up vendors will NOT be affected.`
      )
    ) {
      return
    }

    setPurgingDemo(true)
    try {
      const supabase = createClient()
      await supabase.from('products').delete().eq('is_demo', true)
      await supabase.from('vendors').delete().eq('is_demo', true)
      await supabase.from('profiles').delete().eq('is_demo', true)

      setProducts((prev) => prev.filter((p) => !p.is_demo))
      setVendors((prev) => prev.filter((v) => !v.is_demo))
      toast.success('All demo vendors, mock profiles, and demo items purged!')
      router.refresh()
    } catch {
      toast.error('Could not purge demo data.')
    } finally {
      setPurgingDemo(false)
    }
  }

  // Report Resolution Action
  const handleResolveReport = async (
    report: ReportRecord,
    nextStatus: 'resolved' | 'dismissed'
  ) => {
    setBusyId(report.id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('reports')
        .update({
          status: nextStatus,
          resolved_at: new Date().toISOString(),
          resolved_by: adminId,
        })
        .eq('id', report.id)

      if (error) {
        toast.error(error.message)
        return
      }

      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: nextStatus } : r))
      )
      await recordLog(`report_${nextStatus}`, 'report', report.id, report.reason)
      toast.success(`Report marked as ${nextStatus}`)
    } finally {
      setBusyId(null)
    }
  }

  // Create Category Action
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim() || !newCatDesc.trim()) {
      toast.error('Please enter category name and description.')
      return
    }

    const slug =
      newCatSlug.trim() ||
      newCatName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

    setCreatingCat(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newCatName.trim(),
          short_name: newCatName.trim(),
          slug,
          description: newCatDesc.trim(),
          display_order: categories.length + 1,
          is_priority: newCatPriority,
          is_active: true,
        })
        .select('*')
        .single()

      if (error) {
        toast.error(error.message)
        return
      }

      if (data) {
        setCategories((prev) => [...prev, data as Category])
        await recordLog('category_created', 'category', data.id, data.name)
      }
      setNewCatName('')
      setNewCatSlug('')
      setNewCatDesc('')
      setNewCatPriority(false)
      toast.success('Category added!')
    } finally {
      setCreatingCat(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 min-w-0">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/25 px-3 py-0.5 text-[11px] font-bold text-[#0A4F4F] dark:text-[#E8B84A]">
            Jetty Super Admin · efobifrancis53@gmail.com
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Vendor &amp; Marketplace Moderation Console
          </h1>
          <p className="text-xs text-muted-foreground">
            Verify or feature vendors, ban/unban storefronts (auto-archiving their listings), approve new items, and manage demo data.
          </p>
        </div>

        {/* Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-center">
            <span className="block text-lg font-extrabold text-[#0F6E6E] dark:text-[#E8B84A]">
              {vendors.length}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Total Vendors
            </span>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-center">
            <span className="block text-lg font-extrabold text-amber-600">
              {pendingProducts.length + pendingVendors.length}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Pending Queue
            </span>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-center">
            <span className="block text-lg font-extrabold text-red-600">
              {bannedVendors.length}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Banned Vendors
            </span>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-center">
            <span className="block text-lg font-extrabold text-foreground">
              {openReports.length}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Open Reports
            </span>
          </div>
        </div>
      </div>

      {/* Demo / Mock Data Production Purge Bar */}
      {(demoVendorsCount > 0 || demoProductsCount > 0) && (
        <div className="rounded-2xl border border-[#E8B84A]/50 bg-[#E8B84A]/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-foreground">
              Demo / Seeded Storefronts Active ({demoVendorsCount} demo vendors · {demoProductsCount} approved demo items)
            </p>
            <p className="text-muted-foreground">
              These mock vendors and items are connected to mock profiles so you can test verifying, featuring, banning, and unbanning. Purge them in one click when ready for production.
            </p>
          </div>
          <button
            type="button"
            disabled={purgingDemo}
            onClick={handlePurgeDemoData}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-white dark:bg-red-950/50 px-4 py-2.5 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-50 shrink-0 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {purgingDemo ? 'Purging Demo Data...' : 'Purge Demo Data for Production'}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 w-full max-w-full overflow-x-auto no-scrollbar pb-1 border-b border-border">
        {[
          {
            id: 'vendors',
            label: `Manage Vendors (${vendors.length})`,
            icon: Store,
          },
          {
            id: 'products',
            label: `Manage Listings (${products.length})`,
            icon: Package,
          },
          {
            id: 'reports',
            label: `Buyer Reports (${openReports.length} open)`,
            icon: Flag,
          },
          {
            id: 'categories',
            label: `Categories (${categories.length})`,
            icon: FolderKanban,
          },
          {
            id: 'logs',
            label: 'Audit Logs',
            icon: History,
          },
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'inline-flex items-center gap-1.5 shrink-0 rounded-t-xl px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer',
                active
                  ? 'border-[#0F6E6E] text-[#0F6E6E] dark:text-[#E8B84A] bg-card'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab 1: Vendors Management (Verify, Feature, Ban/Archive, Unban) */}
      {activeTab === 'vendors' && (
        <div className="space-y-3">
          {vendors.length > 0 ? (
            vendors.map((v) => {
              const isBanned = v.verification_status === 'suspended'
              return (
                <div
                  key={v.id}
                  className={cn(
                    'rounded-2xl border p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card',
                    isBanned
                      ? 'border-red-300 bg-red-50/30 dark:border-red-900/60 dark:bg-red-950/20'
                      : v.verification_status === 'pending'
                      ? 'border-amber-300'
                      : 'border-border'
                  )}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/vendors/${v.slug || v.id}`}
                        className={cn(
                          'text-base font-bold hover:text-[#0F6E6E] inline-flex items-center gap-1',
                          isBanned
                            ? 'text-red-800 dark:text-red-300 line-through'
                            : 'text-foreground'
                        )}
                      >
                        <span>{v.shop_name}</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                      </Link>

                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
                          isBanned
                            ? 'bg-red-600 text-white'
                            : v.verification_status === 'verified'
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-900'
                        )}
                      >
                        {isBanned ? 'BANNED (ARCHIVED)' : v.verification_status}
                      </span>

                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground uppercase">
                        {v.seller_type || (v.is_student ? 'student' : 'independent')}
                      </span>

                      {v.is_featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#E8B84A]/25 border border-[#E8B84A] px-2 py-0.5 text-[10px] font-bold text-foreground">
                          <Sparkles className="h-2.5 w-2.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                          Featured
                        </span>
                      )}

                      {v.business_verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <Building2 className="h-2.5 w-2.5" />
                          Verified Business
                        </span>
                      )}

                      {v.is_demo && (
                        <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                          Demo Profile
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground max-w-2xl">
                      {v.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        <strong>WhatsApp:</strong> +{v.whatsapp_number}
                      </span>
                      <span>·</span>
                      <span>
                        <strong>Campus:</strong> {v.campus || 'Okerenkoko'}
                      </span>
                      <span>·</span>
                      <span>
                        <strong>Landmark:</strong> {v.location_label}
                      </span>
                      <span>·</span>
                      <span>
                        <strong>Enquiries:</strong> {v.whatsapp_clicks || 0} clicks / {v.store_views || 0} views
                      </span>
                    </div>
                  </div>

                  {/* Admin Controls: Verify, Feature, Business Verify, Ban / Unban */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {isBanned ? (
                      <button
                        type="button"
                        disabled={busyId === v.id}
                        onClick={() => handleVendorStatus(v, 'verified')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Unban &amp; Restore Vendor
                      </button>
                    ) : (
                      <>
                        {v.verification_status !== 'verified' && (
                          <button
                            type="button"
                            disabled={busyId === v.id}
                            onClick={() => handleVendorStatus(v, 'verified')}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve &amp; Verify
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={busyId === v.id}
                          onClick={() => handleToggleVendorFeatured(v)}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer transition-colors',
                            v.is_featured
                              ? 'border-[#E8B84A] bg-[#E8B84A]/20 text-foreground'
                              : 'border-border bg-background text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                          {v.is_featured ? 'Featured ✓' : 'Feature'}
                        </button>

                        <button
                          type="button"
                          disabled={busyId === v.id}
                          onClick={() => handleToggleBusinessVerified(v)}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer transition-colors',
                            v.business_verified
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
                              : 'border-border bg-background text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          {v.business_verified ? 'Biz Verified ✓' : 'Verify Biz'}
                        </button>

                        <button
                          type="button"
                          disabled={busyId === v.id}
                          onClick={() => handleVendorStatus(v, 'suspended')}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40 px-3 py-2 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-100 cursor-pointer"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Ban Vendor
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-xs text-muted-foreground">
              No vendors in the database yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Products / Food / Services Queue */}
      {activeTab === 'products' && (
        <div className="space-y-3">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className={cn(
                  'rounded-2xl border p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card',
                  product.status === 'pending_review'
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : product.status === 'archived' || product.status === 'suspended'
                    ? 'border-red-200 bg-red-50/20 opacity-80'
                    : 'border-border'
                )}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-18 w-18 rounded-xl bg-muted border border-border overflow-hidden shrink-0">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/product/${product.slug || product.id}`}
                        className="text-sm font-bold text-foreground hover:text-[#0F6E6E]"
                      >
                        {product.title}
                      </Link>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
                          product.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                            : product.status === 'archived' || product.status === 'suspended'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        )}
                      >
                        {product.status.replace('_', ' ')}
                      </span>
                      {product.listing_type && product.listing_type !== 'product' && (
                        <span className="rounded-md bg-[#E6F2F2] dark:bg-[#132A2A] px-2 py-0.5 text-[10px] font-bold uppercase text-[#0A4F4F] dark:text-[#E8B84A]">
                          {product.listing_type}
                        </span>
                      )}
                      {product.is_featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#E8B84A]/25 border border-[#E8B84A] px-2 py-0.5 text-[10px] font-bold text-foreground">
                          <Sparkles className="h-2.5 w-2.5" />
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl">
                      {product.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                      <strong className="text-foreground">
                        {formatNaira(product.price)}
                      </strong>
                      <span>·</span>
                      <span>
                        Vendor: <strong>{product.vendor?.shop_name || 'Verified Seller'}</strong>
                      </span>
                      <span>·</span>
                      <span>Category: {product.category?.name || 'Marketplace'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {product.status !== 'approved' && (
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() => handleProductStatus(product, 'approved')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve &amp; Publish
                    </button>
                  )}

                  {product.status === 'approved' && (
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() => handleToggleProductFeatured(product)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer transition-colors',
                        product.is_featured
                          ? 'border-[#E8B84A] bg-[#E8B84A]/20 text-foreground'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                      {product.is_featured ? 'Featured ✓' : 'Feature Item'}
                    </button>
                  )}

                  {product.status !== 'rejected' && (
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() => handleProductStatus(product, 'rejected')}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-100 cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  )}

                  {product.status !== 'archived' && (
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() => handleProductStatus(product, 'archived')}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Archive
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-xs text-muted-foreground">
              No product submissions in the database yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Buyer Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length > 0 ? (
            reports.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold uppercase text-red-800">
                      {r.target_type} report
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase text-foreground">
                      {r.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{r.reason}</h3>
                  <p className="text-xs text-muted-foreground">{r.details}</p>
                  {r.reporter_contact && (
                    <p className="text-[11px] text-muted-foreground">
                      Reporter contact: {r.reporter_contact}
                    </p>
                  )}
                </div>

                {r.status === 'open' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => handleResolveReport(r, 'resolved')}
                      className="rounded-lg bg-[#0F6E6E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0A4F4F] cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => handleResolveReport(r, 'dismissed')}
                      className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-xs text-muted-foreground">
              No buyer reports submitted yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Categories Manager */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {cat.name}
                    </span>
                    <span className="text-xs text-muted-foreground">/{cat.slug}</span>
                    {cat.is_priority && (
                      <span className="rounded-full bg-[#E6F2F2] border border-[#0F6E6E]/25 px-2 py-0.5 text-[10px] font-bold text-[#0A4F4F]">
                        Priority
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCreateCategory}
            className="lg:col-span-5 rounded-2xl border border-border bg-card p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-[#0F6E6E]" />
              Add New Marketplace Category
            </h3>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Campus Laundry & Tailoring"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                URL Slug (optional)
              </label>
              <input
                type="text"
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value)}
                placeholder="e.g. campus-laundry-tailoring"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Description *
              </label>
              <textarea
                rows={2}
                required
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="What items belong in this category?"
                className="w-full rounded-lg border border-input bg-background p-3 text-xs text-foreground"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={newCatPriority}
                onChange={(e) => setNewCatPriority(e.target.checked)}
                className="rounded border-input"
              />
              Mark as Priority Category on Homepage
            </label>

            <button
              type="submit"
              disabled={creatingCat}
              className="w-full h-10 rounded-xl bg-[#0F6E6E] text-white text-xs font-bold hover:bg-[#0A4F4F] cursor-pointer"
            >
              {creatingCat ? 'Adding...' : 'Create Category'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 5: Moderation Audit Logs */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-4 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground uppercase">
                    {log.action_type.replace(/_/g, ' ')}
                  </span>{' '}
                  <span className="text-muted-foreground">
                    ({log.target_type} ID: {log.target_id.slice(0, 8)}...)
                  </span>
                  {log.reason && (
                    <p className="text-muted-foreground">Note: {log.reason}</p>
                  )}
                </div>
                <span className="text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-xs text-muted-foreground">
              No moderation actions recorded yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
