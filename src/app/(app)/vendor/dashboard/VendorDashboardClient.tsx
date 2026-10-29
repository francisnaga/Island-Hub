'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Store,
  Plus,
  Package,
  Clock,
  AlertTriangle,
  MapPin,
  BadgeCheck,
  ExternalLink,
  CheckCircle2,
  Edit3,
  Trash2,
  RefreshCw,
  Share2,
  PauseCircle,
  PlayCircle,
  Upload,
  BarChart3,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  CampusArea,
  Category,
  Product,
  SellerType,
  StockStatus,
  UserProfile,
  Vendor,
} from '@/lib/types'
import { NMU_DEFAULT_COORDS } from '@/lib/marketplace-data'
import { getVendorInitials } from '@/components/cards/VendorCard'
import { LocationPicker, LocationValue } from '@/components/vendor/LocationPicker'
import { formatNaira, isListingStale, normalizeWhatsAppNumber } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface VendorDashboardClientProps {
  user: { id: string; email?: string; full_name?: string; avatar_url?: string }
  profile: UserProfile
  vendor: Vendor
  initialProducts: Product[]
  categories: Category[]
}

async function compressImageToDataUrl(file: File, maxSize = 240): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas context unavailable'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function VendorDashboardClient({
  user,
  profile,
  vendor,
  initialProducts,
  categories,
}: VendorDashboardClientProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [activeTab, setActiveTab] = useState<
    'all' | 'pending_review' | 'out_of_stock' | 'location' | 'settings'
  >('all')

  // Inline price editing state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [draftPrice, setDraftPrice] = useState<string>('')
  const [busyProductId, setBusyProductId] = useState<string | null>(null)
  const [reconfirmingAll, setReconfirmingAll] = useState(false)

  // Store Profile & Availability settings state
  const [shopName, setShopName] = useState(vendor.shop_name)
  const [logoUrl, setLogoUrl] = useState<string | null>(
    vendor.logo_url ?? profile.avatar_url ?? user.avatar_url ?? null
  )
  const [sellerType, setSellerType] = useState<SellerType>(
    vendor.seller_type || (vendor.is_student ? 'student' : 'independent')
  )
  const [businessName, setBusinessName] = useState(vendor.business_name || '')
  const [campus, setCampus] = useState<CampusArea>(vendor.campus || 'Okerenkoko')
  const [openingHours, setOpeningHours] = useState(
    vendor.opening_hours || 'Mon–Sat, 8:00 AM – 7:00 PM'
  )
  const [isPaused, setIsPaused] = useState(Boolean(vendor.is_paused))
  const [pauseReason, setPauseReason] = useState(vendor.pause_reason || '')
  const [whatsappNumber, setWhatsappNumber] = useState(vendor.whatsapp_number)
  const [description, setDescription] = useState(vendor.description)
  const [deptInfo, setDeptInfo] = useState(vendor.department_or_business_info || '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    vendor.categories_offered || ['maritime-cadet-gear']
  )
  const [savingSettings, setSavingSettings] = useState(false)

  // Location settings state
  const [locationVal, setLocationVal] = useState<LocationValue>({
    latitude: vendor.latitude || NMU_DEFAULT_COORDS.latitude,
    longitude: vendor.longitude || NMU_DEFAULT_COORDS.longitude,
    location_type: vendor.location_type || 'shop',
    location_visibility: vendor.location_visibility || 'exact',
    location_label: vendor.location_label || 'NMU Okerenkoko Campus Area',
    pickup_options: vendor.pickup_options || 'Same-day campus pickup',
    delivery_available: vendor.delivery_available ?? false,
    delivery_coverage: vendor.delivery_coverage || 'NMU & Okerenkoko',
    pinConfirmed: true,
  })
  const [savingLocation, setSavingLocation] = useState(false)

  const pendingProducts = products.filter((p) => p.status === 'pending_review')
  const outOfStockProducts = products.filter((p) => p.stock_status === 'out_of_stock')
  const staleProducts = products.filter((p) => isListingStale(p.last_confirmed_at, 14))

  const totalEnquiryClicks =
    (vendor.whatsapp_clicks || 0) +
    products.reduce((sum, p) => sum + (p.whatsapp_clicks || 0), 0)
  const totalViews =
    (vendor.store_views || 0) +
    products.reduce((sum, p) => sum + (p.views_count || 0), 0)

  const displayedProducts =
    activeTab === 'pending_review'
      ? pendingProducts
      : activeTab === 'out_of_stock'
      ? outOfStockProducts
      : products

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await compressImageToDataUrl(file, 240)
      setLogoUrl(dataUrl)
      toast.success('Avatar ready — click Save Store Profile below to apply.')
    } catch {
      toast.error('Could not process photo.')
    } finally {
      e.target.value = ''
    }
  }

  // Routine update: Stock status changes save immediately without admin review
  const handleStockChange = async (productId: string, nextStock: StockStatus) => {
    setBusyProductId(productId)
    try {
      const supabase = createClient()
      const nowIso = new Date().toISOString()
      const { error } = await supabase
        .from('products')
        .update({
          stock_status: nextStock,
          last_confirmed_at: nowIso,
        })
        .eq('id', productId)

      if (error) {
        toast.error(error.message)
        return
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stock_status: nextStock, last_confirmed_at: nowIso }
            : p
        )
      )
      toast.success('Stock availability updated immediately')
    } finally {
      setBusyProductId(null)
    }
  }

  // Routine update: Price changes save immediately without admin review
  const handleSaveInlinePrice = async (productId: string) => {
    const numeric = Number(draftPrice)
    if (Number.isNaN(numeric) || numeric < 0) {
      toast.error('Please enter a valid price in Naira.')
      return
    }

    setBusyProductId(productId)
    try {
      const supabase = createClient()
      const nowIso = new Date().toISOString()
      const { error } = await supabase
        .from('products')
        .update({
          price: numeric,
          last_confirmed_at: nowIso,
        })
        .eq('id', productId)

      if (error) {
        toast.error(error.message)
        return
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, price: numeric, last_confirmed_at: nowIso }
            : p
        )
      )
      setEditingPriceId(null)
      toast.success('Price saved immediately')
    } finally {
      setBusyProductId(null)
    }
  }

  // Re-confirm all listings availability with one tap
  const handleReconfirmAllStock = async () => {
    setReconfirmingAll(true)
    try {
      const supabase = createClient()
      const nowIso = new Date().toISOString()
      await Promise.all([
        supabase
          .from('products')
          .update({ last_confirmed_at: nowIso })
          .eq('vendor_id', vendor.id),
        supabase
          .from('vendors')
          .update({ location_confirmed_at: nowIso })
          .eq('id', vendor.id),
      ])
      setProducts((prev) =>
        prev.map((p) => ({ ...p, last_confirmed_at: nowIso }))
      )
      toast.success('All storefront inventory confirmed as active today!')
      router.refresh()
    } finally {
      setReconfirmingAll(false)
    }
  }

  const handleTogglePauseStorefront = async () => {
    const nextPaused = !isPaused
    let reason = pauseReason
    if (nextPaused && !reason.trim()) {
      const input = window.prompt(
        'Optional note for buyers while your storefront is paused (e.g. "Away for semester exams — back Monday"):',
        'Temporarily away / restocking'
      )
      if (input === null) return
      reason = input.trim()
      setPauseReason(reason)
    }

    setSavingSettings(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('vendors')
        .update({
          is_paused: nextPaused,
          pause_reason: nextPaused ? reason : null,
        })
        .eq('id', vendor.id)

      if (error) {
        toast.error(error.message)
        return
      }

      setIsPaused(nextPaused)
      toast.success(
        nextPaused
          ? 'Storefront paused. Your listings are preserved and hidden from active search until you resume.'
          : 'Storefront resumed! Your listings are active again.'
      )
      router.refresh()
    } finally {
      setSavingSettings(false)
    }
  }

  const handleDeleteProduct = async (productId: string, title: string) => {
    if (!window.confirm(`Delete "${title}" from your storefront?`)) return
    setBusyProductId(productId)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('products').delete().eq('id', productId)
      if (error) {
        toast.error(error.message)
        return
      }
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      toast.success('Listing deleted')
    } finally {
      setBusyProductId(null)
    }
  }

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      locationVal.location_type !== 'delivery_only' &&
      !locationVal.pinConfirmed
    ) {
      toast.error('Please click "Confirm Pin Location" on the map preview before saving.')
      return
    }

    setSavingLocation(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('vendors')
        .update({
          latitude:
            locationVal.location_type === 'delivery_only'
              ? null
              : locationVal.latitude,
          longitude:
            locationVal.location_type === 'delivery_only'
              ? null
              : locationVal.longitude,
          location_type: locationVal.location_type,
          location_visibility: locationVal.location_visibility,
          location_label: locationVal.location_label.trim(),
          pickup_options: locationVal.pickup_options.trim(),
          delivery_available:
            locationVal.delivery_available ||
            locationVal.location_type === 'delivery_only',
          delivery_coverage: locationVal.delivery_coverage.trim() || null,
          location_confirmed_at: new Date().toISOString(),
        })
        .eq('id', vendor.id)

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Location & landmark settings saved immediately!')
      router.refresh()
    } finally {
      setSavingLocation(false)
    }
  }

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanPhone = normalizeWhatsAppNumber(whatsappNumber)
    if (!cleanPhone) {
      toast.error('Please enter a valid WhatsApp phone number.')
      return
    }

    setSavingSettings(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('vendors')
        .update({
          shop_name: shopName.trim(),
          logo_url: logoUrl,
          seller_type: sellerType,
          is_student: sellerType === 'student',
          business_name:
            sellerType === 'business' ? businessName.trim() || shopName.trim() : null,
          campus,
          opening_hours: openingHours.trim() || 'Mon–Sat, 8:00 AM – 7:00 PM',
          is_paused: isPaused,
          pause_reason: isPaused ? pauseReason.trim() || 'Temporarily paused' : null,
          whatsapp_number: cleanPhone,
          description: description.trim(),
          department_or_business_info: deptInfo.trim() || null,
          categories_offered: selectedCategories,
        })
        .eq('id', vendor.id)

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Storefront profile, identity & availability saved!')
      router.refresh()
    } finally {
      setSavingSettings(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Vendor Header + Simple Seller Analytics */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-5 shadow-2xs min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 min-w-0">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="flex h-13 w-13 sm:h-15 sm:w-15 shrink-0 items-center justify-center rounded-2xl bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/20 text-[#0F6E6E] dark:text-[#E8B84A] font-extrabold text-lg overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={shopName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{getVendorInitials(shopName)}</span>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {vendor.verification_status === 'verified' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Vendor
                  </span>
                ) : vendor.verification_status === 'suspended' ? (
                  <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    Storefront Suspended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    Pending Verification
                  </span>
                )}

                {isPaused && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-950">
                    <PauseCircle className="h-3.5 w-3.5" />
                    Storefront Paused
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                {shopName}
              </h1>
              <p className="text-xs text-muted-foreground">
                {campus === 'Both' ? 'Okerenkoko & Kurutie' : campus} · WhatsApp: +{whatsappNumber} · {vendor.location_label}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleReconfirmAllStock}
              disabled={reconfirmingAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <RefreshCw className={cn('h-3.5 w-3.5 text-[#0F6E6E]', reconfirmingAll && 'animate-spin')} />
              <span>{reconfirmingAll ? 'Confirming...' : 'Reconfirm Stock Today'}</span>
            </button>

            <button
              type="button"
              onClick={handleTogglePauseStorefront}
              disabled={savingSettings}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer',
                isPaused
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  : 'border-amber-300 bg-amber-50/70 text-amber-950 hover:bg-amber-100'
              )}
            >
              {isPaused ? (
                <>
                  <PlayCircle className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Resume Storefront</span>
                </>
              ) : (
                <>
                  <PauseCircle className="h-3.5 w-3.5 text-amber-700" />
                  <span>Pause Storefront</span>
                </>
              )}
            </button>

            <Link
              href={`/vendors/${vendor.slug || vendor.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#0F6E6E]" />
              Public Storefront
            </Link>

            <Link
              href="/vendor/products/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F6E6E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0A4F4F] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Listing
            </Link>
          </div>
        </div>

        {/* Simple Seller Analytics Bar (Clearly Labelled as Enquiries, Not Confirmed Sales) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Active Listings
            </span>
            <p className="text-lg font-extrabold text-foreground mt-0.5">
              {products.filter((p) => p.status === 'approved').length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Storefront &amp; Item Views
            </span>
            <p className="text-lg font-extrabold text-foreground mt-0.5">
              {totalViews}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0F6E6E] dark:text-[#E8B84A]">
              <BarChart3 className="h-3 w-3" />
              <span>WhatsApp Enquiries</span>
            </div>
            <p className="text-lg font-extrabold text-foreground mt-0.5">
              {totalEnquiryClicks}{' '}
              <span className="text-[10px] font-normal text-muted-foreground">
                (contact clicks, not sales)
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-3 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Share on WhatsApp Status
            </span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Shop my verified storefront on Jetty (${shopName}): https://jetty.ng/vendors/${vendor.slug || vendor.id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline mt-1"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share Store Link →
            </a>
          </div>
        </div>
      </div>

      {/* Stale listings alert if any */}
      {staleProducts.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>{staleProducts.length} listing(s) need availability confirmation:</strong>{' '}
              Click &quot;Reconfirm Stock Today&quot; above so buyers know your items are still available.
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 w-full max-w-full overflow-x-auto no-scrollbar pb-1 border-b border-border">
        {[
          { id: 'all', label: `Listings (${products.length})`, icon: Package },
          {
            id: 'pending_review',
            label: `Pending Review (${pendingProducts.length})`,
            icon: Clock,
          },
          {
            id: 'out_of_stock',
            label: `Out of Stock (${outOfStockProducts.length})`,
            icon: AlertTriangle,
          },
          {
            id: 'settings',
            label: 'Store Profile & Availability',
            icon: Store,
          },
          {
            id: 'location',
            label: 'Location & Landmark Pin',
            icon: MapPin,
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

      {/* Tab Content: Products / Food / Services List */}
      {(activeTab === 'all' ||
        activeTab === 'pending_review' ||
        activeTab === 'out_of_stock') && (
        <div className="space-y-4">
          <div className="rounded-xl bg-[#E6F2F2]/60 dark:bg-[#132A2A]/60 border border-[#0F6E6E]/25 px-4 py-2.5 text-xs text-foreground flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong>Routine Updates:</strong> Changing a listing&apos;s <strong>price</strong> or{' '}
              <strong>stock status</strong> takes effect immediately without waiting for admin approval.
            </span>
            <Link
              href="/vendor/products/new"
              className="font-bold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline"
            >
              + Add Product, Food, or Service
            </Link>
          </div>

          {displayedProducts.length > 0 ? (
            <div className="space-y-3">
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
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

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/product/${product.slug || product.id}`}
                          className="text-sm font-bold text-foreground hover:text-[#0F6E6E]"
                        >
                          {product.title}
                        </Link>

                        {product.status === 'approved' && (
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            Published
                          </span>
                        )}
                        {product.status === 'pending_review' && (
                          <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                            Pending Review
                          </span>
                        )}
                        {product.status === 'rejected' && (
                          <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold text-red-800">
                            Rejected
                          </span>
                        )}
                        {product.listing_type && product.listing_type !== 'product' && (
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-foreground">
                            {product.listing_type}
                          </span>
                        )}
                      </div>

                      {/* Inline Price Editor */}
                      <div className="flex items-center gap-2 pt-0.5">
                        {editingPriceId === product.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              value={draftPrice}
                              onChange={(e) => setDraftPrice(e.target.value)}
                              className="w-28 h-8 rounded-lg border border-[#0F6E6E] bg-background px-2.5 text-xs font-bold text-foreground"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveInlinePrice(product.id)}
                              disabled={busyProductId === product.id}
                              className="h-8 px-2.5 rounded-lg bg-[#0F6E6E] text-white text-xs font-semibold cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPriceId(null)}
                              className="h-8 px-2 rounded-lg border border-border text-xs text-muted-foreground cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-extrabold text-foreground">
                              {formatNaira(product.price)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPriceId(product.id)
                                setDraftPrice(String(product.price))
                              }}
                              className="text-[11px] font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline cursor-pointer"
                            >
                              Change price
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Controls */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                    <select
                      value={product.stock_status}
                      disabled={busyProductId === product.id}
                      onChange={(e) =>
                        handleStockChange(
                          product.id,
                          e.target.value as StockStatus
                        )
                      }
                      aria-label="Stock status"
                      className={cn(
                        'h-9 rounded-lg border px-3 text-xs font-semibold focus:outline-none',
                        product.stock_status === 'available'
                          ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900'
                          : product.stock_status === 'low_stock'
                          ? 'border-amber-300 bg-amber-50 text-amber-900'
                          : 'border-border bg-muted text-muted-foreground'
                      )}
                    >
                      <option value="available">Available (In Stock)</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock (Hidden)</option>
                    </select>

                    <Link
                      href={`/vendor/products/${product.id}/edit`}
                      className="inline-flex items-center gap-1 h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product.id, product.title)}
                      disabled={busyProductId === product.id}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border text-muted-foreground hover:text-red-600 hover:border-red-200 cursor-pointer"
                      title="Delete listing"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
              <Package className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground">
                No listings in this view
              </h3>
              <Link
                href="/vendor/products/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F6E6E] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0A4F4F]"
              >
                <Plus className="h-4 w-4" />
                Add Listing
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Store Profile, Identity, Business Details & Availability */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveStoreSettings}
          className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-6 max-w-3xl"
        >
          <div>
            <h2 className="text-base font-bold text-foreground">
              Store Profile, Seller Identity &amp; Availability
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize your public display name, avatar/logo, seller type, campus, opening hours, and WhatsApp contact.
            </p>
          </div>

          {/* Avatar / Logo Upload */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/25 text-[#0F6E6E] dark:text-[#E8B84A] font-extrabold text-xl overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Storefront avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{getVendorInitials(shopName)}</span>
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-foreground">
                Storefront Photo or Business Logo
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F6E6E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0A4F4F] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload New Photo / Logo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl(null)}
                    className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Use Initials
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Public Display Name / Shop Name *
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Seller Profile Type *
              </label>
              <select
                value={sellerType}
                onChange={(e) => setSellerType(e.target.value as SellerType)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              >
                <option value="student">Student Seller</option>
                <option value="independent">Independent Seller (Food / Services / Goods)</option>
                <option value="business">Business / Established Shop</option>
              </select>
            </div>
          </div>

          {sellerType === 'business' && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Registered Business Name (Optional)
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Pere Creek Ventures Ltd"
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                WhatsApp Ordering Number *
              </label>
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Campus Served *
              </label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value as CampusArea)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              >
                <option value="Okerenkoko">Okerenkoko</option>
                <option value="Kurutie">Kurutie</option>
                <option value="Both">Both (Okerenkoko &amp; Kurutie)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Opening Hours
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="Mon–Sat, 8am – 7pm"
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Department or Business Tagline
            </label>
            <input
              type="text"
              value={deptInfo}
              onChange={(e) => setDeptInfo(e.target.value)}
              placeholder="e.g. Marine Engineering · Student Seller"
              className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Store Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-input bg-background p-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
            />
          </div>

          {/* Categories Offered */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-foreground">
              Categories Offered
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = selectedCategories.includes(cat.slug)
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(cat.slug)
                          ? prev.filter((c) => c !== cat.slug)
                          : [...prev, cat.slug]
                      )
                    }
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer',
                      selected
                        ? 'border-[#0F6E6E] bg-[#E6F2F2] text-[#0A4F4F] dark:bg-[#132A2A] dark:text-white'
                        : 'border-border bg-background text-muted-foreground'
                    )}
                  >
                    {selected ? '✓ ' : '+ '}
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="rounded-xl bg-[#0F6E6E] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0A4F4F] transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Store Profile'}
            </button>
          </div>
        </form>
      )}

      {/* Tab Content: Location & Directions */}
      {activeTab === 'location' && (
        <form onSubmit={handleSaveLocation} className="space-y-4">
          <LocationPicker value={locationVal} onChange={setLocationVal} />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingLocation}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F6E6E] px-6 py-3 text-sm font-bold text-white hover:bg-[#0A4F4F] transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {savingLocation ? 'Saving Location...' : 'Save Location & Privacy Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
