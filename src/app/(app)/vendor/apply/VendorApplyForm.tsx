'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Navigation, Check, X, AtSign, Loader2, Camera, Trash2 } from 'lucide-react'
import { CampusArea, UserProfile, Vendor } from '@/lib/types'
import { normalizeWhatsAppNumber } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { UserAvatar } from '@/components/brand/UserAvatar'
import { compressAvatarFile } from '@/lib/image-compression'

interface VendorApplyFormProps {
  user?: { id: string; email?: string; full_name?: string; avatar_url?: string } | null
  profile?: UserProfile | null
  existingVendor: Vendor | null
  nextUrl?: string
}

function digitsOnly(val: string): string {
  return String(val || '').replace(/\D/g, '')
}

const LEGACY_COORDS = new Set(['5.580668,5.34693', '5.6278,5.3915'])
const USERNAME_RE = /^[a-z0-9_]{3,20}$/

/** Turn a shop name into a suggested @username */
function suggestUsername(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20)
}

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export function VendorApplyForm({
  user,
  profile,
  existingVendor,
  nextUrl,
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
  const [description, setDescription] = useState(existingVendor?.description || '')
  const [logoUrl, setLogoUrl] = useState<string | null>(
    existingVendor?.logo_url || profile?.avatar_url || user?.avatar_url || null
  )
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  // --- Username state ---
  const existingUsername = existingVendor?.username || ''
  const [username, setUsername] = useState(existingUsername)
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>(
    existingUsername ? 'available' : 'idle'
  )
  const [usernameMessage, setUsernameMessage] = useState(
    existingUsername ? `@${existingUsername} is your current username` : ''
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-suggest username from shop name (only for new vendors)
  useEffect(() => {
    if (!existingVendor && shopName && !username) {
      const suggested = suggestUsername(shopName)
      if (suggested.length >= 3) {
        setUsername(suggested)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopName])

  // Debounced availability check
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const cleaned = username.toLowerCase().replace(/^@/, '')

    // If unchanged from existing and we already have it
    if (existingVendor && cleaned === existingVendor.username) {
      setUsernameStatus('available')
      setUsernameMessage(`@${cleaned} is your current username`)
      return
    }

    if (!cleaned) {
      setUsernameStatus('idle')
      setUsernameMessage('')
      return
    }

    if (!USERNAME_RE.test(cleaned)) {
      setUsernameStatus('invalid')
      setUsernameMessage('3–20 characters: letters, numbers, underscores only')
      return
    }

    setUsernameStatus('checking')
    setUsernameMessage('Checking availability…')

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/vendor/username-check?username=${encodeURIComponent(cleaned)}`)
        const json = await res.json()
        setUsernameStatus(json.available ? 'available' : 'taken')
        setUsernameMessage(json.message || '')
      } catch {
        setUsernameStatus('idle')
        setUsernameMessage('')
      }
    }, 500)
  }, [username, existingVendor])

  const usernameOk =
    usernameStatus === 'available' ||
    // Existing vendors can submit even with idle (keep old username)
    (Boolean(existingVendor) && usernameStatus === 'idle')

  const nameOk = shopName.trim().length > 1
  const phoneOk = digitsOnly(whatsappNumber).length >= 10
  // New vendors: username required. Existing vendors: username optional.
  const isReady = nameOk && phoneOk && (existingVendor ? usernameOk : usernameStatus === 'available')

  const statusText = isReady
    ? existingVendor
      ? 'Save changes'
      : 'Open your store'
    : usernameStatus === 'checking'
    ? 'Checking username…'
    : usernameStatus === 'taken' || usernameStatus === 'invalid'
    ? 'Fix your username'
    : !existingVendor && usernameStatus === 'idle' && nameOk && phoneOk
    ? 'Choose a username'
    : nameOk
    ? 'Add your WhatsApp number'
    : 'Add your shop name'

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const { file: compressed } = await compressAvatarFile(file)
      const formData = new FormData()
      formData.append('file', compressed)
      formData.append('folder', 'vendors')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Failed to upload photo')
        return
      }

      setLogoUrl(json.url)
      toast.success('Store photo added!')
    } catch (err: any) {
      toast.error(err?.message || 'Error uploading photo')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = () => {
    setLogoUrl(null)
    toast.info('Photo removed — using clean monogram')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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
      const cleanedUsername = username.toLowerCase().replace(/^@/, '').trim()
      const res = await fetch('/api/vendor/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_name: shopName.trim(),
          description: description.trim().slice(0, 300),
          whatsapp_number: cleanPhone,
          campus,
          location_label: locationLabel.trim(),
          latitude,
          longitude,
          logo_url: logoUrl || null,
          ...(cleanedUsername ? { username: cleanedUsername } : {}),
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not save store.')
        return
      }

      router.push(nextUrl || '/vendor/dashboard')
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
          <b className="font-sans font-semibold text-lg tracking-tight">
            {existingVendor ? 'Store settings' : 'Start selling'}
          </b>
        </div>
      </div>

      {/* Centered Minimal Form */}
      <div className="mx-auto w-full max-w-[540px] md:mt-6 md:rounded-2xl md:border md:border-border md:bg-card md:p-6 md:shadow-2xs">
        <p className="px-4 md:px-0 pt-4 md:pt-0 pb-1 text-sm text-muted-foreground">
          Students browse without an account. You only need one to sell.
        </p>

        {/* Store Photo / Minimal Monogram Setup */}
        <div className="px-4 md:px-0 mt-5 pt-4 border-t border-border/60">
          <label className="block mb-2 text-[15px] font-semibold text-foreground">
            Store photo or logo <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </label>

          <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-border/80 bg-muted/30">
            {/* 72px Live Avatar Preview */}
            <div className="relative shrink-0">
              <UserAvatar
                src={logoUrl}
                seed={username || shopName || user?.id || 'store'}
                name={shopName.trim() || user?.full_name || 'My Store'}
                size={72}
                className="ring-2 ring-border/80 shadow-xs"
              />
              {uploadingImage && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Controls & Monogram Fallback Status */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                  <span>{logoUrl ? 'Change photo' : 'Upload photo'}</span>
                </button>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Use monogram</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground leading-tight">
                {logoUrl ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Custom photo active
                  </span>
                ) : (
                  <span>
                    No photo? Jetty generates this minimal monogram for you automatically.
                  </span>
                )}
              </p>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageSelect}
              className="hidden"
              aria-label="Upload store photo or logo"
            />
          </div>
        </div>

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

        {/* Field 2: Username */}
        <div className="px-4 md:px-0 mt-[22px]">
          <label
            htmlFor="s-username"
            className="block mb-2 text-[15px] font-semibold text-foreground"
          >
            Username{' '}
            {!existingVendor && (
              <span className="font-normal text-xs text-muted-foreground">(required — used in your store link)</span>
            )}
            {existingVendor && (
              <span className="font-normal text-xs text-muted-foreground">(optional — change every 14 days)</span>
            )}
          </label>
          <div className="relative">
            <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="s-username"
              type="text"
              autoComplete="username"
              maxLength={20}
              value={username}
              onChange={(e) => {
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
                setUsername(val)
              }}
              placeholder="amakafreshbowls"
              className={cn(
                'w-full h-[52px] pl-9 pr-10 rounded-xl border bg-card md:bg-background text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/50 transition-all',
                usernameStatus === 'available' && 'border-emerald-500/50',
                usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-500/50' : 'border-border',
              )}
            />
            {/* Status icon */}
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {usernameStatus === 'checking' && (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              )}
              {usernameStatus === 'available' && (
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              )}
              {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                <X className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          {usernameMessage && (
            <small
              className={cn(
                'block mt-1.5 text-[13px]',
                usernameStatus === 'available' ? 'text-emerald-600 dark:text-emerald-400' : '',
                usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'text-red-500' : '',
                usernameStatus === 'checking' || usernameStatus === 'idle' ? 'text-muted-foreground' : '',
              )}
            >
              {usernameMessage}
            </small>
          )}
          {!usernameMessage && (
            <small className="block mt-1.5 text-[13px] text-muted-foreground">
              Your store link: islandhub.com/vendors/@{username || 'yourname'}
            </small>
          )}
        </div>

        {/* Field 3: Store description (bio) */}
        <div className="px-4 md:px-0 mt-[22px]">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="s-desc"
              className="text-[15px] font-semibold text-foreground"
            >
              Store description <span className="font-normal text-xs text-muted-foreground">(optional)</span>
            </label>
            <span className="text-xs text-muted-foreground font-mono">
              {description.length}/300
            </span>
          </div>
          <textarea
            id="s-desc"
            rows={3}
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell students what you sell, your specialties, or hostel delivery terms..."
            className="w-full p-3.5 rounded-xl border border-border bg-card md:bg-background text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/50 transition-all resize-none leading-relaxed"
          />
          <small className="block mt-1.5 text-[13px] text-muted-foreground">
            Up to 300 characters (~50 words). Displayed on your store profile header.
          </small>
        </div>

        {/* Field 4: WhatsApp number */}
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

        {/* Field 4: Where do you sell? */}
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
