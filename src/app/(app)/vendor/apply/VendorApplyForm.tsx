'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Upload,
  User,
  Sparkles,
  Building2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CampusArea, Category, SellerType, UserProfile, Vendor } from '@/lib/types'
import { NMU_DEFAULT_COORDS } from '@/lib/marketplace-data'
import { getVendorInitials } from '@/components/cards/VendorCard'
import { LocationPicker, LocationValue } from '@/components/vendor/LocationPicker'
import { normalizeWhatsAppNumber } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface VendorApplyFormProps {
  user: { id: string; email?: string; full_name?: string; avatar_url?: string }
  profile: UserProfile
  existingVendor: Vendor | null
  categories: Category[]
}

function slugifyShopName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) +
    '-' +
    Math.random().toString(36).slice(2, 6)
  )
}

async function compressImageToDataUrl(file: File, maxSize = 256): Promise<string> {
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

export function VendorApplyForm({
  user,
  profile,
  existingVendor,
  categories,
}: VendorApplyFormProps) {
  const router = useRouter()

  const defaultGoogleName = profile.full_name || user.full_name || ''
  const defaultGoogleAvatar =
    existingVendor?.logo_url ?? profile.avatar_url ?? user.avatar_url ?? null

  const [shopName, setShopName] = useState(
    existingVendor?.shop_name || defaultGoogleName
  )
  const [logoUrl, setLogoUrl] = useState<string | null>(defaultGoogleAvatar)
  const [sellerType, setSellerType] = useState<SellerType>(
    existingVendor?.seller_type ||
      (existingVendor ? (existingVendor.is_student ? 'student' : 'independent') : 'student')
  )
  const [businessName, setBusinessName] = useState(
    existingVendor?.business_name || ''
  )
  const [campus, setCampus] = useState<CampusArea>(
    existingVendor?.campus || 'Okerenkoko'
  )
  const [openingHours, setOpeningHours] = useState(
    existingVendor?.opening_hours || 'Mon–Sat, 8:00 AM – 7:00 PM'
  )
  const [whatsappNumber, setWhatsappNumber] = useState(
    existingVendor?.whatsapp_number || ''
  )
  const [description, setDescription] = useState(
    existingVendor?.description || ''
  )
  const [deptOrBusinessInfo, setDeptOrBusinessInfo] = useState(
    existingVendor?.department_or_business_info || ''
  )
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    existingVendor?.categories_offered || ['maritime-cadet-gear']
  )

  const [locationVal, setLocationVal] = useState<LocationValue>({
    latitude: existingVendor?.latitude || NMU_DEFAULT_COORDS.latitude,
    longitude: existingVendor?.longitude || NMU_DEFAULT_COORDS.longitude,
    location_type: existingVendor?.location_type || 'pickup_point',
    location_visibility: existingVendor?.location_visibility || 'approximate',
    location_label:
      existingVendor?.location_label || 'Near NMU Main Campus Gate, Okerenkoko',
    pickup_options:
      existingVendor?.pickup_options ||
      'Same-day pickup at Okerenkoko Campus Gate or landmark',
    delivery_available: existingVendor?.delivery_available ?? true,
    delivery_coverage:
      existingVendor?.delivery_coverage || 'All NMU hostels & Okerenkoko',
    pinConfirmed: Boolean(existingVendor?.location_confirmed_at),
  })

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const dataUrl = await compressImageToDataUrl(file, 240)
      setLogoUrl(dataUrl)
      toast.success('Profile photo / logo updated!')
    } catch {
      toast.error('Could not process image. Please try another photo.')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanPhone = normalizeWhatsAppNumber(whatsappNumber)
    if (!cleanPhone) {
      toast.error(
        'Please enter a valid Nigerian or international WhatsApp phone number (e.g. 08031234567).'
      )
      return
    }

    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category you offer.')
      return
    }

    if (
      locationVal.location_type !== 'delivery_only' &&
      !locationVal.pinConfirmed
    ) {
      toast.error(
        'Please review the map preview and click "Confirm Pin Location" before submitting.'
      )
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const slug = existingVendor?.slug || slugifyShopName(shopName)

      const payload = {
        user_id: user.id,
        shop_name: shopName.trim(),
        slug,
        logo_url: logoUrl,
        description: description.trim(),
        whatsapp_number: cleanPhone,
        categories_offered: selectedCategories,
        pickup_options: locationVal.pickup_options.trim(),
        delivery_available:
          locationVal.delivery_available ||
          locationVal.location_type === 'delivery_only',
        delivery_coverage: locationVal.delivery_coverage.trim() || null,
        is_student: sellerType === 'student',
        seller_type: sellerType,
        business_name: sellerType === 'business' ? businessName.trim() || shopName.trim() : null,
        campus,
        opening_hours: openingHours.trim() || 'Mon–Sat, 8:00 AM – 7:00 PM',
        department_or_business_info: deptOrBusinessInfo.trim() || null,
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
        location_confirmed_at: new Date().toISOString(),
      }

      const { error } = existingVendor
        ? await supabase
            .from('vendors')
            .update(payload)
            .eq('id', existingVendor.id)
        : await supabase.from('vendors').insert({
            ...payload,
            verification_status: 'pending',
          })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success(
        existingVendor
          ? 'Storefront profile updated!'
          : 'Vendor storefront created! Opening your Vendor Dashboard...'
      )
      router.push('/vendor/dashboard')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing Application Status Banner */}
      {existingVendor && (
        <div
          className={cn(
            'rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4',
            existingVendor.verification_status === 'verified'
              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
              : existingVendor.verification_status === 'rejected'
              ? 'border-red-200 bg-red-50 text-red-950'
              : 'border-amber-200 bg-amber-50/80 text-amber-950'
          )}
        >
          <div className="flex items-start gap-3">
            {existingVendor.verification_status === 'verified' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : existingVendor.verification_status === 'rejected' ? (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h2 className="text-sm font-bold">
                Storefront Status:{' '}
                <span className="capitalize">
                  {existingVendor.verification_status}
                </span>
              </h2>
              <p className="text-xs opacity-90">
                {existingVendor.verification_status === 'verified'
                  ? 'Your vendor storefront is verified and live. Manage your products, food, services, and location from your dashboard.'
                  : 'Your vendor application is under review. You can already customize your storefront and add listings.'}
              </p>
            </div>
          </div>

          <Link
            href="/vendor/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F6E6E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0A4F4F] shrink-0"
          >
            Go to Vendor Dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {existingVendor
            ? 'Update Your Vendor Storefront'
            : 'Create Your Jetty Storefront'}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We prefilled your Google name and photo as a starting point. Choose whether you are a student seller, independent seller, or business, and customize your public storefront.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Seller Account Type Selection */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              1. What kind of seller are you?
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Don&apos;t pretend to be a company if you&apos;re selling personal items — buyers trust honest profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'student' as SellerType,
                title: 'Student Seller',
                desc: 'NMU student selling cadet gear, textbooks, gadgets, or hostel items.',
                icon: User,
              },
              {
                id: 'independent' as SellerType,
                title: 'Independent Seller',
                desc: 'Regularly selling fruit salads, cooked food, tailoring, or campus services.',
                icon: Sparkles,
              },
              {
                id: 'business' as SellerType,
                title: 'Business / Shop',
                desc: 'Established shop or brand in Okerenkoko, Kurutie, or Warri jetty.',
                icon: Building2,
              },
            ].map((opt) => {
              const Icon = opt.icon
              const active = sellerType === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSellerType(opt.id)}
                  className={cn(
                    'flex flex-col items-start text-left rounded-xl border p-4 transition-all cursor-pointer',
                    active
                      ? 'border-[#0F6E6E] bg-[#E6F2F2]/60 dark:bg-[#132A2A] ring-1 ring-[#0F6E6E]'
                      : 'border-border bg-background hover:border-[#0F6E6E]/40'
                  )}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <Icon className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A]" />
                    <span>{opt.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {opt.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Public Identity (Avatar/Logo + Display Name + Description) */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-bold text-foreground">
            2. Public Storefront Identity &amp; Contact
          </h2>

          {/* Avatar / Logo with Google Default + Upload Replacement */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/25 text-[#0F6E6E] dark:text-[#E8B84A] font-extrabold text-xl overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Storefront avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{getVendorInitials(shopName || 'Jetty Seller')}</span>
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <p className="text-xs font-bold text-foreground">
                Profile Photo or Business Logo
              </p>
              <p className="text-xs text-muted-foreground">
                Defaults to your Google profile photo (or generated initials). Upload a custom photo or business logo anytime.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <label className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F6E6E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0A4F4F] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{uploadingAvatar ? 'Processing...' : 'Upload Photo / Logo'}</span>
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
                    Use Initials Avatar
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
                placeholder="e.g. Naga Cadet Supplies or Amaka Fresh Bowls"
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
              {defaultGoogleName && shopName !== defaultGoogleName && (
                <button
                  type="button"
                  onClick={() => setShopName(defaultGoogleName)}
                  className="text-[11px] text-[#0F6E6E] hover:underline mt-1 cursor-pointer"
                >
                  Use Google name ({defaultGoogleName})
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                WhatsApp Ordering Number *
              </label>
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 08031234567"
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Publicly visible on your storefront for WhatsApp orders.
              </p>
            </div>
          </div>

          {sellerType === 'business' && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Registered Business Name / CAC Info (Optional)
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Pere Creek Ventures Ltd (Optional — verified by Jetty Admin)"
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Short Store Description (What do you sell or offer?) *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the items, food, or services you offer and what buyers should know..."
              className="w-full rounded-xl border border-input bg-background p-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Campus Served *
              </label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value as CampusArea)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              >
                <option value="Okerenkoko">Okerenkoko Campus</option>
                <option value="Kurutie">Kurutie Campus</option>
                <option value="Both">Both (Okerenkoko &amp; Kurutie)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Opening Hours / Availability
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="e.g. Mon–Sat, 8am – 7pm"
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {sellerType === 'student'
                  ? 'Department & Level *'
                  : 'Specialty / Shop Tagline *'}
              </label>
              <input
                type="text"
                required
                value={deptOrBusinessInfo}
                onChange={(e) => setDeptOrBusinessInfo(e.target.value)}
                placeholder={
                  sellerType === 'student'
                    ? 'e.g. Marine Engineering · 300L'
                    : 'e.g. Fresh Fruit Bowls & Tailoring'
                }
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>
          </div>

          {/* Categories Offered */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="block text-xs font-semibold text-foreground">
              Categories You Sell or Offer *
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = selectedCategories.includes(cat.slug)
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => toggleCategory(cat.slug)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors cursor-pointer',
                      selected
                        ? 'border-[#0F6E6E] bg-[#E6F2F2] text-[#0A4F4F] dark:bg-[#132A2A] dark:text-white'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {selected ? '✓ ' : '+ '}
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 3. Interactive Location Picker */}
        <LocationPicker value={locationVal} onChange={setLocationVal} />

        {/* 4. Verification Notice & Submit */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground max-w-xl">
            <ShieldCheck className="h-5 w-5 text-[#0F6E6E] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-foreground">Free Honest Verification:</strong> A Google account authenticates your login, and Jetty Admin verifies your identity &amp; WhatsApp number before awarding the Verified Vendor badge.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#0F6E6E] px-6 py-3 text-sm font-bold text-white hover:bg-[#0A4F4F] transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            {submitting
              ? 'Saving Storefront...'
              : existingVendor
              ? 'Save Storefront Changes'
              : 'Launch My Storefront'}
          </button>
        </div>
      </form>
    </div>
  )
}
