import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BadgeCheck,
  Store,
  Clock,
  Tag,
  AlertTriangle,
  ArrowLeft,
  Package,
  Share2,
  CameraOff,
  MapPin,
} from 'lucide-react'
import { ProductOrderBox } from '@/components/marketplace/ProductOrderBox'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { ProductCard } from '@/components/cards/ProductCard'
import {
  getPublicProductBySlugOrId,
  getPublicProducts,
} from '@/lib/queries'
import { daysSinceConfirmed, isListingStale } from '@/lib/whatsapp'
import { Vendor } from '@/lib/types'

export const dynamic = 'force-dynamic'

const conditionLabels: Record<string, string> = {
  new: 'Brand New',
  like_new: 'Like New',
  good: 'Good (Pre-owned)',
  fair: 'Fair Condition',
}

function getSellerDistinctionLabel(vendor: Vendor): string {
  if (vendor.location_type === 'delivery_only') return 'Delivery only'
  if (vendor.location_type === 'pickup_point') return 'Campus pickup'
  if (vendor.location_type === 'home_based') return 'Student seller'
  if (vendor.location_type === 'shop') {
    return vendor.is_student ? 'Student seller · Physical shop' : 'Physical shop'
  }
  return vendor.is_student ? 'Student seller' : 'Local seller'
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getPublicProductBySlugOrId(slug)

  if (!product) {
    notFound()
  }

  const { products: relatedProducts } = await getPublicProducts({
    category: product.category?.slug || product.category_id,
    limit: 5,
  })
  const moreInCategory = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  const stale = isListingStale(product.last_confirmed_at, 14)
  const daysConfirmed = daysSinceConfirmed(product.last_confirmed_at)
  const missingPhoto = !product.images || product.images.length === 0

  return (
    <div className="py-5 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-6 sm:space-y-8 min-w-0">
        {/* Compact Mobile-Safe Breadcrumb + Actions */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 overflow-hidden">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1 hover:text-foreground font-medium shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Marketplace</span>
            </Link>
            {product.category && (
              <>
                <span className="shrink-0">/</span>
                <Link
                  href={`/category/${product.category.slug}`}
                  className="hover:text-foreground truncate max-w-[140px] sm:max-w-none"
                >
                  {product.category.name}
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Found this on Jetty — ${product.title} at ₦${product.price.toLocaleString('en-NG')}\n\nhttps://jetty.ng/product/${product.slug || product.id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              title="Share this product on WhatsApp"
            >
              <Share2 className="h-3.5 w-3.5 text-[#0F6E6E]" />
              <span>Share</span>
            </a>
            <ReportListingModal
              targetType="product"
              productId={product.id}
              vendorId={product.vendor_id}
              targetName={product.title}
            />
          </div>
        </div>

        {/* Main 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start min-w-0">
          {/* Left Column: Product Photos & Description (7 cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 min-w-0">
            {/* Primary Image Gallery or Seller-Photo-Pending Placeholder */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="aspect-square sm:aspect-4/3 w-full bg-muted relative">
                {!missingPhoto ? (
                  <img
                    src={product.images[0]}
                    alt={`${product.title} — sold by ${
                      product.vendor?.shop_name || 'verified seller on Jetty'
                    }`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-muted/40 to-muted">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border text-[#0F6E6E] dark:text-[#E8B84A] shadow-2xs mb-3">
                      <Package className="h-7 w-7" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 px-3 py-1 text-xs font-bold text-amber-950 dark:text-amber-200">
                      <CameraOff className="h-3.5 w-3.5" />
                      Seller photo pending verification
                    </span>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-2 leading-relaxed">
                      This listing is flagged for the seller to upload an actual photo of the item. Request a live photo on WhatsApp before travelling or paying.
                    </p>
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-2.5 sm:p-3 border-t border-border bg-muted/40">
                  {product.images.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg border border-border overflow-hidden bg-card"
                    >
                      <img
                        src={img}
                        alt={`${product.title} photo ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details & Description Card */}
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {product.category && (
                  <Link
                    href={`/category/${product.category.slug}`}
                    className="inline-flex items-center gap-1 rounded-md bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/25 px-2.5 py-1 text-xs font-semibold text-[#0A4F4F] dark:text-[#E8B84A]"
                  >
                    <Tag className="h-3 w-3" />
                    {product.category.name}
                  </Link>
                )}
                <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  {conditionLabels[product.condition] || product.condition}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {daysConfirmed === 0
                    ? 'Stock confirmed today'
                    : `Stock confirmed ${daysConfirmed}d ago`}
                </span>
              </div>

              {stale && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-3 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Availability check advised:</strong> Message the vendor on WhatsApp to confirm this item is still in stock before travelling.
                  </div>
                </div>
              )}

              <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight leading-snug">
                {product.title}
              </h1>

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {product.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/marketplace?q=${encodeURIComponent(tag)}`}
                      className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-[#0F6E6E]"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              <div className="space-y-1.5 pt-2 border-t border-border">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Description &amp; Included Items
                </h2>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Box & Vendor Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5 min-w-0">
            <ProductOrderBox product={product} />

            {/* Vendor Identity Card */}
            {product.vendor && (
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3.5">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/15 text-[#0F6E6E] dark:text-[#E8B84A]">
                    {product.vendor.logo_url ? (
                      <img
                        src={product.vendor.logo_url}
                        alt={`${product.vendor.shop_name} logo`}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      <Store className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <Link
                        href={`/vendors/${product.vendor.slug || product.vendor.id}`}
                        className="text-sm sm:text-base font-bold text-foreground hover:text-[#0F6E6E] transition-colors leading-snug"
                      >
                        {product.vendor.shop_name}
                      </Link>
                      {product.vendor.verification_status === 'verified' && (
                        <BadgeCheck
                          className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5"
                          aria-label="Verified Vendor"
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                        {getSellerDistinctionLabel(product.vendor)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.vendor.verification_status === 'verified'
                          ? 'Verified Jetty vendor'
                          : 'Pending verification'}
                      </span>
                    </div>
                  </div>
                </div>

                {product.vendor.location_visibility !== 'hidden' &&
                  product.vendor.location_label && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-foreground">Pickup landmark:</strong>{' '}
                        {product.vendor.location_label}
                      </span>
                    </div>
                  )}

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {product.vendor.description}
                </p>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground truncate">
                    {product.vendor.verification_status === 'verified'
                      ? 'Identity & WhatsApp checked by Jetty'
                      : 'Unverified seller — inspect before paying'}
                  </span>
                  <Link
                    href={`/vendors/${product.vendor.slug || product.vendor.id}`}
                    className="text-xs font-bold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline shrink-0"
                  >
                    Visit Store →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products in Category */}
        {moreInCategory.length > 0 && (
          <section className="pt-6 border-t border-border space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                More in {product.category?.name || 'Marketplace'}
              </h2>
              {product.category && (
                <Link
                  href={`/category/${product.category.slug}`}
                  className="text-xs font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline shrink-0"
                >
                  View all →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {moreInCategory.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
