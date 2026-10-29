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
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ProductFormProps {
  vendor: Vendor
  categories: Category[]
  existingProduct?: Product | null
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

async function compressPhotoForPoorNetwork(file: File, maxWidth = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, maxWidth / img.width)
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas context unavailable'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ProductForm({
  vendor,
  categories,
  existingProduct,
}: ProductFormProps) {
  const router = useRouter()

  const [listingType, setListingType] = useState<ListingType>(
    existingProduct?.listing_type || 'product'
  )
  const [title, setTitle] = useState(existingProduct?.title || '')
  const [categoryId, setCategoryId] = useState(
    existingProduct?.category_id || categories[0]?.id || ''
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
  const [serviceTurnaround, setServiceTurnaround] = useState(
    existingProduct?.service_turnaround || '24–48 hours'
  )
  const [serviceArea, setServiceArea] = useState(
    existingProduct?.service_area || 'Okerenkoko & Kurutie Campus'
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image file size must be under 8MB.')
      return
    }

    setUploadingImage(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${vendor.id}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: false })

      if (!uploadErr) {
        const { data: pubData } = supabase.storage
          .from('product-images')
          .getPublicUrl(path)

        if (pubData?.publicUrl) {
          setImages((prev) => [...prev, pubData.publicUrl])
          toast.success('Photo uploaded')
          return
        }
      }

      // Low-bandwidth / offline bucket fallback: compress client-side to lightweight JPEG
      const compressed = await compressPhotoForPoorNetwork(file, 800)
      setImages((prev) => [...prev, compressed])
      toast.success('Photo optimized and attached!')
    } catch {
      toast.error('Could not process photo.')
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
        'Generic stock photos are not allowed. Please upload an actual photo of the item you are selling.'
      )
      return
    }
    setImages((prev) => [...prev, url])
    setImageUrlInput('')
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index))
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

    const isRoutineOnly =
      existingProduct &&
      existingProduct.status === 'approved' &&
      existingProduct.title === title.trim() &&
      existingProduct.category_id === categoryId &&
      JSON.stringify(existingProduct.images) === JSON.stringify(images)

    const nextStatus = existingProduct
      ? isRoutineOnly
        ? existingProduct.status
        : 'pending_review'
      : 'pending_review'

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
          ...(sizes.length > 0 ? { sizes } : {}),
          ...(colors.length > 0 ? { colors } : {}),
          ...(customVariantLabel.trim() ? { custom_label: customVariantLabel.trim() } : {}),
        },
        food_lead_time: listingType === 'food' ? foodLeadTime.trim() || null : null,
        food_allergen_info: listingType === 'food' ? foodAllergenInfo.trim() || null : null,
        service_turnaround: listingType === 'service' ? serviceTurnaround.trim() || null : null,
        service_area: listingType === 'service' ? serviceArea.trim() || null : null,
        status: nextStatus,
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

      if (existingProduct && isRoutineOnly) {
        toast.success('Price, stock & variants saved immediately!')
      } else {
        toast.success(
          'Listing submitted to the Admin Review Queue! It will appear publicly once approved.'
        )
      }

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
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {existingProduct ? 'Edit Listing' : 'Add a New Listing'}
        </h1>
        <p className="text-sm text-muted-foreground">
          List a physical product, made-to-order food/drink, or campus service under your storefront.
        </p>
      </div>

      {/* Listing Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            id: 'product' as ListingType,
            title: 'Physical Product',
            desc: 'Cadet gear, boots, electronics, books, hostel items',
            icon: Package,
          },
          {
            id: 'food' as ListingType,
            title: 'Food & Drinks',
            desc: 'Fruit salads, snacks, pastries, or made-to-order meals',
            icon: Utensils,
          },
          {
            id: 'service' as ListingType,
            title: 'Campus Service',
            desc: 'Tailoring, laundry, barbing, printing, repair',
            icon: Wrench,
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
                'flex flex-col items-start text-left rounded-xl border p-4 transition-all cursor-pointer',
                active
                  ? 'border-[#0F6E6E] bg-[#E6F2F2]/60 dark:bg-[#132A2A] ring-1 ring-[#0F6E6E]'
                  : 'border-border bg-card hover:border-[#0F6E6E]/40'
              )}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Icon className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A]" />
                <span>{opt.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
            </button>
          )
        })}
      </div>

      {/* Moderation Rules Notice */}
      <div className="rounded-xl border border-[#0F6E6E]/25 bg-[#E6F2F2]/60 dark:bg-[#132A2A]/60 p-4 flex items-start gap-2.5 text-xs text-foreground">
        <Info className="h-4 w-4 text-[#0F6E6E] shrink-0 mt-0.5" />
        <div>
          <strong>Approval Policy:</strong> Every listing requires a real photo/visual and administrator approval before appearing publicly. Routine updates to <strong>price, stock status, or sizes</strong> on an already-approved listing save immediately.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">
                Listing Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  listingType === 'food'
                    ? 'e.g. Fresh Tropical Fruit Salad Bowl — 750ml (Made to Order)'
                    : listingType === 'service'
                    ? 'e.g. Cadet Uniform Tailoring & Nameplate Stitching'
                    : 'e.g. Heavy-Duty Cadet Steel-Toe Safety Boots (Black)'
                }
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Category *
              </label>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {listingType === 'service' ? 'Starting Price (₦) *' : 'Price (₦ Naira) *'}
              </label>
              <input
                type="number"
                min={50}
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>

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
                {listingType === 'food' ? 'Daily Portions' : 'Approx. Quantity'}
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
              Full Description &amp; What&apos;s Included *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item, portion size, included accessories, or service details clearly..."
              className="w-full rounded-xl border border-input bg-background p-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
            />
          </div>
        </div>

        {/* Variants (Sizes, Colours, Portion / Pack Label) */}
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
              {uploadingImage ? 'Optimizing...' : 'Upload Photo from Device'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
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
              ? 'Submitting...'
              : existingProduct
              ? 'Save Changes'
              : 'Submit Listing for Approval'}
          </button>
        </div>
      </form>
    </div>
  )
}
