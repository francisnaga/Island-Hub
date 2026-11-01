'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Navigation, Check, X } from 'lucide-react'
import { CampusArea, UserProfile, Vendor } from '@/lib/types'
import { normalizeWhatsAppNumber } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface VendorApplyFormProps {
  user: { id: string; email?: string; full_name?: string; avatar_url?: string }
  profile: UserProfile
  existingVendor: Vendor | null
}

function digitsOnly(val: string): string {
  return String(val || '').replace(/\D/g, '')
}

const LEGACY_COORDS = new Set(['5.580668,5.34693', '5.6278,5.3915'])

export function VendorApplyForm({
  existingVendor,
}: VendorApplyFormProps) {
  const router = useRouter()

  const existingCoordKey =
    existingVendor?.latitude != null && existingVendor?.longitude != null
      ? `${existingVendor.latitude},${existingVendor.longitude}`
      : ''
  const hasRealExistingPin =
    existingVendor?.latitude != null &&
    existingVendor?.longitude != null &&
    !LEGACY_COORDS.has(existingCoordKey)

  const [shopName, setShopName] = useState(existingVendor?.shop_name || '')
  const [whatsappNumber, setWhatsappNumber] = useState(
    existingVendor?.whatsapp_number || ''
  )
  const [campus, setCampus] = useState<CampusArea>(
    existingVendor?.campus || 'Okerenkoko'
  )
  const [locationLabel, setLocationLabel] = useState(
    existingVendor?.location_label || ''
  )
  const [latitude, setLatitude] = useState<number | null>(
    hasRealExistingPin ? (existingVendor?.latitude ?? null) : null
  )
  const [longitude, setLongitude] = useState<number | null>(
    hasRealExistingPin ? (existingVendor?.longitude ?? null) : null
  )
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const nameOk = shopName.trim().length > 1
  const phoneOk = digitsOnly(whatsappNumber).length >= 10
  const isReady = nameOk && phoneOk

  const statusText = isReady
    ? existingVendor
      ? 'Save changes'
      : 'Open your store'
    : nameOk
    ? 'Add your WhatsApp number'
    : 'Add your shop name'

  const handlePinCurrentLocation = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lng = Number(pos.coords.longitude.toFixed(6))
        setLatitude(lat)
        setLongitude(lng)
        setLocating(false)
        toast.success('Current map location pinned!')
      },
      (err) => {
        setLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Location permission was denied. You can skip this or enable location access.')
        } else {
          toast.error('Could not get your GPS location. You can skip this and add it later.')
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  }

  const handleSubmit = async () => {
    if (!isReady || submitting) return

    const cleanPhone = normalizeWhatsAppNumber(whatsappNumber)
    if (!cleanPhone) {
      toast.error('Please enter a valid WhatsApp number (e.g. 0803 000 0000).')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/vendor/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_name: shopName.trim(),
          whatsapp_number: cleanPhone,
          campus,
          location_label: locationLabel.trim(),
          latitude,
          longitude,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not save store.')
        return
      }

      router.push('/vendor/dashboard')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  const campusOptions: { label: string; value: CampusArea }[] = [
    { label: 'Okerenkoko', value: 'Okerenkoko' },
    { label: 'Kurutie', value: 'Kurutie' },
    { label: 'Both campuses', value: 'Both' },
  ]

  const isPinned = latitude !== null && longitude !== null

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Sticky Top Bar (.ftop) */}
      <div className="sticky top-0 z-20 flex items-center gap-1 h-14 px-2 bg-card border-b border-border">
        <div className="mx-auto w-full max-w-[540px] flex items-center gap-1">
          <Link
            href={existingVendor ? '/vendor/dashboard' : '/'}
            aria-label="Back to buying"
            className="w-11 h-11 rounded-full grid place-items-center text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <b className="font-[family-name:var(--font-bricolage)] font-semibold text-lg tracking-tight">
            {existingVendor ? 'Store settings' : 'Start selling'}
          </b>
        </div>
      </div>

      {/* Centered Minimal Form */}
      <div className="mx-auto w-full max-w-[540px] md:mt-6 md:rounded-2xl md:border md:border-border md:bg-card md:p-6 md:shadow-2xs">
        <p className="px-4 md:px-0 pt-4 md:pt-0 pb-1 text-sm text-muted-foreground">
          Students browse without an account. You only need one to sell.
        </p>

        {/* Field 1: Shop or seller name */}
        <div className="px-4 md:px-0 mt-[22px]">
          <label
            htmlFor="s-name"
            className="block mb-2 text-[15px] font-semibold text-foreground"
          >
            Shop or seller name
          </label>
          <input
            id="s-name"
            type="text"
            autoComplete="organization"
            maxLength={60}
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Amaka Fresh Bowls"
            className="w-full h-[52px] px-3.5 rounded-xl border border-border bg-card md:bg-background text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/50 transition-all"
          />
        </div>

        {/* Field 2: WhatsApp number */}
        <div className="px-4 md:px-0 mt-[22px]">
          <label
            htmlFor="s-phone"
            className="block mb-2 text-[15px] font-semibold text-foreground"
          >
            WhatsApp number
          </label>
          <input
            id="s-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="0803 000 0000"
            className="w-full h-[52px] px-3.5 rounded-xl border border-border bg-card md:bg-background text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/50 transition-all"
          />
          <small className="block mt-1.5 text-[13px] text-muted-foreground">
            Buyers message you here.
          </small>
        </div>

        {/* Field 3: Where do you sell? */}
        <div className="px-4 md:px-0 mt-[22px]">
          <span className="block mb-2 text-[15px] font-semibold text-foreground">
            Where do you sell?
          </span>
          <div role="group" aria-label="Campus" className="flex flex-wrap gap-2">
            {campusOptions.map((opt) => {
              const active = campus === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCampus(opt.value)}
                  className={cn(
                    'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                    active
                      ? 'bg-foreground border-foreground text-background font-semibold'
                      : 'bg-card md:bg-background border-border text-foreground hover:border-foreground/40'
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Field 4: Optional Typed-out Location Description */}
        <div className="px-4 md:px-0 mt-[22px]">
          <label
            htmlFor="s-loc"
            className="block mb-2 text-[15px] font-semibold text-foreground"
          >
            Location description <span className="font-normal text-xs text-muted-foreground">(optional)</span>
          </label>
          <input
            id="s-loc"
            type="text"
            maxLength={80}
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            placeholder="e.g. Block B Hostel, or 2 mins from Main Jetty"
            className="w-full h-[52px] px-3.5 rounded-xl border border-border bg-card md:bg-background text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/50 transition-all"
          />
          <small className="block mt-1.5 text-[13px] text-muted-foreground">
            Written directions to help students find you.
          </small>
        </div>

        {/* Field 5: Optional Pinned GPS Map Location (Can be skipped) */}
        <div className="px-4 md:px-0 mt-[22px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[15px] font-semibold text-foreground">
              Pin map location <span className="font-normal text-xs text-muted-foreground">(optional)</span>
            </span>
            {isPinned && (
              <button
                type="button"
                onClick={() => {
                  setLatitude(null)
                  setLongitude(null)
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear pin</span>
              </button>
            )}
          </div>

          {isPinned ? (
            <div className="flex items-center justify-between gap-3 h-[52px] px-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm text-foreground">
              <div className="flex items-center gap-2 min-w-0">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium truncate">
                  Current GPS location pinned ({latitude?.toFixed(4)}, {longitude?.toFixed(4)})
                </span>
              </div>
              <button
                type="button"
                onClick={handlePinCurrentLocation}
                disabled={locating}
                className="text-xs font-semibold underline shrink-0 cursor-pointer"
              >
                Update
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePinCurrentLocation}
              disabled={locating}
              className="w-full h-[52px] px-3.5 rounded-xl border border-dashed border-border bg-card md:bg-background hover:bg-muted/50 text-sm font-medium text-foreground flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-muted-foreground" />
              <span>
                {locating ? 'Getting your GPS location...' : 'Use my current location'}
              </span>
            </button>
          )}

          <small className="block mt-1.5 text-[13px] text-muted-foreground">
            You can skip this now and add or update it later in your Store profile. If skipped, Google Maps links won&apos;t show on your listings.
          </small>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border">
        <div className="mx-auto w-full max-w-[540px] px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] flex items-center gap-4">
          <div className="min-w-0">
            <small className="block text-xs text-muted-foreground">
              {isReady ? 'Ready' : 'Still needed'}
            </small>
            <b className="block text-[15px] sm:text-base font-semibold text-foreground truncate">
              {statusText}
            </b>
          </div>
          <button
            type="button"
            disabled={!isReady || submitting}
            onClick={handleSubmit}
            className={cn(
              'ml-auto flex-1 max-w-[180px] h-12 rounded-xl font-semibold text-[15px] flex items-center justify-center transition-colors cursor-pointer',
              isReady && !submitting
                ? 'bg-foreground text-background hover:opacity-90'
                : 'bg-muted text-muted-foreground cursor-default'
            )}
          >
            {submitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
