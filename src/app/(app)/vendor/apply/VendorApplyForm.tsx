'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category, UserProfile, Vendor } from '@/lib/types'
import { NMU_DEFAULT_COORDS } from '@/lib/marketplace-data'
import { LocationPicker, LocationValue } from '@/components/vendor/LocationPicker'
import { normalizeWhatsAppNumber } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface VendorApplyFormProps {
  user: { id: string; email?: string }
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

export function VendorApplyForm({
  user,
  profile,
  existingVendor,
  categories,
}: VendorApplyFormProps) {
  const router = useRouter()

  const [shopName, setShopName] = useState(existingVendor?.shop_name || '')
  const [whatsappNumber, setWhatsappNumber] = useState(
    existingVendor?.whatsapp_number || ''
  )
  const [description, setDescription] = useState(
    existingVendor?.description || ''
  )
  const [isStudent, setIsStudent] = useState(
    existingVendor ? existingVendor.is_student : true
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
    location_type: existingVendor?.location_type || 'shop',
    location_visibility: existingVendor?.location_visibility || 'exact',
    location_label:
      existingVendor?.location_label || 'Near NMU Main Campus Gate, Okerenkoko',
    pickup_options:
      existingVendor?.pickup_options ||
      'Same-day pickup at Okerenkoko Campus Gate or shop',
    delivery_available: existingVendor?.delivery_available ?? true,
    delivery_coverage:
      existingVendor?.delivery_coverage || 'All NMU hostels & Okerenkoko',
    pinConfirmed: Boolean(existingVendor?.location_confirmed_at),
  })

  const [submitting, setSubmitting] = useState(false)

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
      toast.error('Please select at least one product category.')
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
        description: description.trim(),
        whatsapp_number: cleanPhone,
        categories_offered: selectedCategories,
        pickup_options: locationVal.pickup_options.trim(),
        delivery_available:
          locationVal.delivery_available ||
          locationVal.location_type === 'delivery_only',
        delivery_coverage: locationVal.delivery_coverage.trim() || null,
        is_student: isStudent,
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

      // Switch user's active_mode to vendor
      await supabase
        .from('profiles')
        .update({ active_mode: 'vendor' })
        .eq('id', user.id)

      toast.success(
        existingVendor
          ? 'Storefront & location settings updated!'
          : 'Vendor application submitted! Opening your Vendor Dashboard...'
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
                  ? 'Your vendor storefront is verified and live. You can manage your products and location from your dashboard.'
                  : existingVendor.verification_status === 'rejected'
                  ? `Reason: ${
                      existingVendor.rejection_reason ||
                      'Please review and update your contact details.'
                    }`
                  : 'Your vendor application is received. You can already set up your storefront and submit products to the review queue.'}
              </p>
            </div>
          </div>

          <Link
            href="/vendor/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 shrink-0"
          >
            Go to Vendor Dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-900">
          <Store className="h-3.5 w-3.5 text-blue-700" />
          NMU & Okerenkoko Seller Onboarding
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {existingVendor
            ? 'Update Your Vendor Storefront'
            : 'Apply to Sell on IslandHub'}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Set up your shop name, WhatsApp ordering number, product categories, and pickup pin. Once approved, your storefront appears in the verified directory and you manage your own inventory.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Store Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900">
            Store & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shop / Storefront Name *
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. NMU Cadet Quartermaster & Gear"
                className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Business / Contact Number *
              </label>
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 08031234567 or +2348031234567"
                className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Buyers will tap a button to message this number directly on WhatsApp.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Description (What do you sell?) *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the products you stock (e.g. steel-toe safety boots, complete action rigs, beret badges, power banks, hostel essentials)..."
              className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            />
          </div>

          {/* Seller Type & Verification Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seller Type
              </label>
              <select
                value={isStudent ? 'student' : 'local_shop'}
                onChange={(e) => setIsStudent(e.target.value === 'student')}
                className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              >
                <option value="student">NMU Student Seller</option>
                <option value="local_shop">
                  Okerenkoko / Kurutie Local Shop or Merchant
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isStudent
                  ? 'Department & Level (for lightweight student check) *'
                  : 'Shop Location / Business Details *'}
              </label>
              <input
                type="text"
                required
                value={deptOrBusinessInfo}
                onChange={(e) => setDeptOrBusinessInfo(e.target.value)}
                placeholder={
                  isStudent
                    ? 'e.g. Marine Engineering · 300L'
                    : 'e.g. Okerenkoko Jetty Road Opposite Main Market'
                }
                className="w-full h-11 rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Product Categories */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Product Categories You Offer *
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
                        ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
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

        {/* Interactive Location Picker */}
        <LocationPicker value={locationVal} onChange={setLocationVal} />

        {/* Lightweight Verification Notice & Submit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 text-xs text-slate-600 max-w-xl">
            <ShieldCheck className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Lightweight Verification:</strong> We check your identity and WhatsApp contact details (one-time student check or shop check) before displaying the Verified Vendor badge. We do not retain copies of student IDs.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#1E3A8A] px-6 py-3 text-sm font-bold text-white hover:bg-blue-900 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            {submitting
              ? 'Saving Storefront...'
              : existingVendor
              ? 'Save Storefront Changes'
              : 'Submit Vendor Application'}
          </button>
        </div>
      </form>
    </div>
  )
}
