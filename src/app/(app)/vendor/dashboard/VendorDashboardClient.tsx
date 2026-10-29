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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category, Product, StockStatus, UserProfile, Vendor } from '@/lib/types'
import { NMU_DEFAULT_COORDS } from '@/lib/marketplace-data'
import { LocationPicker, LocationValue } from '@/components/vendor/LocationPicker'
import { formatNaira, isListingStale, normalizeWhatsAppNumber } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface VendorDashboardClientProps {
  user: { id: string; email?: string }
  profile: UserProfile
  vendor: Vendor
  initialProducts: Product[]
  categories: Category[]
}

export function VendorDashboardClient({
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

  // Store & WhatsApp settings state
  const [shopName, setShopName] = useState(vendor.shop_name)
  const [whatsappNumber, setWhatsappNumber] = useState(vendor.whatsapp_number)
  const [description, setDescription] = useState(vendor.description)
  const [deptInfo, setDeptInfo] = useState(vendor.department_or_business_info || '')
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
  const missingPhotoProducts = products.filter(
    (p) => !p.images || p.images.length === 0 || p.needs_seller_photo
  )

  const displayedProducts =
    activeTab === 'pending_review'
      ? pendingProducts
      : activeTab === 'out_of_stock'
      ? outOfStockProducts
      : products

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

  // Re-confirm stale listing availability with one tap
  const handleReconfirmListing = async (productId: string) => {
    setBusyProductId(productId)
    try {
      const supabase = createClient()
      const nowIso = new Date().toISOString()
      const { error } = await supabase
        .from('products')
        .update({ last_confirmed_at: nowIso })
        .eq('id', productId)

      if (error) {
        toast.error(error.message)
        return
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, last_confirmed_at: nowIso } : p
        )
      )
      toast.success('Availability confirmed for the next 14 days')
    } finally {
      setBusyProductId(null)
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
      toast.success('Product deleted')
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

      toast.success('Location & Google Maps settings saved immediately!')
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
          whatsapp_number: cleanPhone,
          description: description.trim(),
          department_or_business_info: deptInfo.trim() || null,
        })
        .eq('id', vendor.id)

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Store profile & WhatsApp contact updated!')
      router.refresh()
    } finally {
      setSavingSettings(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Vendor Header */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs min-w-0">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {vendor.verification_status === 'verified' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                Verified Storefront
              </span>
            ) : vendor.verification_status === 'suspended' ? (
              <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                Suspended
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                Pending Admin Verification
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {vendor.shop_name}
          </h1>
          <p className="text-xs text-slate-500">
            WhatsApp: +{vendor.whatsapp_number} · Pickup: {vendor.location_label}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/vendors/${vendor.slug || vendor.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#0F6E6E]" />
            View Public Storefront
          </Link>

          <Link
            href="/vendor/products/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F6E6E] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0A4F4F] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Stale listings alert if any */}
      {staleProducts.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>{staleProducts.length} listing(s) need availability confirmation:</strong>{' '}
              Confirm that these items are still in stock so buyers aren&apos;t shown outdated products.
            </div>
          </div>
        </div>
      )}

      {/* Missing verified seller photos alert */}
      {missingPhotoProducts.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>{missingPhotoProducts.length} listing(s) flagged for seller photo upload:</strong>{' '}
              Upload actual photos showing the real product, colour, model, pack quantity, and included accessories. Do not use unrelated stock images.
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 w-full max-w-full overflow-x-auto no-scrollbar pb-1 border-b border-border">
        {[
          { id: 'all', label: `All Products (${products.length})`, icon: Package },
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
            id: 'location',
            label: 'Location & Directions',
            icon: MapPin,
          },
          {
            id: 'settings',
            label: 'Store & WhatsApp Settings',
            icon: Store,
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

      {/* Tab Content: Products List */}
      {(activeTab === 'all' ||
        activeTab === 'pending_review' ||
        activeTab === 'out_of_stock') && (
        <div className="space-y-4">
          <div className="rounded-xl bg-[#E6F2F2]/60 border border-[#0F6E6E]/25 px-4 py-2.5 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong>Tip:</strong> Updating a product&apos;s <strong>price</strong> or{' '}
              <strong>stock status</strong> saves immediately. Changing photos or title sends the item back to the review queue.
            </span>
            <Link
              href="/vendor/products/new"
              className="font-bold text-[#0F6E6E] hover:underline"
            >
              + Add Product
            </Link>
          </div>

          {displayedProducts.length > 0 ? (
            <div className="space-y-3">
              {displayedProducts.map((product) => {
                const stale = isListingStale(product.last_confirmed_at, 14)
                return (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
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

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/product/${product.slug || product.id}`}
                            className="text-sm font-bold text-slate-900 hover:text-[#0F6E6E]"
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
                              Pending Admin Review
                            </span>
                          )}
                          {product.status === 'rejected' && (
                            <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold text-red-800">
                              Rejected
                            </span>
                          )}
                          {product.status === 'suspended' && (
                            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-800">
                              Suspended
                            </span>
                          )}
                          {(!product.images || product.images.length === 0) && (
                            <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold text-amber-950">
                              Flagged: Seller photo required
                            </span>
                          )}
                        </div>

                        {product.rejection_reason && product.status === 'rejected' && (
                          <p className="text-xs text-red-700 font-medium">
                            Rejection reason: {product.rejection_reason}
                          </p>
                        )}

                        {/* Inline Price Editor */}
                        <div className="flex items-center gap-2 pt-0.5">
                          {editingPriceId === product.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={0}
                                value={draftPrice}
                                onChange={(e) => setDraftPrice(e.target.value)}
                                className="w-28 h-8 rounded-lg border border-[#0F6E6E] px-2.5 text-xs font-bold text-slate-900"
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
                                className="h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-600 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm font-extrabold text-slate-900">
                                {formatNaira(product.price)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPriceId(product.id)
                                  setDraftPrice(String(product.price))
                                }}
                                className="text-[11px] font-semibold text-[#0F6E6E] hover:underline cursor-pointer"
                              >
                                Change price
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Controls: Stock Toggle, Reconfirm, Edit, Delete */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
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
                            : 'border-slate-300 bg-slate-100 text-slate-700'
                        )}
                      >
                        <option value="available">Available (In Stock)</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock (Hidden)</option>
                      </select>

                      {stale && (
                        <button
                          type="button"
                          onClick={() => handleReconfirmListing(product.id)}
                          disabled={busyProductId === product.id}
                          className="inline-flex items-center gap-1 h-9 rounded-lg border border-amber-300 bg-amber-50 px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Confirm In Stock
                        </button>
                      )}

                      <Link
                        href={`/vendor/products/${product.id}/edit`}
                        className="inline-flex items-center gap-1 h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id, product.title)}
                        disabled={busyProductId === product.id}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
              <Package className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="text-base font-bold text-slate-900">
                {activeTab === 'pending_review'
                  ? 'No products waiting for review'
                  : activeTab === 'out_of_stock'
                  ? 'No out-of-stock products'
                  : 'You have not added any products yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Add your safety boots, action rigs, electronics, books, or hostel supplies with clear photos and sizes so NMU students can find them.
              </p>
              <Link
                href="/vendor/products/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F6E6E] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0A4F4F]"
              >
                <Plus className="h-4 w-4" />
                Add Your First Product
              </Link>
            </div>
          )}
        </div>
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

      {/* Tab Content: Store Profile & WhatsApp Settings */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveStoreSettings}
          className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 max-w-3xl"
        >
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Store Profile & WhatsApp Contact Settings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your shop name, description, and the WhatsApp number buyers message when ordering.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shop Name *
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Ordering Number *
              </label>
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department or Business Tagline
            </label>
            <input
              type="text"
              value={deptInfo}
              onChange={(e) => setDeptInfo(e.target.value)}
              placeholder="e.g. Marine Engineering · Verified Student Seller"
              className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="rounded-xl bg-[#0F6E6E] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0A4F4F] transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Store Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
