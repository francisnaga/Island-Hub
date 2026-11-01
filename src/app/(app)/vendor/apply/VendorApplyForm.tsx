'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CampusArea, UserProfile, Vendor } from '@/lib/types'
import { normalizeWhatsAppNumber } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface VendorApplyFormProps {
  user: { id: string; email?: string; full_name?: string; avatar_url?: string }
  profile: UserProfile
  existingVendor: Vendor | null
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

function digitsOnly(val: string): string {
  return String(val || '').replace(/\D/g, '')
}

export function VendorApplyForm({
  user,
  profile,
  existingVendor,
}: VendorApplyFormProps) {
  const router = useRouter()

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

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Sticky Top Bar (.ftop from prototype) */}
      <div className="sticky top-0 z-20 flex items-center gap-1 h-14 px-2 bg-card border-b border-border">
        <div className="mx-auto w-full max-w-[480px] flex items-center gap-1">
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

      {/* Centered Minimal Form (#vsign from prototype) */}
      <div className="mx-auto w-full max-w-[480px]">
        <p className="px-4 pt-4 pb-1 text-sm text-muted-foreground">
          Students browse without an account. You only need one to sell.
        </p>

        {/* Field 1: Shop or seller name */}
        <div className="px-4 mt-[22px]">
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
            className="w-full h-[52px] px-3.5 rounded-xl border border-border bg-card text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0F6E6E] focus:ring-3 focus:ring-[#0F6E6E]/15 transition-all"
          />
        </div>

        {/* Field 2: WhatsApp number */}
        <div className="px-4 mt-[22px]">
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
            className="w-full h-[52px] px-3.5 rounded-xl border border-border bg-card text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0F6E6E] focus:ring-3 focus:ring-[#0F6E6E]/15 transition-all"
          />
          <small className="block mt-1.5 text-[13px] text-muted-foreground">
            Buyers message you here.
          </small>
        </div>

        {/* Field 3: Where do you sell? */}
        <div className="px-4 mt-[22px]">
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
                      ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                      : 'bg-card border-border text-foreground hover:border-[#0F6E6E]/40'
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Field 4: Optional Location / Landmark */}
        <div className="px-4 mt-[22px]">
          <label
            htmlFor="s-loc"
            className="block mb-2 text-[15px] font-semibold text-foreground"
          >
            Location
          </label>
          <input
            id="s-loc"
            type="text"
            maxLength={80}
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            placeholder="Block B Hostel, or near the main gate"
            className="w-full h-[52px] px-3.5 rounded-xl border border-border bg-card text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0F6E6E] focus:ring-3 focus:ring-[#0F6E6E]/15 transition-all"
          />
          <small className="block mt-1.5 text-[13px] text-muted-foreground">
            Optional. Shown on your store only if you add one.
          </small>
        </div>
      </div>

      {/* Sticky Bottom Bar (.bar.on from prototype) */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border">
        <div className="mx-auto w-full max-w-[480px] px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] flex items-center gap-4">
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
                ? 'bg-[#0F6E6E] text-white hover:bg-[#0A4F4F]'
                : 'bg-[#CBDADA] dark:bg-muted text-[#3E4F4F] dark:text-muted-foreground cursor-default'
            )}
          >
            {submitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
