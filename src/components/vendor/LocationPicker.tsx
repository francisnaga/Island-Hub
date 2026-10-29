'use client'

import { useState, useRef } from 'react'
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  Eye,
  EyeOff,
  Truck,
  Store,
  AlertTriangle,
  Crosshair,
} from 'lucide-react'
import { LocationType, LocationVisibility } from '@/lib/types'
import { NMU_DEFAULT_COORDS } from '@/lib/marketplace-data'
import {
  buildGoogleMapsDirectionsUrl,
  isWithinSupportedServiceArea,
} from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface LocationValue {
  latitude: number
  longitude: number
  location_type: LocationType
  location_visibility: LocationVisibility
  location_label: string
  pickup_options: string
  delivery_available: boolean
  delivery_coverage: string
  pinConfirmed: boolean
}

interface LocationPickerProps {
  value: LocationValue
  onChange: (next: LocationValue) => void
}

const PRESET_NMU_LOCATIONS = [
  {
    label: 'NMU Main Campus Gate, Okerenkoko',
    lat: 5.6284,
    lng: 5.3921,
  },
  {
    label: 'NMU Hostel B / Student Centre Area, Okerenkoko',
    lat: 5.6269,
    lng: 5.3908,
  },
  {
    label: 'Okerenkoko Jetty Road, Warri South West',
    lat: 5.6255,
    lng: 5.3895,
  },
  {
    label: 'Kurutie Campus / Take-Off Site Area',
    lat: 5.6112,
    lng: 5.3642,
  },
  {
    label: 'Miller Waterside / Warri Jetty Pickup Point',
    lat: 5.5142,
    lng: 5.7341,
  },
]

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([])
  const [locatingGps, setLocatingGps] = useState(false)
  const [draggingPin, setDraggingPin] = useState(false)
  const mapBoxRef = useRef<HTMLDivElement>(null)

  const lat = value.latitude || NMU_DEFAULT_COORDS.latitude
  const lng = value.longitude || NMU_DEFAULT_COORDS.longitude
  const inSupportedRegion = isWithinSupportedServiceArea(lat, lng)

  // Method 1: Use my current location (HTML5 Geolocation API)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser. Please choose on the map or search.')
      return
    }

    setLocatingGps(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLat = Number(position.coords.latitude.toFixed(6))
        const nextLng = Number(position.coords.longitude.toFixed(6))
        onChange({
          ...value,
          latitude: nextLat,
          longitude: nextLng,
          pinConfirmed: false, // Require vendor to explicitly confirm GPS pin
        })
        setLocatingGps(false)
        toast.info(
          'GPS coordinates detected! Review the pin on the map and tap "Confirm Pin Location" if this is your shop or pickup spot.'
        )
      },
      (err) => {
        setLocatingGps(false)
        toast.error(
          err.code === 1
            ? 'Location permission denied. You can search for your place or move the pin on the map below.'
            : 'Could not read device GPS. Please select a preset or adjust the pin on the map.'
        )
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Method 3: Search for a known place via OpenStreetMap Nominatim + NMU presets
  const handlePlaceSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery.trim() + ' Delta Nigeria'
      )}&limit=4`
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      })
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data || [])
        if (!data || data.length === 0) {
          toast.info('No exact map match found. You can also select an NMU campus preset or click on the map.')
        }
      }
    } catch {
      toast.info('Select one of the NMU / Okerenkoko presets below or click on the map to position your pin.')
    } finally {
      setSearching(false)
    }
  }

  // Method 2: Interactive Map Pin adjustment (click or drag inside map canvas)
  const handleMapCanvasInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapBoxRef.current) return
    const rect = mapBoxRef.current.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width - 0.5 // -0.5 to +0.5
    const relY = 0.5 - (e.clientY - rect.top) / rect.height // -0.5 to +0.5

    // Span roughly ~0.012 degrees across the viewport so user can fine-tune pin
    const nextLat = Number((lat + relY * 0.008).toFixed(6))
    const nextLng = Number((lng + relX * 0.008).toFixed(6))

    onChange({
      ...value,
      latitude: nextLat,
      longitude: nextLng,
      pinConfirmed: false,
    })
  }

  const bbox = `${(lng - 0.006).toFixed(5)},${(lat - 0.004).toFixed(5)},${(
    lng + 0.006
  ).toFixed(5)},${(lat + 0.004).toFixed(5)}`

  const previewDirectionsUrl = buildGoogleMapsDirectionsUrl({
    latitude: lat,
    longitude: lng,
    locationVisibility: value.location_visibility,
    locationType: value.location_type,
  })

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#0F6E6E]" />
          Vendor Location, Privacy & Google Maps Directions
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Help buyers know where to pick up their items or whether you deliver. Remember: your current phone GPS is not necessarily your permanent shop address—always confirm your saved pin.
        </p>
      </div>

      {/* Step 1: What kind of location is this? */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          1. What kind of location is this?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            {
              id: 'shop',
              title: 'Permanent Shop',
              desc: 'Physical shop or business premises',
              icon: Store,
            },
            {
              id: 'pickup_point',
              title: 'Pickup Point',
              desc: 'Campus gate, jetty, or meeting spot',
              icon: MapPin,
            },
            {
              id: 'home_based',
              title: 'Hostel / Home-Based',
              desc: 'Selling from hostel room or residence',
              icon: EyeOff,
            },
            {
              id: 'delivery_only',
              title: 'Delivery-Only Vendor',
              desc: 'You deliver directly to buyers',
              icon: Truck,
            },
          ].map((opt) => {
            const Icon = opt.icon
            const active = value.location_type === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  const nextType = opt.id as LocationType
                  // Default home_based to approximate visibility for privacy
                  const nextVis =
                    nextType === 'home_based' && value.location_visibility === 'exact'
                      ? 'approximate'
                      : value.location_visibility
                  onChange({
                    ...value,
                    location_type: nextType,
                    location_visibility: nextVis,
                  })
                }}
                className={cn(
                  'flex flex-col items-start rounded-xl border p-3.5 text-left transition-all cursor-pointer',
                  active
                    ? 'border-[#0F6E6E] bg-[#E6F2F2]/70 ring-1 ring-[#0F6E6E]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 mb-2',
                    active ? 'text-[#0F6E6E]' : 'text-slate-500'
                  )}
                />
                <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {opt.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 2: Pin Picker (Hidden only if vendor is strictly delivery_only) */}
      {value.location_type !== 'delivery_only' && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              2. Set & Confirm Your Map Pin (3 Methods)
            </label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locatingGps}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F6E6E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0A4F4F] transition-colors cursor-pointer disabled:opacity-60"
            >
              <Crosshair className="h-3.5 w-3.5" />
              {locatingGps ? 'Reading GPS...' : 'Use My Current Location (GPS)'}
            </button>
          </div>

          {/* Place Search + Presets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handlePlaceSearch()
                      }
                    }}
                    placeholder="Search place or address (e.g. Okerenkoko, Warri)..."
                    className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handlePlaceSearch()}
                  disabled={searching}
                  className="h-9 px-3 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  {searching ? '...' : 'Find'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 space-y-1 max-h-36 overflow-y-auto">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChange({
                          ...value,
                          latitude: Number(parseFloat(item.lat).toFixed(6)),
                          longitude: Number(parseFloat(item.lon).toFixed(6)),
                          location_label: item.display_name.split(',').slice(0, 2).join(','),
                          pinConfirmed: false,
                        })
                        setSearchResults([])
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-slate-700 hover:bg-[#E6F2F2] hover:text-[#0A4F4F] truncate"
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <select
                aria-label="Quick NMU / Okerenkoko Presets"
                onChange={(e) => {
                  const idx = Number(e.target.value)
                  if (!Number.isNaN(idx) && PRESET_NMU_LOCATIONS[idx]) {
                    const preset = PRESET_NMU_LOCATIONS[idx]
                    onChange({
                      ...value,
                      latitude: preset.lat,
                      longitude: preset.lng,
                      location_label: preset.label,
                      pinConfirmed: false,
                    })
                  }
                }}
                defaultValue=""
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 focus:border-[#0F6E6E] focus:outline-none"
              >
                <option value="" disabled>
                  Or jump to an NMU / Okerenkoko landmark...
                </option>
                {PRESET_NMU_LOCATIONS.map((p, idx) => (
                  <option key={p.label} value={idx}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Map Canvas & Pin Adjuster */}
          <div className="rounded-xl border border-slate-300 overflow-hidden bg-slate-100">
            <div
              ref={mapBoxRef}
              onClick={handleMapCanvasInteraction}
              onMouseMove={(e) => {
                if (draggingPin) handleMapCanvasInteraction(e)
              }}
              onMouseUp={() => setDraggingPin(false)}
              className="relative h-60 w-full cursor-crosshair select-none"
              title="Click anywhere on the map preview to fine-tune your pin position"
            >
              <iframe
                title="Vendor Location Map Preview"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
                className="h-full w-full border-0 pointer-events-none"
              />
              {/* Interactive Overlay Target so clicking adjusts coordinates cleanly */}
              <div className="absolute inset-0 bg-transparent flex items-center justify-center">
                <div
                  onMouseDown={() => setDraggingPin(true)}
                  className="flex flex-col items-center -mt-6 pointer-events-auto cursor-grab active:cursor-grabbing"
                >
                  <span className="rounded-full bg-slate-900/90 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-md mb-1">
                    Click map to adjust pin
                  </span>
                </div>
              </div>
            </div>

            {/* Coordinate readout + Confirm Pin bar */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span>
                  <strong>Saved Coordinates:</strong> {lat.toFixed(5)}, {lng.toFixed(5)}
                </span>
                {!inSupportedRegion && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                    <AlertTriangle className="h-3 w-3" />
                    Outside NMU / Delta State region
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  onChange({ ...value, pinConfirmed: true })
                  toast.success('Map pin confirmed!')
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer',
                  value.pinConfirmed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {value.pinConfirmed ? 'Pin Location Confirmed' : 'Confirm Pin Location'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Human-Readable Area Label & Pickup Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Area / Pickup Landmark Name *
          </label>
          <input
            type="text"
            required
            value={value.location_label}
            onChange={(e) => onChange({ ...value, location_label: e.target.value })}
            placeholder="e.g. Near NMU Main Gate, Okerenkoko"
            className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pickup Hours / Collection Arrangement *
          </label>
          <input
            type="text"
            required
            value={value.pickup_options}
            onChange={(e) => onChange({ ...value, pickup_options: e.target.value })}
            placeholder="e.g. Mon–Sat 9am–6pm at shop or campus gate"
            className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
          />
        </div>
      </div>

      {/* Delivery Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={value.delivery_available || value.location_type === 'delivery_only'}
            onChange={(e) =>
              onChange({ ...value, delivery_available: e.target.checked })
            }
            className="h-4 w-4 rounded border-slate-300 text-[#0F6E6E]"
          />
          <div>
            <span className="block text-xs font-bold text-slate-900">
              I also offer delivery to hostels / campus
            </span>
            <span className="block text-[11px] text-slate-500">
              Let buyers know if you can bring items to their hostel or jetty
            </span>
          </div>
        </label>

        {(value.delivery_available || value.location_type === 'delivery_only') && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Delivery Coverage Area
            </label>
            <input
              type="text"
              value={value.delivery_coverage}
              onChange={(e) =>
                onChange({ ...value, delivery_coverage: e.target.value })
              }
              placeholder="e.g. All NMU Hostels & Okerenkoko"
              className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Step 4: What should buyers see? (Visibility Controls) */}
      {value.location_type !== 'delivery_only' && (
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            3. What should buyers see publicly?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'exact',
                title: 'Exact Pin & Directions',
                desc: 'Show Get Directions button to open Google Maps to your pin (Best for public shops)',
                icon: Navigation,
              },
              {
                id: 'approximate',
                title: 'General Area Only',
                desc: 'Show area name publicly; share exact spot privately on WhatsApp (Recommended for hostels)',
                icon: Eye,
              },
              {
                id: 'hidden',
                title: "Don't Display Location",
                desc: 'Show "Ask vendor for pickup location" button on product pages',
                icon: EyeOff,
              },
            ].map((vis) => {
              const Icon = vis.icon
              const active = value.location_visibility === vis.id
              return (
                <button
                  key={vis.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...value,
                      location_visibility: vis.id as LocationVisibility,
                    })
                  }
                  className={cn(
                    'flex flex-col items-start rounded-xl border p-3.5 text-left transition-all cursor-pointer',
                    active
                      ? 'border-[#0F6E6E] bg-[#E6F2F2]/70 ring-1 ring-[#0F6E6E]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 mb-1.5',
                      active ? 'text-[#0F6E6E]' : 'text-slate-500'
                    )}
                  />
                  <span className="text-xs font-bold text-slate-900">{vis.title}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {vis.desc}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Live Buyer Preview Box */}
      <div className="rounded-xl border border-[#0F6E6E]/25 bg-[#E6F2F2]/40 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A4F4F]">
            Live Buyer Preview on Product Page
          </span>
          <span className="text-[11px] font-medium text-slate-600 capitalize">
            Location type: {value.location_type.replace('_', ' ')}
          </span>
        </div>

        <div className="rounded-lg bg-white border border-slate-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            {value.location_type === 'delivery_only' ? (
              <p className="font-semibold text-slate-800">
                Delivery-only vendor · Coverage:{' '}
                {value.delivery_coverage || 'NMU & Okerenkoko'}
              </p>
            ) : value.location_visibility === 'hidden' ? (
              <p className="font-semibold text-slate-700">
                Exact location hidden publicly · Buyers see &ldquo;Ask vendor for pickup location&rdquo;.
              </p>
            ) : value.location_visibility === 'approximate' ? (
              <p className="font-semibold text-slate-800">
                Buyers see general area: <span className="text-[#0F6E6E]">{value.location_label}</span>. Exact pickup location is shared privately on WhatsApp.
              </p>
            ) : (
              <p className="font-semibold text-slate-800">
                Buyers see <span className="text-[#0F6E6E]">{value.location_label}</span> and a direct <strong>Get Directions</strong> Google Maps button.
              </p>
            )}
          </div>

          {previewDirectionsUrl && (
            <a
              href={previewDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-[#0F6E6E]/25 bg-[#E6F2F2] px-3 py-1.5 text-xs font-semibold text-[#0A4F4F] hover:bg-blue-100 shrink-0"
            >
              <Navigation className="h-3.5 w-3.5" />
              Test Directions Link
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
