'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  Store,
  Package,
  Flag,
  FolderKanban,
  History,
  CheckCircle2,
  XCircle,
  Ban,
  Plus,
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
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [reports, setReports] = useState<ReportRecord[]>(initialReports)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [logs, setLogs] = useState<ModerationLog[]>(initialLogs)

  const [activeTab, setActiveTab] = useState<
    'products' | 'vendors' | 'reports' | 'categories' | 'logs'
  >('products')
  const [busyId, setBusyId] = useState<string | null>(null)

  // New Category Form
  const [newCatName, setNewCatName] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [newCatPriority, setNewCatPriority] = useState(false)
  const [creatingCat, setCreatingCat] = useState(false)

  const pendingVendors = vendors.filter((v) => v.verification_status === 'pending')
  const pendingProducts = products.filter((p) => p.status === 'pending_review')
  const openReports = reports.filter((r) => r.status === 'open')

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

  // Product Moderation Action
  const handleProductStatus = async (
    product: Product,
    nextStatus: ProductApprovalStatus
  ) => {
    let reason: string | undefined
    if (nextStatus === 'rejected' || nextStatus === 'suspended') {
      const input = window.prompt(
        `Enter reason for marking "${product.title}" as ${nextStatus}:`,
        nextStatus === 'rejected'
          ? 'Please upload clearer photos or provide an accurate product description.'
          : 'Suspended due to policy violation or buyer report.'
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
        })
        .eq('id', product.id)

      if (error) {
        toast.error(error.message)
        return
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, status: nextStatus, rejection_reason: reason || null }
            : p
        )
      )
      await recordLog(`product_${nextStatus}`, 'product', product.id, reason)
      toast.success(`Listing "${product.title}" marked as ${nextStatus}`)
    } finally {
      setBusyId(null)
    }
  }

  // Vendor Moderation Action
  const handleVendorStatus = async (
    vendor: Vendor,
    nextStatus: VendorVerificationStatus
  ) => {
    let reason: string | undefined
    if (nextStatus === 'rejected' || nextStatus === 'suspended') {
      const input = window.prompt(
        `Enter reason for marking vendor "${vendor.shop_name}" as ${nextStatus}:`,
        'Could not verify WhatsApp contact or student/business identity.'
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
        })
        .eq('id', vendor.id)

      if (error) {
        toast.error(error.message)
        return
      }

      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendor.id
            ? {
                ...v,
                verification_status: nextStatus,
                rejection_reason: reason || null,
              }
            : v
        )
      )
      await recordLog(`vendor_${nextStatus}`, 'vendor', vendor.id, reason)
      toast.success(`Vendor "${vendor.shop_name}" marked as ${nextStatus}`)
    } finally {
      setBusyId(null)
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
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Marketplace Review &amp; Operations
          </h1>
          <p className="text-xs text-muted-foreground">
            Verify vendors, approve new product listings, resolve buyer reports, and manage categories.
          </p>
        </div>

        {/* Summary Counters */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="rounded-xl border border-slate-200 bg-[#FAF9F6] px-4 py-2.5 text-center">
            <span className="block text-xl font-extrabold text-amber-700">
              {pendingProducts.length}
            </span>
            <span className="text-[11px] font-semibold text-slate-600">
              Pending Listings
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-[#FAF9F6] px-4 py-2.5 text-center">
            <span className="block text-xl font-extrabold text-[#0F6E6E]">
              {pendingVendors.length}
            </span>
            <span className="text-[11px] font-semibold text-slate-600">
              Pending Vendors
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-[#FAF9F6] px-4 py-2.5 text-center">
            <span className="block text-xl font-extrabold text-red-700">
              {openReports.length}
            </span>
            <span className="text-[11px] font-semibold text-slate-600">
              Open Reports
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 w-full max-w-full overflow-x-auto no-scrollbar pb-1 border-b border-border">
        {[
          {
            id: 'products',
            label: `Product Review Queue (${pendingProducts.length} pending)`,
            icon: Package,
          },
          {
            id: 'vendors',
            label: `Vendor Verification (${pendingVendors.length} pending)`,
            icon: Store,
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
            label: 'Moderation Logs',
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
                  ? 'border-[#0F6E6E] text-[#0F6E6E] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab 1: Products Queue */}
      {activeTab === 'products' && (
        <div className="space-y-3">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className={cn(
                  'rounded-2xl border p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white',
                  product.status === 'pending_review'
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-200'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="h-18 w-18 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/product/${product.slug || product.id}`}
                        className="text-sm font-bold text-slate-900 hover:text-[#0F6E6E]"
                      >
                        {product.title}
                      </Link>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                        {product.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">
                      {product.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <strong className="text-slate-900">
                        {formatNaira(product.price)}
                      </strong>
                      <span>·</span>
                      <span>
                        Vendor: <strong>{product.vendor?.shop_name || 'Unknown'}</strong>
                      </span>
                      <span>·</span>
                      <span>Category: {product.category?.name || 'Uncategorized'}</span>
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
                      Approve & Publish
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

                  {product.status !== 'suspended' && (
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() => handleProductStatus(product, 'suspended')}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
              No product submissions in the database yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Vendors Queue */}
      {activeTab === 'vendors' && (
        <div className="space-y-3">
          {vendors.length > 0 ? (
            vendors.map((v) => (
              <div
                key={v.id}
                className={cn(
                  'rounded-2xl border p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white',
                  v.verification_status === 'pending'
                    ? 'border-[#0F6E6E]/40 ring-1 ring-blue-100'
                    : 'border-slate-200'
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/vendors/${v.slug || v.id}`}
                      className="text-base font-bold text-slate-900 hover:text-[#0F6E6E]"
                    >
                      {v.shop_name}
                    </Link>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                      {v.verification_status}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({v.is_student ? 'NMU Student' : 'Local Merchant'})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 max-w-2xl">{v.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>
                      <strong>WhatsApp:</strong> +{v.whatsapp_number}
                    </span>
                    <span>·</span>
                    <span>
                      <strong>Details:</strong> {v.department_or_business_info || 'N/A'}
                    </span>
                    <span>·</span>
                    <span>
                      <strong>Location:</strong> {v.location_label} ({v.location_type} /{' '}
                      {v.location_visibility})
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {v.verification_status !== 'verified' && (
                    <button
                      type="button"
                      disabled={busyId === v.id}
                      onClick={() => handleVendorStatus(v, 'verified')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verify Vendor
                    </button>
                  )}

                  {v.verification_status !== 'rejected' && (
                    <button
                      type="button"
                      disabled={busyId === v.id}
                      onClick={() => handleVendorStatus(v, 'rejected')}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-100 cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  )}

                  {v.verification_status !== 'suspended' && (
                    <button
                      type="button"
                      disabled={busyId === v.id}
                      onClick={() => handleVendorStatus(v, 'suspended')}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
              No vendor applications in the database yet.
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
                className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold uppercase text-red-800">
                      {r.target_type} report
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                      {r.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{r.reason}</h3>
                  <p className="text-xs text-slate-600">{r.details}</p>
                  {r.reporter_contact && (
                    <p className="text-[11px] text-slate-500">
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
                      className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => handleResolveReport(r, 'dismissed')}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
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
                className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {cat.name}
                    </span>
                    <span className="text-xs text-slate-400">/{cat.slug}</span>
                    {cat.is_priority && (
                      <span className="rounded-full bg-[#E6F2F2] border border-[#0F6E6E]/25 px-2 py-0.5 text-[10px] font-bold text-[#0A4F4F]">
                        Priority
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCreateCategory}
            className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-[#0F6E6E]" />
              Add New Marketplace Category
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Campus Laundry & Tailoring"
                className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Slug (optional)
              </label>
              <input
                type="text"
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value)}
                placeholder="e.g. campus-laundry-tailoring"
                className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description *
              </label>
              <textarea
                rows={2}
                required
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="What items belong in this category?"
                className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newCatPriority}
                onChange={(e) => setNewCatPriority(e.target.checked)}
                className="rounded border-slate-300"
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
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-4 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 uppercase">
                    {log.action_type.replace('_', ' ')}
                  </span>{' '}
                  <span className="text-slate-500">
                    ({log.target_type} ID: {log.target_id.slice(0, 8)}...)
                  </span>
                  {log.reason && (
                    <p className="text-slate-600">Reason: {log.reason}</p>
                  )}
                </div>
                <span className="text-slate-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-xs text-slate-500">
              No moderation actions recorded yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
