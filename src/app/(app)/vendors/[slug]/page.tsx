import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BadgeCheck,
  MapPin,
  Navigation,
  MessageCircle,
  Truck,
  ArrowLeft,
  Package,
  ShieldCheck,
  Ban,
  Clock,
  Share2,
  Building2,
  PauseCircle,
  Calendar,
} from 'lucide-react'
import { ProductCard } from '@/components/cards/ProductCard'
import { getSellerTypeLabel } from '@/components/cards/VendorCard'
import { WavyAvatar } from '@/components/brand/WavyAvatar'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { getPublicVendorBySlugOrId } from '@/lib/queries'
import { cn } from '@/lib/utils'
import {
  buildGoogleMapsDirectionsUrl,
  buildVendorStoreWhatsAppUrl,
  daysSinceConfirmed,
} from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

export default async function VendorStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { vendor, products } = await getPublicVendorBySlugOrId(slug)

  if (!vendor) {
    notFound()
  }

  const isBanned = vendor.verification_status === 'suspended'
  const isPaused = Boolean(vendor.is_paused) && !isBanned

  const whatsappStore = buildVendorStoreWhatsAppUrl({
    whatsappNumber: vendor.whatsapp_number,
    shopName: vendor.shop_name,
  })

  const directionsUrl = isBanned
    ? null
    : buildGoogleMapsDirectionsUrl({
        latitude: vendor.latitude,
        longitude: vendor.longitude,
        locationVisibility: vendor.location_visibility,
        locationType: vendor.location_type,
      })

  const campusLabel =
    vendor.campus === 'Both'
      ? 'Okerenkoko & Kurutie'
      : vendor.campus || 'Okerenkoko'

  const memberSince = new Date(vendor.created_at).toLocaleDateString('en-NG', {
    month: 'short',
    year: 'numeric',
  })

  const confirmedDays = daysSinceConfirmed(
    vendor.location_confirmed_at || vendor.created_at
  )

  return (
    <div className="py-5 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-6 sm:space-y-8 min-w-0">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Vendor Storefronts
          </Link>

          <div className="flex items-center gap-2">
            {!isBanned && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Check out ${vendor.shop_name} on Jetty (${campusLabel}) — https://jetty.ng/vendors/${vendor.slug || vendor.id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Share2 className="h-3.5 w-3.5 text-primary" />
                <span>Share Storefront</span>
              </a>
            )}
            <ReportListingModal
              targetType="vendor"
              vendorId={vendor.id}
              targetName={vendor.shop_name}
            />
          </div>
        </div>

        {/* If Vendor is BANNED / SUSPENDED: Show Prominent Banned Profile Notice */}
        {isBanned ? (
          <div className="rounded-2xl border-2 border-red-300 bg-red-50/70 dark:border-red-900 dark:bg-red-950/30 p-6 sm:p-10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-xs">
                <Ban className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-white">
                  Vendor Banned by Jetty Moderation
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-red-950 dark:text-red-200 line-through">
                  {vendor.shop_name}
                </h1>
                <p className="text-xs sm:text-sm text-red-900/90 dark:text-red-300 max-w-2xl leading-relaxed">
                  This seller account has been suspended and all associated product/service listings have been archived from the public marketplace. Do not send advance payments or conduct transactions with this storefront.
                </p>
              </div>
            </div>

            {vendor.rejection_reason && (
              <div className="rounded-xl border border-red-200 bg-white/80 dark:border-red-900/60 dark:bg-red-950/50 p-4 text-xs text-red-900 dark:text-red-200">
                <strong>Moderation Note:</strong> {vendor.rejection_reason}
              </div>
            )}

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/vendors"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                Browse Verified Vendors
              </Link>
              <Link
                href="/safety"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Read Buyer Safety Rules
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Paused Storefront Notice if vendor paused taking orders */}
            {isPaused && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 p-4 sm:p-5 flex items-start gap-3">
                <PauseCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
                  <p className="font-bold">
                    Storefront Temporarily Paused ({vendor.pause_reason || 'Away / Holiday'})
                  </p>
                  <p className="text-xs opacity-90">
                    This seller has temporarily paused taking new orders. You can still browse their storefront catalogue below and message them to check when they resume.
                  </p>
                </div>
              </div>
            )}

            {/* Social-Style Storefront Profile Header */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              {/* Cover Backdrop Banner */}
              <div className="relative h-28 sm:h-44 w-full bg-gradient-to-r from-primary/25 via-primary/10 to-accent/30 border-b border-border/80">
                <div className="absolute inset-0 opacity-20 dark:opacity-30 bg-[radial-gradient(var(--primary)_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {vendor.is_featured && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 dark:bg-card/90 backdrop-blur-md border border-border px-3 py-1 text-xs font-semibold text-foreground shadow-2xs">
                    <span>Featured Storefront</span>
                  </div>
                )}
              </div>

              {/* Profile Details (Overlapping Cover) */}
              <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  {/* Avatar + Main Title */}
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3.5 sm:gap-5 -mt-12 sm:-mt-16">
                    <div className="relative flex h-22 w-22 sm:h-28 sm:w-28 shrink-0 items-center justify-center rounded-full border-4 border-card bg-muted text-foreground font-extrabold text-2xl sm:text-3xl overflow-hidden shadow-md">
                      {vendor.logo_url ? (
                        <img
                          src={vendor.logo_url}
                          alt={vendor.shop_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <WavyAvatar
                          name={vendor.shop_name}
                          seed={vendor.id || vendor.slug}
                          className="h-full w-full"
                          size={112}
                        />
                      )}
                    </div>

                    <div className="space-y-1 mb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                          {vendor.shop_name}
                        </h1>

                        {vendor.verification_status === 'verified' && (
                          <BadgeCheck
                            className={cn(
                              'h-5 w-5 shrink-0',
                              vendor.slug === 'naga' || vendor.slug === 'francis-naga'
                                ? 'text-[#F59E0B]'
                                : 'text-primary'
                            )}
                            aria-label="Verified"
                          />
                        )}

                        {vendor.seller_type === 'business' && vendor.business_verified && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            Business
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground/85">
                          {getSellerTypeLabel(vendor)}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 text-foreground/80">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {campusLabel}
                        </span>
                        {vendor.department_or_business_info && (
                          <>
                            <span>·</span>
                            <span>{vendor.department_or_business_info}</span>
                          </>
                        )}
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {memberSince}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary WhatsApp Action Button */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                    {whatsappStore.valid && (
                      <a
                        href={whatsappStore.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-xs sm:text-sm font-bold text-white hover:opacity-90 transition-opacity shadow-sm"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Message on WhatsApp</span>
                      </a>
                    )}

                    {directionsUrl && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        <Navigation className="h-3.5 w-3.5 text-primary" />
                        <span>Directions</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Vendor Bio / What They Offer */}
                <div className="max-w-3xl pt-1">
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {vendor.description}
                  </p>
                </div>

                {/* Social Profile Details Strip (Landmark, Hours, Pickup, Trust) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-border/80 text-xs">
                  <div className="rounded-xl bg-muted/40 border border-border p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      Pickup Landmark
                    </div>
                    {vendor.location_type === 'delivery_only' ? (
                      <p className="text-muted-foreground">
                        Delivery-only vendor ({vendor.delivery_coverage || campusLabel})
                      </p>
                    ) : vendor.location_visibility === 'hidden' ? (
                      <p className="text-muted-foreground">
                        Private residential · Message on WhatsApp for campus meeting point
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        {vendor.location_label}
                        {vendor.location_visibility === 'approximate' &&
                          ' (General area — confirm exact spot on WhatsApp)'}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-muted/40 border border-border p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Truck className="h-3.5 w-3.5 text-primary" />
                      Collection &amp; Delivery
                    </div>
                    <p className="text-muted-foreground">
                      {vendor.pickup_options || 'Contact seller for pickup times'}
                      {vendor.delivery_available && vendor.delivery_coverage
                        ? ` · Delivers to ${vendor.delivery_coverage}`
                        : ''}
                    </p>
                  </div>

                  <div className="rounded-xl bg-muted/40 border border-border p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      Hours &amp; Activity
                    </div>
                    <p className="text-muted-foreground">
                      {vendor.opening_hours || 'Mon–Sat · Confirm on WhatsApp'}
                    </p>
                    <p className="text-[11px] text-muted-foreground/80">
                      {confirmedDays === 0
                        ? 'Inventory active today'
                        : `Active ${confirmedDays}d ago`}
                    </p>
                  </div>

                  <div className="rounded-xl bg-muted/40 border border-border p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      Trust &amp; Verification
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {vendor.verification_status === 'verified'
                        ? 'Identity & WhatsApp verified by Jetty. Inspect items before paying.'
                        : 'Pending verification. Meet at public campus landmark.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* B. Published Catalogue (Products, Food & Drinks, and Services) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-xl font-bold text-foreground">
                  Active Storefront Listings ({products.length})
                </h2>
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                  <Package className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-sm font-bold text-foreground">
                    No active listings in this storefront yet
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Approved products, food items, and services appear here automatically.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
