'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  Check,
  X,
  Plus,
  Star,
  Ban,
  RotateCcw,
  Trash2,
  ExternalLink,
  MessageCircle,
  Package,
  Bed,
  Briefcase,
  Eye,
  MapPin,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { UserAvatar } from '@/components/brand/UserAvatar'
import { AdminPushToggle } from '@/components/admin/AdminPushToggle'
import { AdminFlyerAnalytics } from '@/components/admin/AdminFlyerAnalytics'
import { useSearchParams } from 'next/navigation'
import {
  Category,
  CategoryRequest,
  ModerationLog,
  Product,
  ProductApprovalStatus,
  ReportRecord,
  Vendor,
  VendorVerificationStatus,
} from '@/lib/types'
import { getVendorInitials } from '@/components/cards/VendorCard'
import { formatNaira, normalizeWhatsAppNumber } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AdminDashboardClientProps {
  adminId: string
  initialVendors: Vendor[]
  initialProducts: Product[]
  initialReports: ReportRecord[]
  initialCategories: Category[]
  initialCategoryRequests?: CategoryRequest[]
  initialLogs: ModerationLog[]
}

type AdminTab = 'products' | 'vendors' | 'categories' | 'reports' | 'logs' | 'flyers'

export function AdminDashboardClient({
  adminId,
  initialVendors,
  initialProducts,
  initialReports,
  initialCategories,
  initialCategoryRequests = [],
  initialLogs,
}: AdminDashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [reports, setReports] = useState<ReportRecord[]>(initialReports)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [categoryRequests, setCategoryRequests] =
    useState<CategoryRequest[]>(initialCategoryRequests)
  const [logs, setLogs] = useState<ModerationLog[]>(initialLogs)

  const [activeTab, setActiveTab] = useState<AdminTab>((searchParams?.get('tab') as AdminTab) || 'products')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [reviewingProduct, setReviewingProduct] = useState<Product | null>(null)
  const [reviewImageIdx, setReviewImageIdx] = useState(0)

  // Filters & search
  const [productSearch, setProductSearch] = useState('')
  const [productFilter, setProductFilter] = useState<
    'all' | 'pending_review' | 'approved' | 'inactive'
  >('all')

  const [vendorSearch, setVendorSearch] = useState('')
  const [vendorFilter, setVendorFilter] = useState<
    'all' | 'verified' | 'unverified' | 'featured' | 'suspended'
  >('all')

  // New Category Form
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [newCatSection, setNewCatSection] = useState<'products' | 'housing' | 'services'>('products')
  const [catSectionFilter, setCatSectionFilter] = useState<'all' | 'products' | 'housing' | 'services'>('all')
  const [creatingCat, setCreatingCat] = useState(false)

  // Counts
  const pendingProductsCount = useMemo(
    () => products.filter((p) => p.status === 'pending_review').length,
    [products]
  )
  const pendingCategoryRequestsCount = useMemo(
    () => categoryRequests.filter((r) => r.status === 'pending').length,
    [categoryRequests]
  )
  const openReportsCount = useMemo(
    () => reports.filter((r) => r.status === 'open').length,
    [reports]
  )
  const verifiedVendorsCount = useMemo(
    () => vendors.filter((v) => v.verification_status === 'verified').length,
    [vendors]
  )

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
      // Ignore if moderation_logs table is unavailable
    }
  }

  // ── Vendor Actions ──
  const handleVendorStatus = async (
    vendor: Vendor,
    nextStatus: VendorVerificationStatus
  ) => {
    setBusyId(vendor.id)
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vendor_status',
          vendor_id: vendor.id,
          status: nextStatus,
          reason: null,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not update vendor status.')
        return
      }

      if (nextStatus === 'suspended') {
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
      } else if (nextStatus === 'verified' && vendor.verification_status === 'suspended') {
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
                ...(nextStatus === 'suspended' ? { is_featured: false } : {}),
              }
            : v
        )
      )

      await recordLog(`vendor_${nextStatus}`, 'vendor', vendor.id, vendor.shop_name)
      toast.success(
        nextStatus === 'verified'
          ? `${vendor.shop_name} verified`
          : nextStatus === 'pending'
          ? `Removed verification from ${vendor.shop_name}`
          : `${vendor.shop_name} suspended`
      )
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleVendorFeatured = async (vendor: Vendor) => {
    const nextFeatured = !vendor.is_featured
    setBusyId(vendor.id)
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vendor_featured',
          vendor_id: vendor.id,
          is_featured: nextFeatured,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not update featured status.')
        return
      }

      setVendors((prev) =>
        prev.map((v) => (v.id === vendor.id ? { ...v, is_featured: nextFeatured } : v))
      )
      await recordLog(
        nextFeatured ? 'vendor_featured' : 'vendor_unfeatured',
        'vendor',
        vendor.id,
        vendor.shop_name
      )
      toast.success(
        nextFeatured
          ? `${vendor.shop_name} featured`
          : `${vendor.shop_name} unfeatured`
      )
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  const handleDeleteVendor = async (vendor: Vendor) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${vendor.shop_name}" and ALL its products? This cannot be undone.`
      )
    ) {
      return
    }
    setBusyId(vendor.id)
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_vendor',
          vendor_id: vendor.id,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not delete vendor.')
        return
      }
      setVendors((prev) => prev.filter((v) => v.id !== vendor.id))
      setProducts((prev) => prev.filter((p) => p.vendor_id !== vendor.id))
      await recordLog('vendor_deleted', 'vendor', vendor.id, vendor.shop_name)
      toast.success(`Deleted vendor ${vendor.shop_name} and purged listings.`)
      router.refresh()
    } catch {
      toast.error('Failed to delete vendor.')
    } finally {
      setBusyId(null)
    }
  }

  // ── Listing Actions ──
  const handleProductStatus = async (
    product: Product,
    nextStatus: ProductApprovalStatus
  ) => {
    setBusyId(product.id)
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'product_status',
          product_id: product.id,
          status: nextStatus,
          reason: null,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not update listing status.')
        return
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                status: nextStatus,
                ...(nextStatus !== 'approved' ? { is_featured: false } : {}),
              }
            : p
        )
      )
      setReviewingProduct((prev) =>
        prev && prev.id === product.id
          ? {
              ...prev,
              status: nextStatus,
              ...(nextStatus !== 'approved' ? { is_featured: false } : {}),
            }
          : prev
      )
      await recordLog(`product_${nextStatus}`, 'product', product.id, product.title)
      toast.success(
        nextStatus === 'approved'
          ? 'Listing approved and live'
          : nextStatus === 'rejected'
          ? 'Listing rejected'
          : 'Listing archived'
      )
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleProductFeatured = async (product: Product) => {
    const nextFeatured = !product.is_featured
    setBusyId(product.id)
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'product_featured',
          product_id: product.id,
          is_featured: nextFeatured,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not update featured status.')
        return
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_featured: nextFeatured } : p))
      )
      setReviewingProduct((prev) =>
        prev && prev.id === product.id ? { ...prev, is_featured: nextFeatured } : prev
      )
      await recordLog(
        nextFeatured ? 'product_featured' : 'product_unfeatured',
        'product',
        product.id,
        product.title
      )
      toast.success(nextFeatured ? 'Listing featured' : 'Removed from featured')
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    setBusyId(product.id)
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_product',
          product_id: product.id,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not delete listing.')
        return
      }
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
      setReviewingProduct((prev) => (prev && prev.id === product.id ? null : prev))
      await recordLog('product_deleted', 'product', product.id, product.title)
      toast.success('Listing deleted')
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  // ── Category Actions ──
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) {
      toast.error('Enter a category name.')
      return
    }

    const slug = newCatName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    setCreatingCat(true)
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_category',
          name: newCatName.trim(),
          slug,
          description: newCatDesc.trim() || `Browse ${newCatName.trim()} on Jetty`,
          display_order: categories.length + 1,
          is_priority: false,
          section: newCatSection,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not create category.')
        return
      }

      const data = json.category as Category
      if (data) {
        setCategories((prev) => {
          const exists = prev.some((c) => c.id === data.id || c.slug === data.slug)
          return exists
            ? prev.map((c) => (c.id === data.id || c.slug === data.slug ? data : c))
            : [...prev, data]
        })
        await recordLog('category_created', 'category', data.id, data.name)
      }
      setNewCatName('')
      setNewCatDesc('')
      toast.success(`Category "${newCatName.trim()}" added to ${newCatSection}`)
      router.refresh()
    } finally {
      setCreatingCat(false)
    }
  }

  const handleDeleteCategory = async (cat: Category) => {
    if (
      !confirm(
        `Are you sure you want to delete category "${cat.name}"? This cannot be undone.`
      )
    ) {
      return
    }
    setBusyId(cat.id)
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_category',
          category_id: cat.id,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not delete category.')
        return
      }
      setCategories((prev) => prev.filter((c) => c.id !== cat.id))
      await recordLog('category_deleted', 'category', cat.id, cat.name)
      toast.success(`Deleted category "${cat.name}"`)
      router.refresh()
    } catch {
      toast.error('Network error deleting category.')
    } finally {
      setBusyId(null)
    }
  }

  const handleApproveCategoryRequest = async (
    req: CategoryRequest,
    targetSection?: 'products' | 'services' | 'housing'
  ) => {
    setBusyId(req.id)
    try {
      const isService =
        targetSection === 'services' ||
        req.name.toLowerCase().includes('service') ||
        req.description?.startsWith('[Service]')
      const isHousing =
        targetSection === 'housing' ||
        req.name.toLowerCase().includes('room') ||
        req.description?.startsWith('[Housing]')
      const section =
        targetSection || (isService ? 'services' : isHousing ? 'housing' : 'products')

      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_category_request',
          request_id: req.id,
          name: req.name.trim(),
          description: req.description || `Browse ${req.name} on Jetty`,
          display_order: categories.length + 1,
          section,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not approve category request.')
        return
      }

      if (json.category) {
        setCategories((prev) => [...prev, json.category as Category])
      }
      setCategoryRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: 'approved' } : r))
      )
      await recordLog('category_approved', 'category', req.id, `${req.name} (${section})`)
      toast.success(`Category "${req.name}" approved in ${section}`)
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  const handleRejectCategoryRequest = async (req: CategoryRequest) => {
    setBusyId(req.id)
    try {
      await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject_category_request',
          request_id: req.id,
        }),
      })

      setCategoryRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: 'rejected' } : r))
      )
      await recordLog('category_rejected', 'category', req.id, req.name)
      toast.success(`Request "${req.name}" dismissed`)
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  // ── Report Actions ──
  const handleResolveReport = async (
    report: ReportRecord,
    nextStatus: 'resolved' | 'dismissed',
    options?: { suspendVendor?: boolean; deleteProduct?: boolean }
  ) => {
    setBusyId(report.id)
    try {
      const vendorTargetId = report.vendor_id || report.vendor?.id
      const productTargetId = report.product_id || report.product?.id

      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve_report',
          report_id: report.id,
          status: nextStatus,
          suspend_vendor_id: options?.suspendVendor ? vendorTargetId : undefined,
          delete_product_id: options?.deleteProduct ? productTargetId : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not update report.')
        return
      }

      if (options?.suspendVendor && vendorTargetId) {
        setVendors((prev) =>
          prev.map((v) =>
            v.id === vendorTargetId ? { ...v, verification_status: 'suspended' } : v
          )
        )
      }
      if (options?.deleteProduct && productTargetId) {
        setProducts((prev) => prev.filter((p) => p.id !== productTargetId))
      }

      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: nextStatus } : r))
      )
      await recordLog(
        `report_${nextStatus}`,
        'report',
        report.id,
        `${report.reason}${options?.suspendVendor ? ' (Vendor Suspended)' : ''}${options?.deleteProduct ? ' (Listing Deleted)' : ''}`
      )
      toast.success(
        options?.suspendVendor
          ? 'Vendor suspended & report resolved.'
          : options?.deleteProduct
          ? 'Listing deleted & report resolved.'
          : `Report ${nextStatus}`
      )
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  // ── Filtered & Sorted Lists ──
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    return products
      .filter((p) => {
        if (productFilter === 'pending_review' && p.status !== 'pending_review') {
          return false
        }
        if (productFilter === 'approved' && p.status !== 'approved') {
          return false
        }
        if (
          productFilter === 'inactive' &&
          p.status !== 'rejected' &&
          p.status !== 'archived' &&
          p.status !== 'suspended'
        ) {
          return false
        }
        if (q) {
          const hay = [
            p.title,
            p.description,
            p.vendor?.shop_name || '',
            p.category?.name || '',
            p.listing_type || '',
          ]
            .join(' ')
            .toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        // Always prioritize pending_review at the top
        if (a.status === 'pending_review' && b.status !== 'pending_review') return -1
        if (b.status === 'pending_review' && a.status !== 'pending_review') return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [products, productFilter, productSearch])

  const filteredVendors = useMemo(() => {
    const q = vendorSearch.trim().toLowerCase()
    return vendors.filter((v) => {
      if (vendorFilter === 'verified' && v.verification_status !== 'verified') {
        return false
      }
      if (
        vendorFilter === 'unverified' &&
        (v.verification_status === 'verified' || v.verification_status === 'suspended')
      ) {
        return false
      }
      if (vendorFilter === 'featured' && !v.is_featured) {
        return false
      }
      if (vendorFilter === 'suspended' && v.verification_status !== 'suspended') {
        return false
      }
      if (q) {
        const hay = [
          v.shop_name,
          v.whatsapp_number,
          v.campus || '',
          v.location_label || '',
          v.description || '',
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [vendors, vendorFilter, vendorSearch])

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 min-w-0">
      {/* ── Linear-Style Minimal Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-[26px] font-semibold tracking-tight text-foreground font-sans">
              Admin
            </h1>
            <span className="inline-flex items-center h-5 px-2 rounded-md bg-muted border border-border text-[11px] font-medium text-muted-foreground">
              Moderation
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-muted-foreground">
            Review listings, verify and feature stores, and manage categories.
          </p>
        </div>

        {/* Admin Push Notifications Toggle */}
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <AdminPushToggle />
        </div>
      </div>

        {/* Compact Inline Telemetry Strip */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('products')
              setProductFilter('pending_review')
            }}
            className={cn(
              'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer',
              pendingProductsCount > 0
                ? 'border-amber-500/40 bg-amber-500/10 text-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                pendingProductsCount > 0 ? 'bg-amber-500' : 'bg-muted-foreground/40'
              )}
            />
            <span>Pending</span>
            <span className="font-semibold text-foreground">{pendingProductsCount}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('products')
              setProductFilter('all')
            }}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span>Listings</span>
            <span className="font-semibold text-foreground">{products.length}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('vendors')
              setVendorFilter('all')
            }}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span>Stores</span>
            <span className="font-semibold text-foreground">
              {verifiedVendorsCount}/{vendors.length}
            </span>
          </button>

          {openReportsCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-medium text-red-600 dark:text-red-400 cursor-pointer"
            >
              <span>Reports</span>
              <span className="font-semibold">{openReportsCount}</span>
            </button>
          )}
        </div>

      {/* ── Primary Navigation Bar ── */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {(
          [
            {
              id: 'products' as const,
              label: 'Listings',
              count: products.length,
              alert: pendingProductsCount > 0,
            },
            {
              id: 'vendors' as const,
              label: 'Stores',
              count: vendors.length,
              alert: false,
            },
            {
              id: 'categories' as const,
              label: 'Categories',
              count: categories.length,
              alert: pendingCategoryRequestsCount > 0,
            },
            {
              id: 'reports' as const,
              label: 'Reports',
              count: openReportsCount,
              alert: openReportsCount > 0,
            },
            {
              id: 'flyers' as const,
              label: 'Flyers & QR',
              count: undefined,
              alert: false,
            },
            {
              id: 'logs' as const,
              label: 'Activity',
              count: logs.length,
              alert: false,
            },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0',
                active
                  ? 'bg-foreground text-background font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'text-[11px]',
                  active ? 'text-background/70' : 'text-muted-foreground/70'
                )}
              >
                {tab.count}
              </span>
              {tab.alert && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {/* ── TAB 1: LISTINGS (ITEMS, ROOMS, SERVICES) ── */}
      {activeTab === 'products' && (
        <div className="space-y-3">
          {/* Toolbar: Search + Status Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(
                [
                  { id: 'all' as const, label: 'All', count: products.length },
                  {
                    id: 'pending_review' as const,
                    label: 'Pending',
                    count: pendingProductsCount,
                  },
                  {
                    id: 'approved' as const,
                    label: 'Approved',
                    count: products.filter((p) => p.status === 'approved').length,
                  },
                  {
                    id: 'inactive' as const,
                    label: 'Archived / Rejected',
                    count: products.filter(
                      (p) =>
                        p.status === 'rejected' ||
                        p.status === 'archived' ||
                        p.status === 'suspended'
                    ).length,
                  },
                ] as const
              ).map((f) => {
                const active = productFilter === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setProductFilter(f.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap border transition-colors cursor-pointer shrink-0',
                      active
                        ? 'bg-card border-foreground/30 text-foreground font-semibold shadow-2xs'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span>{f.label}</span>
                    <span className="text-[11px] text-muted-foreground">{f.count}</span>
                  </button>
                )
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Filter listings..."
                className="w-full h-8 pl-8 pr-7 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none"
              />
              {productSearch && (
                <button
                  type="button"
                  onClick={() => setProductSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Linear-Style Divided List */}
          {filteredProducts.length > 0 ? (
            <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
              {filteredProducts.map((product) => {
                const isPending = product.status === 'pending_review'
                const isApproved = product.status === 'approved'
                const kind =
                  product.listing_type === 'housing'
                    ? 'Room'
                    : product.listing_type === 'service'
                    ? 'Service'
                    : 'Item'
                const KindIcon =
                  product.listing_type === 'housing'
                    ? Bed
                    : product.listing_type === 'service'
                    ? Briefcase
                    : Package
                const rawVariants =
                  product.variants && typeof product.variants === 'object'
                    ? (product.variants as Record<string, unknown>)
                    : null
                const campus =
                  (rawVariants && typeof rawVariants.campus === 'string'
                    ? rawVariants.campus
                    : null) ||
                  product.vendor?.campus ||
                  'Okerenkoko'

                const detailHref =
                  product.listing_type === 'housing'
                    ? `/housing/${product.slug || product.id}`
                    : `/product/${product.slug || product.id}`

                return (
                  <div
                    key={product.id}
                    className={cn(
                      'p-3.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors',
                      isPending && 'bg-amber-500/[0.03]'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Clickable Thumbnail to Open Review Modal */}
                      <button
                        type="button"
                        onClick={() => {
                          setReviewImageIdx(0)
                          setReviewingProduct(product)
                        }}
                        title="Click to inspect photos and full details"
                        className="relative w-12 h-12 rounded-lg bg-muted border border-border/70 overflow-hidden shrink-0 grid place-items-center text-muted-foreground hover:ring-2 hover:ring-foreground/30 transition-all cursor-pointer"
                      >
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <KindIcon className="w-4 h-4" />
                        )}
                        {product.images && product.images.length > 1 && (
                          <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/75 text-[9px] font-semibold text-white">
                            +{product.images.length - 1}
                          </span>
                        )}
                      </button>

                      {/* Primary Meta */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full shrink-0',
                              isPending
                                ? 'bg-amber-500'
                                : isApproved
                                ? 'bg-emerald-500'
                                : 'bg-muted-foreground/50'
                            )}
                            title={product.status.replace('_', ' ')}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setReviewImageIdx(0)
                              setReviewingProduct(product)
                            }}
                            className="text-sm font-medium text-foreground hover:underline truncate max-w-[260px] sm:max-w-[360px] text-left cursor-pointer"
                          >
                            {product.title}
                          </button>

                          <span className="inline-flex items-center h-4 px-1.5 rounded bg-muted text-[10px] font-medium text-muted-foreground">
                            {kind}
                          </span>

                          {isPending && (
                            <span className="inline-flex items-center h-4 px-1.5 rounded bg-amber-500/15 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              Pending
                            </span>
                          )}

                          {!isPending && !isApproved && (
                            <span className="inline-flex items-center h-4 px-1.5 rounded bg-muted text-[10px] font-medium text-muted-foreground capitalize">
                              {product.status}
                            </span>
                          )}

                          {product.is_featured && (
                            <span className="inline-flex items-center gap-0.5 h-4 px-1.5 rounded bg-foreground/10 text-[10px] font-semibold text-foreground">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {formatNaira(product.price)}
                          </span>
                          <span>·</span>
                          <span>{product.vendor?.shop_name || 'Store'}</span>
                          <span>·</span>
                          <span>{campus}</span>
                          {product.category?.name && (
                            <>
                              <span>·</span>
                              <span>{product.category.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Action Controls */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewImageIdx(0)
                          setReviewingProduct(product)
                        }}
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>

                      {!isApproved && (
                        <button
                          type="button"
                          disabled={busyId === product.id}
                          onClick={() => handleProductStatus(product, 'approved')}
                          className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>Approve</span>
                        </button>
                      )}

                      {isApproved && (
                        <button
                          type="button"
                          disabled={busyId === product.id}
                          onClick={() => handleToggleProductFeatured(product)}
                          title="Toggle featured placement"
                          className={cn(
                            'inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer',
                            product.is_featured
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border bg-card text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <Star
                            className={cn(
                              'w-3.5 h-3.5',
                              product.is_featured && 'fill-current'
                            )}
                          />
                          <span>{product.is_featured ? 'Featured' : 'Feature'}</span>
                        </button>
                      )}

                      {product.status !== 'rejected' && isPending && (
                        <button
                          type="button"
                          disabled={busyId === product.id}
                          onClick={() => handleProductStatus(product, 'rejected')}
                          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-red-600 hover:border-red-500/30 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}

                      {isApproved && (
                        <button
                          type="button"
                          disabled={busyId === product.id}
                          onClick={() => handleProductStatus(product, 'archived')}
                          className="inline-flex items-center h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          Archive
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={busyId === product.id}
                        onClick={() => handleDeleteProduct(product)}
                        title="Delete listing"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-red-600 hover:border-red-500/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card py-12 px-4 text-center text-xs text-muted-foreground">
              {productSearch || productFilter !== 'all'
                ? 'No listings match this filter.'
                : 'No listings submitted yet.'}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: STORES (VENDORS) ── */}
      {activeTab === 'vendors' && (
        <div className="space-y-3">
          {/* Toolbar: Filter Pills + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(
                [
                  { id: 'all' as const, label: 'All', count: vendors.length },
                  {
                    id: 'verified' as const,
                    label: 'Verified',
                    count: verifiedVendorsCount,
                  },
                  {
                    id: 'unverified' as const,
                    label: 'Unverified',
                    count: vendors.filter(
                      (v) =>
                        v.verification_status !== 'verified' &&
                        v.verification_status !== 'suspended'
                    ).length,
                  },
                  {
                    id: 'featured' as const,
                    label: 'Featured',
                    count: vendors.filter((v) => v.is_featured).length,
                  },
                  {
                    id: 'suspended' as const,
                    label: 'Suspended',
                    count: vendors.filter((v) => v.verification_status === 'suspended')
                      .length,
                  },
                ] as const
              ).map((f) => {
                const active = vendorFilter === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setVendorFilter(f.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap border transition-colors cursor-pointer shrink-0',
                      active
                        ? 'bg-card border-foreground/30 text-foreground font-semibold shadow-2xs'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span>{f.label}</span>
                    <span className="text-[11px] text-muted-foreground">{f.count}</span>
                  </button>
                )
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                placeholder="Filter stores..."
                className="w-full h-8 pl-8 pr-7 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none"
              />
              {vendorSearch && (
                <button
                  type="button"
                  onClick={() => setVendorSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {filteredVendors.length > 0 ? (
            <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
              {filteredVendors.map((v) => {
                const isVerified = v.verification_status === 'verified'
                const isSuspended = v.verification_status === 'suspended'
                const storeListingsCount = products.filter(
                  (p) => p.vendor_id === v.id
                ).length

                return (
                  <div
                    key={v.id}
                    className={cn(
                      'p-3.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors',
                      isSuspended && 'opacity-65'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <UserAvatar
                        src={v.logo_url}
                        seed={v.id || v.slug}
                        name={v.shop_name}
                        size={40}
                        className="w-10 h-10 shrink-0 border border-border shadow-2xs"
                      />

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Link
                            href={`/vendors/${v.slug || v.id}`}
                            className={cn(
                              'text-sm font-medium text-foreground hover:underline inline-flex items-center gap-1',
                              isSuspended && 'line-through'
                            )}
                          >
                            <span className="truncate max-w-[200px]">{v.shop_name}</span>
                            <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                          </Link>

                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 h-4 px-1.5 rounded bg-sky-500/10 text-[10px] font-semibold text-foreground">
                              <VerifiedBadge size={12} />
                              <span>Verified</span>
                            </span>
                          ) : isSuspended ? (
                            <span className="inline-flex items-center h-4 px-1.5 rounded bg-red-500/15 text-[10px] font-semibold text-red-600 dark:text-red-400">
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center h-4 px-1.5 rounded bg-muted text-[10px] font-medium text-muted-foreground">
                              Unverified
                            </span>
                          )}

                          {v.is_featured && (
                            <span className="inline-flex items-center gap-0.5 h-4 px-1.5 rounded bg-foreground/10 text-[10px] font-semibold text-foreground">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                          <a
                            href={`https://wa.me/${normalizeWhatsAppNumber(v.whatsapp_number)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>+{v.whatsapp_number}</span>
                          </a>
                          <span>·</span>
                          <span>{v.campus || 'Okerenkoko'}</span>
                          {v.location_label && (
                            <>
                              <span>·</span>
                              <span className="truncate max-w-[180px]">
                                {v.location_label}
                              </span>
                            </>
                          )}
                          <span>·</span>
                          <span>
                            {storeListingsCount}{' '}
                            {storeListingsCount === 1 ? 'listing' : 'listings'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Controls */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {isSuspended ? (
                        <button
                          type="button"
                          disabled={busyId === v.id}
                          onClick={() => handleVendorStatus(v, 'pending')}
                          className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      ) : (
                        <>
                          {/* 1-Click Verify / Unverify Toggle */}
                          <button
                            type="button"
                            disabled={busyId === v.id}
                            onClick={() =>
                              handleVendorStatus(
                                v,
                                isVerified ? 'pending' : 'verified'
                              )
                            }
                            className={cn(
                              'inline-flex items-center gap-1 h-8 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer',
                              isVerified
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border bg-card text-foreground hover:bg-muted'
                            )}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.2]" />
                            <span>{isVerified ? 'Verified' : 'Verify'}</span>
                          </button>

                          {/* 1-Click Feature Toggle */}
                          <button
                            type="button"
                            disabled={busyId === v.id}
                            onClick={() => handleToggleVendorFeatured(v)}
                            className={cn(
                              'inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer',
                              v.is_featured
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border bg-card text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <Star
                              className={cn(
                                'w-3.5 h-3.5',
                                v.is_featured && 'fill-current'
                              )}
                            />
                            <span>{v.is_featured ? 'Featured' : 'Feature'}</span>
                          </button>

                          {/* Suspend Store */}
                          <button
                            type="button"
                            disabled={busyId === v.id}
                            onClick={() => handleVendorStatus(v, 'suspended')}
                            title="Suspend store and archive listings"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-amber-600 hover:border-amber-500/30 transition-colors cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Store & Purge Listings */}
                          <button
                            type="button"
                            disabled={busyId === v.id}
                            onClick={() => handleDeleteVendor(v)}
                            title="Permanently delete store and purge all listings"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-red-600 hover:border-red-500/30 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card py-12 px-4 text-center text-xs text-muted-foreground">
              {vendorSearch || vendorFilter !== 'all'
                ? 'No stores match this filter.'
                : 'No stores registered yet.'}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: CATEGORIES & REQUESTS ── */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Pending Category & Service Requests */}
          {categoryRequests.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category &amp; Service Requests ({categoryRequests.length})
              </h2>
              <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                {categoryRequests.map((req) => {
                  const isService =
                    req.description?.startsWith('[Service]') ||
                    req.name.toLowerCase().includes('service')
                  const isHousing =
                    req.description?.startsWith('[Housing]') ||
                    req.name.toLowerCase().includes('room')
                  const kindLabel = isService ? 'Service' : isHousing ? 'Housing' : 'Category'
                  const cleanDesc = (req.description || '').replace(
                    /^\[(Service|Housing|Category)\]\s*/i,
                    ''
                  )

                  return (
                    <div
                      key={req.id}
                      className="p-3.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {req.name}
                          </span>
                          <span
                            className={cn(
                              'inline-flex items-center h-4 px-1.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                              isService
                                ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                                : isHousing
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            )}
                          >
                            {kindLabel}
                          </span>
                          <span
                            className={cn(
                              'inline-flex items-center h-4 px-1.5 rounded text-[10px] font-medium capitalize',
                              req.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : req.status === 'approved'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {req.status}
                          </span>
                        </div>
                        {cleanDesc && (
                          <p className="text-xs text-muted-foreground">{cleanDesc}</p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span>
                            {req.vendor_name
                              ? `Requested by ${req.vendor_name}`
                              : 'Requested by vendor'}
                          </span>
                          {req.vendor_whatsapp && (
                            <a
                              href={`https://wa.me/${normalizeWhatsAppNumber(
                                req.vendor_whatsapp
                              )}?text=${encodeURIComponent(
                                `Hi ${req.vendor_name || 'Vendor'}, regarding your Jetty request for "${req.name}":`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#0F6E6E] dark:text-[#22D3EE] font-medium hover:underline"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Chat on WhatsApp</span>
                            </a>
                          )}
                          <span>· {new Date(req.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={busyId === req.id}
                            onClick={() =>
                              handleApproveCategoryRequest(
                                req,
                                isService ? 'services' : isHousing ? 'housing' : 'products'
                              )
                            }
                            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve as {kindLabel}</span>
                          </button>
                          <button
                            type="button"
                            disabled={busyId === req.id}
                            onClick={() => handleRejectCategoryRequest(req)}
                            className="inline-flex items-center h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick Add Category Bar with Section Selector */}
          <form
            onSubmit={handleCreateCategory}
            className="rounded-xl border border-border bg-card p-3.5 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center gap-2.5"
          >
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category name (e.g. Lab Coats & Coveralls)"
              className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none"
            />
            <input
              type="text"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Short description (optional)"
              className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none"
            />
            <select
              value={newCatSection}
              onChange={(e) => setNewCatSection(e.target.value as any)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:border-foreground/40 focus:outline-none shrink-0"
            >
              <option value="products">Section: Products / Market</option>
              <option value="housing">Section: Housing / Lodges</option>
              <option value="services">Section: Campus Services</option>
            </select>
            <button
              type="submit"
              disabled={creatingCat}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{creatingCat ? 'Adding...' : 'Add category'}</span>
            </button>
          </form>

          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {[
              { id: 'all' as const, label: 'All sections', count: categories.length },
              {
                id: 'products' as const,
                label: 'Products',
                count: categories.filter((c) => !c.section || c.section === 'products').length,
              },
              {
                id: 'housing' as const,
                label: 'Housing',
                count: categories.filter((c) => c.section === 'housing').length,
              },
              {
                id: 'services' as const,
                label: 'Services',
                count: categories.filter((c) => c.section === 'services').length,
              },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCatSectionFilter(f.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0',
                  catSectionFilter === f.id
                    ? 'border-foreground bg-foreground text-background font-semibold'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <span>{f.label}</span>
                <span className="opacity-70">({f.count})</span>
              </button>
            ))}
          </div>

          {/* Active Categories List */}
          <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
            {categories
              .filter((c) =>
                catSectionFilter === 'all'
                  ? true
                  : catSectionFilter === 'products'
                  ? !c.section || c.section === 'products'
                  : c.section === catSectionFilter
              )
              .map((cat) => {
                const sectionTag =
                  cat.section === 'housing'
                    ? 'Housing'
                    : cat.section === 'services'
                    ? 'Services'
                    : 'Products'
                const itemCount = products.filter((p) => p.category_id === cat.id).length

                return (
                  <div
                    key={cat.id || cat.slug}
                    className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {cat.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          /{cat.slug}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center h-4 px-1.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                            sectionTag === 'Housing'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : sectionTag === 'Services'
                              ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          )}
                        >
                          {sectionTag}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-xl mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <button
                        type="button"
                        disabled={busyId === cat.id}
                        onClick={() => handleDeleteCategory(cat)}
                        title={`Delete category "${cat.name}"`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-red-600 hover:border-red-500/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* ── TAB 4: BUYER REPORTS ── */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Campus Reports &amp; Flags ({reports.length})
            </h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>{reports.filter((r) => r.status === 'open').length} Open</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{reports.filter((r) => r.status === 'resolved').length} Resolved</span>
              </span>
            </div>
          </div>

          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((r) => {
                const targetProduct = r.product_id
                  ? products.find((p) => p.id === r.product_id) || r.product
                  : undefined
                const targetVendor = r.vendor_id
                  ? vendors.find((v) => v.id === r.vendor_id) || r.vendor
                  : targetProduct?.vendor_id
                  ? vendors.find((v) => v.id === targetProduct.vendor_id)
                  : undefined

                return (
                  <div
                    key={r.id}
                    className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4"
                  >
                    {/* Header Row: Status, Type, Timestamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold',
                            r.status === 'open'
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                              : r.status === 'resolved'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              r.status === 'open'
                                ? 'bg-red-500'
                                : r.status === 'resolved'
                                ? 'bg-emerald-500'
                                : 'bg-muted-foreground'
                            )}
                          />
                          <span className="capitalize">{r.status} Report</span>
                        </span>

                        <span className="inline-flex items-center h-6 px-2 rounded-md bg-muted text-[11px] font-medium text-foreground capitalize">
                          Target: {r.target_type}
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Report Reason & Details */}
                    <div className="space-y-1.5">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground">
                        {r.reason}
                      </h3>
                      {r.details && (
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {r.details}
                        </p>
                      )}
                    </div>

                    {/* Reporter Information */}
                    <div className="flex flex-wrap items-center gap-2.5 text-xs bg-muted/40 rounded-lg p-2.5 border border-border/60">
                      <span className="text-muted-foreground font-medium">
                        Reported by:
                      </span>
                      <span className="font-semibold text-foreground">
                        {r.reporter_contact ||
                          (r.reporter_id
                            ? `User #${r.reporter_id.slice(0, 8)}`
                            : 'Anonymous Campus Student')}
                      </span>
                      {r.reporter_contact && (
                        <a
                          href={`https://wa.me/${normalizeWhatsAppNumber(
                            r.reporter_contact
                          )}?text=${encodeURIComponent(
                            `Hello, this is Jetty Campus Moderation following up on your report: "${r.reason}".`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#0F6E6E] dark:text-[#22D3EE] font-medium hover:underline ml-auto"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Contact Reporter</span>
                        </a>
                      )}
                    </div>

                    {/* What Was Reported: Target Preview */}
                    {(targetProduct || targetVendor) && (
                      <div className="rounded-xl border border-border bg-background p-3.5 space-y-2.5">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                          Reported Target Entity
                        </div>

                        {r.target_type === 'product' && targetProduct && (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {targetProduct.images && targetProduct.images[0] && (
                                <img
                                  src={targetProduct.images[0]}
                                  alt={targetProduct.title}
                                  className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                                  {targetProduct.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {typeof targetProduct.price === 'number'
                                    ? formatNaira(targetProduct.price)
                                    : ''}
                                  {targetVendor?.shop_name
                                    ? ` · by ${targetVendor.shop_name}`
                                    : ''}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Link
                                href={`/product/${targetProduct.slug || targetProduct.id}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted"
                              >
                                <span>View listing</span>
                                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                              </Link>
                            </div>
                          </div>
                        )}

                        {targetVendor && (
                          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/40">
                            <div className="min-w-0">
                              <span className="text-[11px] text-muted-foreground">
                                Storefront:{' '}
                              </span>
                              <span className="text-xs font-semibold text-foreground">
                                {targetVendor.shop_name}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1.5">
                                ({targetVendor.campus || 'Okerenkoko'})
                              </span>
                              {targetVendor.verification_status === 'suspended' && (
                                <span className="ml-2 text-[10px] font-bold text-red-500 uppercase">
                                  Currently Suspended
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {targetVendor.slug && (
                                <Link
                                  href={`/vendors/${targetVendor.slug}`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted"
                                >
                                  <span>Store</span>
                                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                </Link>
                              )}
                              {targetVendor.whatsapp_number && (
                                <a
                                  href={`https://wa.me/${normalizeWhatsAppNumber(
                                    targetVendor.whatsapp_number
                                  )}?text=${encodeURIComponent(
                                    `Hello ${targetVendor.shop_name}, this is Jetty Admin regarding a report on your store.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-[#0F6E6E] dark:text-[#22D3EE] hover:bg-muted"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions Bar (for Open reports) */}
                    {r.status === 'open' && (
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/60">
                        {/* Delete listing & resolve */}
                        {(r.target_type === 'product' || targetProduct) && (
                          <button
                            type="button"
                            disabled={busyId === r.id}
                            onClick={() =>
                              handleResolveReport(r, 'resolved', { deleteProduct: true })
                            }
                            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Listing &amp; Resolve</span>
                          </button>
                        )}

                        {/* Suspend vendor & resolve */}
                        {targetVendor &&
                          targetVendor.verification_status !== 'suspended' && (
                            <button
                              type="button"
                              disabled={busyId === r.id}
                              onClick={() =>
                                handleResolveReport(r, 'resolved', { suspendVendor: true })
                              }
                              className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-red-300 dark:border-red-800 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 text-xs font-semibold hover:bg-red-200 cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Suspend Vendor &amp; Resolve</span>
                            </button>
                          )}

                        {/* Standard Resolve */}
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => handleResolveReport(r, 'resolved')}
                          className="inline-flex items-center gap-1 h-8 px-3.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>

                        {/* Dismiss */}
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => handleResolveReport(r, 'dismissed')}
                          className="h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card py-12 px-4 text-center text-xs text-muted-foreground">
              No buyer reports.
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: ACTIVITY LOGS ── */}
      {activeTab === 'logs' && (
        <div>
          {logs.length > 0 ? (
            <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="px-4 py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="min-w-0 truncate">
                    <span className="font-medium text-foreground capitalize">
                      {log.action_type.replace(/_/g, ' ')}
                    </span>
                    {log.reason && (
                      <span className="text-muted-foreground"> · {log.reason}</span>
                    )}
                  </div>
                  <span className="text-muted-foreground shrink-0">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card py-12 px-4 text-center text-xs text-muted-foreground">
              No moderation activity recorded yet.
            </div>
          )}
        </div>
      )}

      {/* ── FULL LISTING & IMAGE REVIEW MODAL ── */}
      {reviewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setReviewingProduct(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl flex flex-col"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-card/95 backdrop-blur-md">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    'inline-flex items-center h-5 px-2 rounded text-[11px] font-semibold capitalize',
                    reviewingProduct.status === 'pending_review'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : reviewingProduct.status === 'approved'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {reviewingProduct.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  Submitted {new Date(reviewingProduct.created_at).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReviewingProduct(null)}
                aria-label="Close review modal"
                className="w-8 h-8 rounded-lg border border-border grid place-items-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5">
              {/* Uploaded Images Gallery */}
              {reviewingProduct.images && reviewingProduct.images.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="relative aspect-[4/3] w-full rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center">
                    <img
                      src={
                        reviewingProduct.images[reviewImageIdx] ||
                        reviewingProduct.images[0]
                      }
                      alt={reviewingProduct.title}
                      className="max-h-full max-w-full object-contain"
                    />
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 text-[11px] font-medium text-white">
                      Photo {reviewImageIdx + 1} of {reviewingProduct.images.length}
                    </span>
                  </div>

                  {reviewingProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {reviewingProduct.images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setReviewImageIdx(idx)}
                          className={cn(
                            'w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all',
                            reviewImageIdx === idx
                              ? 'border-foreground scale-105'
                              : 'border-border opacity-70 hover:opacity-100'
                          )}
                        >
                          <img
                            src={imgUrl}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/40 py-8 px-4 text-center text-xs text-muted-foreground">
                  No photos uploaded for this listing.
                </div>
              )}

              {/* Title & Price */}
              <div className="space-y-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    {reviewingProduct.title}
                  </h2>
                  <span className="text-lg sm:text-xl font-bold text-foreground shrink-0">
                    {formatNaira(reviewingProduct.price)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Type:{' '}
                  <strong className="text-foreground capitalize">
                    {reviewingProduct.listing_type || 'product'}
                  </strong>{' '}
                  · Category:{' '}
                  <strong className="text-foreground">
                    {reviewingProduct.category?.name || 'General'}
                  </strong>{' '}
                  · Condition:{' '}
                  <strong className="text-foreground capitalize">
                    {reviewingProduct.condition || 'good'}
                  </strong>{' '}
                  · Campus:{' '}
                  <strong className="text-foreground">
                    {reviewingProduct.campus ||
                      reviewingProduct.vendor?.campus ||
                      'Okerenkoko'}
                  </strong>
                </p>
              </div>

              {/* Full Description */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Description &amp; Details
                </span>
                <p className="text-xs sm:text-sm text-foreground whitespace-pre-line leading-relaxed">
                  {reviewingProduct.description || 'No description provided.'}
                </p>
                {reviewingProduct.variants?.features &&
                  reviewingProduct.variants.features.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {reviewingProduct.variants.features.map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 rounded-md bg-card border border-border text-[11px] font-medium text-foreground"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              {/* Seller & Location Metadata */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <span>
                      Seller: {reviewingProduct.vendor?.shop_name || 'Unknown Store'}
                    </span>
                    {reviewingProduct.vendor?.verification_status === 'verified' && (
                      <VerifiedBadge size={14} />
                    )}
                  </div>
                  {reviewingProduct.vendor?.whatsapp_number && (
                    <a
                      href={`https://wa.me/${normalizeWhatsAppNumber(
                        reviewingProduct.vendor.whatsapp_number
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>+{reviewingProduct.vendor.whatsapp_number}</span>
                    </a>
                  )}
                </div>

                {(reviewingProduct.variants?.location_label ||
                  reviewingProduct.service_area ||
                  reviewingProduct.vendor?.location_label) && (
                  <div className="flex items-start gap-1.5 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-foreground" />
                    <span>
                      <strong className="text-foreground">Written location: </strong>
                      {reviewingProduct.variants?.location_label ||
                        reviewingProduct.service_area ||
                        reviewingProduct.vendor?.location_label}
                    </span>
                  </div>
                )}

                {reviewingProduct.vendor?.latitude != null &&
                  reviewingProduct.vendor?.longitude != null && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60 text-muted-foreground">
                      <span>
                        <strong className="text-foreground">Pinned GPS: </strong>
                        {Number(reviewingProduct.vendor.latitude).toFixed(5)},{' '}
                        {Number(reviewingProduct.vendor.longitude).toFixed(5)}
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${reviewingProduct.vendor.latitude},${reviewingProduct.vendor.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-foreground hover:underline"
                      >
                        Verify on Google Maps &rarr;
                      </a>
                    </div>
                  )}
              </div>
            </div>

            {/* Modal Sticky Footer Actions */}
            <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-t border-border bg-card/95 backdrop-blur-md">
              <Link
                href={
                  reviewingProduct.listing_type === 'housing'
                    ? `/housing/${reviewingProduct.slug || reviewingProduct.id}`
                    : `/product/${reviewingProduct.slug || reviewingProduct.id}`
                }
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                <span>Open buyer page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                {reviewingProduct.status !== 'approved' && (
                  <button
                    type="button"
                    disabled={busyId === reviewingProduct.id}
                    onClick={() => handleProductStatus(reviewingProduct, 'approved')}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[2.2]" />
                    <span>Approve &amp; Publish</span>
                  </button>
                )}

                {reviewingProduct.status === 'approved' && (
                  <button
                    type="button"
                    disabled={busyId === reviewingProduct.id}
                    onClick={() => handleToggleProductFeatured(reviewingProduct)}
                    className={cn(
                      'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer',
                      reviewingProduct.is_featured
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-card text-foreground hover:bg-muted'
                    )}
                  >
                    <Star
                      className={cn(
                        'w-3.5 h-3.5',
                        reviewingProduct.is_featured && 'fill-current'
                      )}
                    />
                    <span>
                      {reviewingProduct.is_featured ? 'Featured' : 'Feature listing'}
                    </span>
                  </button>
                )}

                {reviewingProduct.status !== 'rejected' && (
                  <button
                    type="button"
                    disabled={busyId === reviewingProduct.id}
                    onClick={() => handleProductStatus(reviewingProduct, 'rejected')}
                    className="inline-flex items-center gap-1 h-9 px-3.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-red-600 hover:border-red-500/30 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={busyId === reviewingProduct.id}
                  onClick={() => handleDeleteProduct(reviewingProduct)}
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
