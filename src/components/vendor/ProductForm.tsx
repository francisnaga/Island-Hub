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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Category,
  Product,
  ProductCondition,
  StockStatus,
  Vendor,
} from '@/lib/types'
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

export function ProductForm({
  vendor,
  categories,
  existingProduct,
}: ProductFormProps) {
  const router = useRouter()

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

  const [submitting, setSubmitting] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be under 5MB.')
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

      if (uploadErr) {
        toast.error(
          `Upload error: ${uploadErr.message}. You can also paste an image URL below.`
        )
        return
      }

      const { data: pubData } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)

      if (pubData?.publicUrl) {
        setImages((prev) => [...prev, pubData.publicUrl])
        toast.success('Photo uploaded')
      }
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim()
    if (!url) return
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error('Please enter a valid http:// or https:// image URL.')
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
        'Generic stock photos are not allowed. Please upload an actual photo of the exact item you are selling.'
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
      toast.error('Please enter a valid product price greater than ₦0.')
      return
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in the product title and description.')
      return
    }

    if (images.length === 0) {
      toast.error('Please upload or add at least one clear product photo.')
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

    // Determine whether this edit triggers re-review or saves immediately
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
        },
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
          'Product submitted to the Admin Review Queue! It will go live once approved.'
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Vendor Dashboard
        </Link>
        <span className="text-xs text-slate-500">Store: {vendor.shop_name}</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {existingProduct ? 'Edit Product Listing' : 'Add a New Product'}
        </h1>
        <p className="text-sm text-slate-600">
          Provide clear product photos, accurate Naira pricing, and optional sizes or colours (ideal for safety boots, action rigs, uniforms, and shoes).
        </p>
      </div>

      {/* Moderation Rules Notice */}
      <div className="rounded-xl border border-[#0F6E6E]/25 bg-[#E6F2F2]/60 p-4 flex items-start gap-2.5 text-xs text-slate-700">
        <Info className="h-4 w-4 text-[#0F6E6E] shrink-0 mt-0.5" />
        <div>
          <strong>How review works:</strong> New products and changes to product titles, categories, or photos enter the administrator review queue before appearing publicly. Routine updates to <strong>price, stock status, or sizes/colours</strong> on an already-approved product save immediately.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Heavy-Duty Cadet Steel-Toe Safety Boots (Black)"
                className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price (₦ Naira) *
              </label>
              <input
                type="number"
                min={50}
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 18500"
                className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) =>
                  setCondition(e.target.value as ProductCondition)
                }
                className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
              >
                <option value="new">Brand New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good (Used)</option>
                <option value="fair">Fair</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Availability Status *
              </label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
              >
                <option value="available">Available (In Stock)</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Approx. Quantity
              </label>
              <input
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Include key specifications, material, what is included in the pack, and any helpful sizing notes..."
              className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
            />
          </div>
        </div>

        {/* Optional Variants (Sizes & Colours) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Sizes & Colour Variants (Optional)
            </h2>
            <p className="text-xs text-slate-500">
              Recommended for safety boots, action rigs, berets, and clothing. Leave blank for products that don&apos;t need variants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Available Sizes (comma-separated)
              </label>
              <input
                type="text"
                value={sizesInput}
                onChange={(e) => setSizesInput(e.target.value)}
                placeholder="e.g. 40, 41, 42, 43, 44, 45  OR  S, M, L, XL"
                className="w-full h-10 rounded-xl border border-slate-300 px-3.5 text-xs text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Available Colours / Styles (comma-separated)
              </label>
              <input
                type="text"
                value={colorsInput}
                onChange={(e) => setColorsInput(e.target.value)}
                placeholder="e.g. Black, Dark Navy, White"
                className="w-full h-10 rounded-xl border border-slate-300 px-3.5 text-xs text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Product Photos */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Product Photos *
            </h2>
            <p className="text-xs text-slate-500">
              Upload photos directly (JPG, PNG, WebP up to 5MB) or paste a direct image URL.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#0F6E6E] bg-[#E6F2F2]/50 px-5 py-3 text-xs font-bold text-[#0A4F4F] hover:bg-[#E6F2F2] cursor-pointer shrink-0">
              <Upload className="h-4 w-4 text-[#0F6E6E]" />
              {uploadingImage ? 'Uploading...' : 'Upload Photo from Device'}
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
                placeholder="Or paste image URL (https://...)"
                className="flex-1 h-11 rounded-xl border border-slate-300 px-3.5 text-xs text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
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
                  className="relative aspect-4/3 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 group"
                >
                  <img
                    src={img}
                    alt={`Product preview ${idx + 1}`}
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
                      Cover Photo
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-1.5">
              <Package className="h-6 w-6 text-slate-400" />
              <span>No photos added yet. Upload a photo or paste an image link above.</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/vendor/dashboard"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#0F6E6E] px-6 py-3 text-sm font-bold text-white hover:bg-[#0A4F4F] transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting
              ? 'Saving Product...'
              : existingProduct
              ? 'Save Product Changes'
              : 'Submit Product for Review'}
          </button>
        </div>
      </form>
    </div>
  )
}
