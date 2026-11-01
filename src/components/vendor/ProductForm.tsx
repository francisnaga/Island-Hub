'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Info,
  Package,
  Utensils,
  Wrench,
  Building2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Category,
  ListingType,
  Product,
  ProductCondition,
  StockStatus,
  Vendor,
} from '@/lib/types'
import { SERVICES_LIST } from '@/lib/services-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { isImageFile, compressImageFile } from '@/lib/image-compression'

interface ProductFormProps {
  vendor: Vendor
  categories: Category[]
  existingProduct?: Product | null
  initialType?: ListingType
}

function slugifyProductTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 52) +
    '-' +
    Math.random().toString(36).slice(2, 6)
  )
}

export function ProductForm({
  vendor,
  categories,
  existingProduct,
  initialType,
}: ProductFormProps) {
  const router = useRouter()

  const [listingType, setListingType] = useState<ListingType>(
    existingProduct?.listing_type || initialType || 'product'
  )
  const [title, setTitle] = useState(existingProduct?.title || '')
  const [categoryId, setCategoryId] = useState(
    existingProduct?.category_id || categories[0]?.id || ''
  )
  const [campus, setCampus] = useState<'Okerenkoko' | 'Kurutie'>(
    existingProduct?.campus === 'Kurutie'
      ? 'Kurutie'
      : vendor?.campus === 'Kurutie'
      ? 'Kurutie'
      : 'Okerenkoko'
  )
  const [price, setPrice] = useState(
    existingProduct ? String(existingProduct.price) : ''
  )
  const [condition, setCondition] = useState<ProductCondition>(
    existingProduct?.condition || 'new'
  )
  const [stockStatus, setStockStatus] = useState<StockStatus>(
    existingProduct?.stock_status || 'available'
  )
  const [stockQuantity, setStockQuantity] = useState(
    existingProduct?.stock_quantity ? String(existingProduct.stock_quantity) : '1'
  )
  const [description, setDescription] = useState(
    existingProduct?.description || ''
  )

  // Food-specific fields
  const [foodLeadTime, setFoodLeadTime] = useState(
    existingProduct?.food_lead_time || 'Made to order · Ready in 25 mins'
  )
  const [foodAllergenInfo, setFoodAllergenInfo] = useState(
    existingProduct?.food_allergen_info || ''
  )

  // Service-specific fields
  const [serviceSlug, setServiceSlug] = useState(
    existingProduct?.variants?.service_slug || 'haircuts'
  )
  const [serviceTurnaround, setServiceTurnaround] = useState(
    existingProduct?.service_turnaround || '24–48 hours'
  )
  const [serviceArea, setServiceArea] = useState(
    existingProduct?.service_area ||
      `${existingProduct?.campus || (vendor?.campus === 'Kurutie' ? 'Kurutie' : 'Okerenkoko')} Campus & Hostels`
  )

  // Housing / Student Room specific fields
  const [roomTypeLabel, setRoomTypeLabel] = useState(
    existingProduct?.variants?.room_type_label || 'Self-contain'
  )
  const [rentPeriod, setRentPeriod] = useState(
    existingProduct?.variants?.period || 'session'
  )
  const [distanceHint, setDistanceHint] = useState(
    existingProduct?.variants?.distance_hint || '5 min walk to gate'
  )
  const [roomLocationLabel, setRoomLocationLabel] = useState(
    existingProduct?.variants?.location_label || vendor?.location_label || 'Near the main gate'
  )
  const [bedspaces, setBedspaces] = useState(
    existingProduct?.variants?.bedspaces || '1 to 2'
  )
  const [utilities, setUtilities] = useState(
    existingProduct?.variants?.utilities || 'Water included'
  )
  const [otherFees, setOtherFees] = useState(
    existingProduct?.variants?.other_fees || 'None'
  )
  const [roomFeaturesInput, setRoomFeaturesInput] = useState(
    existingProduct?.variants?.features?.join(', ') ||
      'Water, Power backup, Fenced compound, Tiled floor'
  )

  const [images, setImages] = useState<string[]>(
    existingProduct?.images || []
  )
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const [sizesInput, setSizesInput] = useState(
    existingProduct?.variants?.sizes?.join(', ') || ''
  )
  const [colorsInput, setColorsInput] = useState(
    existingProduct?.variants?.colors?.join(', ') || ''
  )
  const [customVariantLabel, setCustomVariantLabel] = useState(
    existingProduct?.variants?.custom_label || ''
  )

  const [submitting, setSubmitting] = useState(false)

  // Category Request Modal State
  const [reqCategoryModalOpen, setReqCategoryModalOpen] = useState(false)
  const [requestedCategoryName, setRequestedCategoryName] = useState('')
  const [requestedCategoryDesc, setRequestedCategoryDesc] = useState('')
  const [submittingCategoryReq, setSubmittingCategoryReq] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isImageFile(file)) {
      toast.error('Please upload an image file (JPG, PNG, WebP, or iPhone photo).')
      return
    }

    setUploadingImage(true)
    try {
      // 1. Always compress client-side first so iPhone photos (12MP-48MP) become ~150KB
      const { file: compressedFile, dataUrl } = await compressImageFile(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.82,
      })

      const supabase = createClient()
      const ext = compressedFile.name.split('.').pop() || 'jpg'
      const path = `${vendor.id}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}.${ext}`

      // 2. Upload the compressed ~150KB file instead of the heavy raw iPhone image
      const { error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(path, compressedFile, {
          upsert: false,
          contentType: compressedFile.type,
        })

      if (!uploadErr) {
        const { data: pubData } = supabase.storage
          .from('product-images')
          .getPublicUrl(path)

        if (pubData?.publicUrl) {
          setImages((prev) => [...prev, pubData.publicUrl])
          toast.success('Photo compressed & uploaded!')
          return
        }
      }

      // 3. Fallback to client-side compressed base64 if storage is offline
      setImages((prev) => [...prev, dataUrl])
      toast.success('Photo compressed & attached!')
    } catch {
      toast.error('Could not process photo. Please try another image.')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim()
    if (!url) return
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      toast.error('Please enter a valid image or video URL.')
      return
    }
    const lowerUrl = url.toLowerCase()
    const bannedStockDomains = [
      'unsplash.com',
      'pexels.com',
      'pixabay.com',
      'shutterstock.com',
      'istockphoto.com',
      'freepik.com',
    ]
    if (bannedStockDomains.some((domain) => lowerUrl.includes(domain))) {
      toast.error(
        'Generic stock photos are not allowed. Please upload an actual photo of the item or room.'
      )
      return
    }
    setImages((prev) => [...prev, url])
    setImageUrlInput('')
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleRequestCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestedCategoryName.trim()) return
    setSubmittingCategoryReq(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('category_requests').insert({
        vendor_id: vendor.id,
        vendor_name: vendor.shop_name,
        vendor_whatsapp: vendor.whatsapp_number,
        name: requestedCategoryName.trim(),
        description: requestedCategoryDesc.trim() || null,
        status: 'pending',
      })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success(
        `Category request for "${requestedCategoryName}" submitted! Admin (Naga) will review and approve it shortly.`
      )
      setRequestedCategoryName('')
      setRequestedCategoryDesc('')
      setReqCategoryModalOpen(false)
    } catch {
      toast.error('Failed to submit category request')
    } finally {
      setSubmittingCategoryReq(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const numericPrice = Number(price)
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      toast.error('Please enter a valid price greater than ₦0.')
      return
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in the title and description.')
      return
    }

    if (images.length === 0) {
      toast.error('Every listing must have at least one clear photo or visual.')
      return
    }

    const sizes = sizesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const colors = colorsInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
    const roomFeatures = roomFeaturesInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)

    // Strict Admin Approval Policy: Every new submission and any content change goes to 'pending_review'
    const nextStatus = 'pending_review'

    const mappedRoomType: 'self_contain' | 'single_room' | 'bedspace' =
      roomTypeLabel === 'Bedspace'
        ? 'bedspace'
        : roomTypeLabel === 'Shared room'
        ? 'single_room'
        : 'self_contain'

    setSubmitting(true)
    try {
      const supabase = createClient()
      const payload = {
        vendor_id: vendor.id,
        category_id: categoryId,
        listing_type: listingType,
        title: title.trim(),
        slug: existingProduct?.slug || slugifyProductTitle(title),
        description: description.trim(),
        price: numericPrice,
        condition,
        stock_status: stockStatus,
        stock_quantity: Math.max(0, parseInt(stockQuantity || '1', 10) || 1),
        images,
        variants: {
          campus,
          ...(sizes.length > 0 ? { sizes } : {}),
          ...(colors.length > 0 ? { colors } : {}),
          ...(customVariantLabel.trim() ? { custom_label: customVariantLabel.trim() } : {}),
          ...(listingType === 'service' ? { service_slug: serviceSlug } : {}),
          ...(listingType === 'housing'
            ? {
                room_type: mappedRoomType,
                room_type_label: roomTypeLabel,
                period: rentPeriod,
                distance_hint: distanceHint.trim() || 'Walking distance to campus',
                location_label: roomLocationLabel.trim() || `Near ${campus} gate`,
                bedspaces: bedspaces.trim() || '1 to 2',
                rent_covers: `One ${rentPeriod}`,
                utilities: utilities.trim() || 'Water included',
                other_fees: otherFees.trim() || 'None',
                features: roomFeatures,
              }
            : {}),
        },
        food_lead_time: listingType === 'food' ? foodLeadTime.trim() || null : null,
        food_allergen_info: listingType === 'food' ? foodAllergenInfo.trim() || null : null,
        service_turnaround: listingType === 'service' ? serviceTurnaround.trim() || null : null,
        service_area: listingType === 'service' ? serviceArea.trim() || null : null,
        status: nextStatus,
        is_demo: false,
        last_confirmed_at: new Date().toISOString(),
      }

      const { error } = existingProduct
        ? await supabase
            .from('products')
            .update(payload)
            .eq('id', existingProduct.id)
        : await supabase.from('products').insert(payload)

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success(
        'Submitted to the Admin Review Queue! Your listing will go live once approved by Admin.'
      )

      router.push('/vendor/dashboard')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/vendor/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Vendor Dashboard
        </Link>
        <span className="text-xs text-muted-foreground">Store: {vendor.shop_name}</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-[family-name:var(--font-bricolage)]">
          {existingProduct ? 'Edit Listing' : 'Add a New Listing'}
        </h1>
        <p className="text-sm text-muted-foreground">
          List a physical item, meal, campus service, or student room/lodge under your storefront.
        </p>
      </div>

      {/* Listing Type Selector (4 Types: Product, Food, Service, Student Room) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            id: 'product' as ListingType,
            title: 'Physical Item',
            desc: 'Cadet gear, boots, electronics, books, hostel items',
            icon: Package,
          },
          {
            id: 'housing' as ListingType,
            title: 'Student Room / Lodge',
            desc: 'Self-contain, shared room, private room, bedspace',
            icon: Building2,
          },
          {
            id: 'service' as ListingType,
            title: 'Campus Service',
            desc: 'Haircuts, laundry, tailoring, repairs, tutoring',
            icon: Wrench,
          },
          {
            id: 'food' as ListingType,
            title: 'Meals & Drinks',
            desc: 'Cooked meals, fruit bowls, snacks & pastries',
            icon: Utensils,
          },
        ].map((opt) => {
          const Icon = opt.icon
          const active = listingType === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setListingType(opt.id)}
              className={cn(
                'flex flex-col items-start text-left rounded-xl border p-3.5 sm:p-4 transition-all cursor-pointer',
                active
                  ? 'border-[#0F6E6E] bg-[#E6F2F2]/60 dark:bg-[#132A2A] ring-1 ring-[#0F6E6E]'
                  : 'border-border bg-card hover:border-[#0F6E6E]/40'
              )}
            >
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
                <Icon className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
                <span>{opt.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{opt.desc}</p>
            </button>
          )
        })}
      </div>

      {/* Strict Moderation Rules Notice */}
      <div className="rounded-xl border border-[#0F6E6E]/25 bg-[#E6F2F2]/60 dark:bg-[#132A2A]/60 p-4 flex items-start gap-2.5 text-xs text-foreground">
        <Info className="h-4 w-4 text-[#0F6E6E] shrink-0 mt-0.5" />
        <div>
          <strong>Admin Approval Required:</strong> Every submission (items, rooms, services, and meals) is reviewed by the Jetty Super Admin before going live publicly. Make sure to upload a clear, authentic photo.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">
                {listingType === 'housing' ? 'Room / Lodge Headline *' : 'Listing Title *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  listingType === 'housing'
                    ? 'e.g. Self-contain, 5 min walk from the gate'
                    : listingType === 'food'
                    ? 'e.g. Fresh Tropical Fruit Salad Bowl — 750ml'
                    : listingType === 'service'
                    ? 'e.g. Cadet Uniform Tailoring & Nameplate Stitching'
                    : 'e.g. Heavy-Duty Cadet Steel-Toe Safety Boots (Black)'
                }
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>

            {listingType === 'service' ? (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Service Category *
                </label>
                <select
                  value={serviceSlug}
                  onChange={(e) => setServiceSlug(e.target.value)}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
                >
                  {SERVICES_LIST.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : listingType === 'housing' ? (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Room Type *
                </label>
                <select
                  value={roomTypeLabel}
                  onChange={(e) => setRoomTypeLabel(e.target.value)}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
                >
                  <option value="Self-contain">Self-contain</option>
                  <option value="Shared room">Shared room</option>
                  <option value="Private room">Private room</option>
                  <option value="Bedspace">Bedspace</option>
                </select>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-foreground">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => setReqCategoryModalOpen(true)}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    + Request New
                  </button>
                </div>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Mandatory Single Campus Location */}
          <div className="rounded-xl border border-border bg-muted/30 p-3.5 sm:p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-bold text-foreground">
                Campus Location *
              </label>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Single Campus Only
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'Okerenkoko', label: 'Okerenkoko Campus', hint: 'Permanent Site' },
                { id: 'Kurutie', label: 'Kurutie Campus', hint: 'Take-off Site' },
              ].map((opt) => {
                const isSelected = campus === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setCampus(opt.id as 'Okerenkoko' | 'Kurutie')
                      if (listingType === 'service' && (!serviceArea || serviceArea.includes('Campus'))) {
                        setServiceArea(`${opt.id} Campus & Hostels`)
                      }
                    }}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer',
                      isSelected
                        ? 'border-foreground bg-card ring-1 ring-foreground text-foreground shadow-xs'
                        : 'border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-foreground/30'
                    )}
                  >
                    <div>
                      <p className="text-xs font-bold">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground">{opt.hint}</p>
                    </div>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-foreground shrink-0 ml-2" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {listingType === 'housing'
                  ? 'Rent Amount (₦) *'
                  : listingType === 'service'
                  ? 'Starting Price (₦) *'
                  : 'Price (₦ Naira) *'}
              </label>
              <input
                type="number"
                min={50}
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={listingType === 'housing' ? 'e.g. 180000' : 'e.g. 14500'}
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>

            {listingType === 'housing' ? (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Rent Period *
                </label>
                <select
                  value={rentPeriod}
                  onChange={(e) => setRentPeriod(e.target.value)}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
                >
                  <option value="session">Per Session</option>
                  <option value="year">Per Year</option>
                  <option value="semester">Per Semester</option>
                  <option value="month">Per Month</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Condition / Type *
                </label>
                <select
                  value={condition}
                  onChange={(e) =>
                    setCondition(e.target.value as ProductCondition)
                  }
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
                >
                  <option value="new">Brand New / Fresh</option>
                  <option value="like_new">Like New</option>
                  <option value="good">Good (Pre-owned)</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Availability *
              </label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              >
                <option value="available">Available</option>
                <option value="low_stock">Low Stock / Limited Slots</option>
                <option value="out_of_stock">Unavailable</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {listingType === 'housing'
                  ? 'Available Units'
                  : listingType === 'food'
                  ? 'Daily Portions'
                  : 'Approx. Quantity'}
              </label>
              <input
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>
          </div>

          {/* Student Room / Lodge Specific Fields */}
          {listingType === 'housing' && (
            <div className="space-y-4 pt-3 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Walking Distance to Campus *
                  </label>
                  <input
                    type="text"
                    required
                    value={distanceHint}
                    onChange={(e) => setDistanceHint(e.target.value)}
                    placeholder="e.g. 5 min to gate"
                    className="w-full h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Street / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomLocationLabel}
                    onChange={(e) => setRoomLocationLabel(e.target.value)}
                    placeholder="e.g. Near the main gate, Kurutie"
                    className="w-full h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Bedspaces / Occupancy
                  </label>
                  <input
                    type="text"
                    value={bedspaces}
                    onChange={(e) => setBedspaces(e.target.value)}
                    placeholder="e.g. 1 to 2 or 2 per room"
                    className="w-full h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Utilities Included
                  </label>
                  <input
                    type="text"
                    value={utilities}
                    onChange={(e) => setUtilities(e.target.value)}
                    placeholder="e.g. Water included, Prepaid meter"
                    className="w-full h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Other Fees
                  </label>
                  <input
                    type="text"
                    value={otherFees}
                    onChange={(e) => setOtherFees(e.target.value)}
                    placeholder="e.g. None or Agreement fee"
                    className="w-full h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    What is there (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={roomFeaturesInput}
                    onChange={(e) => setRoomFeaturesInput(e.target.value)}
                    placeholder="Water, Power backup, Fenced compound, Tiled floor"
                    className="w-full h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Food & Drinks Specific Fields */}
          {listingType === 'food' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Preparation / Ordering Lead Time *
                </label>
                <input
                  type="text"
                  required
                  value={foodLeadTime}
                  onChange={(e) => setFoodLeadTime(e.target.value)}
                  placeholder="e.g. Made to order · Ready in 25 mins"
                  className="w-full h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Ingredients, Allergens &amp; Storage Guidance
                </label>
                <input
                  type="text"
                  value={foodAllergenInfo}
                  onChange={(e) => setFoodAllergenInfo(e.target.value)}
                  placeholder="e.g. Contains coconut/dairy. Keep chilled."
                  className="w-full h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
                />
              </div>
            </div>
          )}

          {/* Service Specific Fields */}
          {listingType === 'service' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Estimated Turnaround Time *
                </label>
                <input
                  type="text"
                  required
                  value={serviceTurnaround}
                  onChange={(e) => setServiceTurnaround(e.target.value)}
                  placeholder="e.g. Same day or 24–48 hours"
                  className="w-full h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Campus Service Area *
                </label>
                <input
                  type="text"
                  required
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Okerenkoko Hostels & Block C"
                  className="w-full h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {listingType === 'housing'
                ? 'About this room *'
                : "Full Description & What's Included *"}
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                listingType === 'housing'
                  ? 'Describe the room, bathroom/kitchenette setup, water supply, and compound security...'
                  : 'Describe the item, portion size, included accessories, or service details clearly...'
              }
              className="w-full rounded-xl border border-input bg-background p-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
            />
          </div>
        </div>

        {/* Variants (Sizes, Colours, Portion / Pack Label) — Hidden for Housing */}
        {listingType !== 'housing' && (
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Sizes, Colours or Portion / Pack Info (Optional)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Sizes (comma-separated)
                </label>
                <input
                  type="text"
                  value={sizesInput}
                  onChange={(e) => setSizesInput(e.target.value)}
                  placeholder="e.g. 40, 41, 42, 43 OR S, M, L"
                  className="w-full h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Colours / Flavours (comma-separated)
                </label>
                <input
                  type="text"
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  placeholder="e.g. Black, Dark Navy"
                  className="w-full h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Pack / Portion / Quote Note
                </label>
                <input
                  type="text"
                  value={customVariantLabel}
                  onChange={(e) => setCustomVariantLabel(e.target.value)}
                  placeholder="e.g. 750ml Bowl · Made to Order"
                  className="w-full h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
                />
              </div>
            </div>
          </div>
        )}

        {/* Photos / Visuals */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Photos or Video Visual *
            </h2>
            <p className="text-xs text-muted-foreground">
              Automatically compressed for fast loading on Okerenkoko &amp; Kurutie mobile networks.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#0F6E6E] bg-[#E6F2F2]/50 dark:bg-[#132A2A] px-5 py-3 text-xs font-bold text-[#0A4F4F] dark:text-[#E8B84A] hover:bg-[#E6F2F2] cursor-pointer shrink-0">
              <Upload className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A]" />
              {uploadingImage ? 'Compressing photo...' : 'Upload Photo from Device'}
              <input
                type="file"
                accept="image/*,image/heic,image/heif"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>

            <div className="flex-1 flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste direct image/video URL (https://...)"
                className="flex-1 h-11 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted px-4 text-xs font-semibold text-foreground hover:bg-muted/80 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add URL
              </button>
            </div>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-4/3 rounded-xl border border-border overflow-hidden bg-muted group"
                >
                  <img
                    src={img}
                    alt={`Listing preview ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1 text-white hover:bg-red-600 cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
                      Cover Visual
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1.5">
              <Package className="h-6 w-6 text-muted-foreground" />
              <span>No visual added yet. Upload a photo or paste a link above.</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/vendor/dashboard"
            className="rounded-xl border border-border bg-card px-5 py-3 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#0F6E6E] px-6 py-3 text-sm font-bold text-white hover:bg-[#0A4F4F] transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting
              ? 'Submitting for Review...'
              : existingProduct
              ? 'Submit Changes for Admin Approval'
              : 'Submit Listing for Admin Approval'}
          </button>
        </div>
      </form>

      {/* Category Request Modal */}
      {reqCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground">
                Request a New Category
              </h3>
              <button
                type="button"
                onClick={() => setReqCategoryModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Don&apos;t see a category that matches your product, meal, or service? Submit your request to the Admin (Naga) and it will be created upon review.
            </p>

            <form onSubmit={handleRequestCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Proposed Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={requestedCategoryName}
                  onChange={(e) => setRequestedCategoryName(e.target.value)}
                  placeholder="e.g. Photography &amp; Video, Barbing, Pastries"
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Description / Examples
                </label>
                <textarea
                  rows={2}
                  value={requestedCategoryDesc}
                  onChange={(e) => setRequestedCategoryDesc(e.target.value)}
                  placeholder="What items or services will you list in this category?"
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReqCategoryModalOpen(false)}
                  className="h-9 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCategoryReq}
                  className="h-9 px-4 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {submittingCategoryReq ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
