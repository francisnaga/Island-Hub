import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import { WaterlineProductCard } from '@/components/cards/WaterlineProductCard'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { getVendorInitials } from '@/components/cards/VendorCard'
import {
  getPublicProductBySlugOrId,
  getPublicProducts,
} from '@/lib/queries'
import { formatNaira, buildProductWhatsAppUrl, daysSinceConfirmed } from '@/lib/whatsapp'
import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'

export const dynamic = 'force-dynamic'

const conditionLabels: Record<string, string> = {
  new: 'Brand New',
  like_new: 'Like New',
  good: 'Good (Pre-owned)',
  fair: 'Fair Condition',
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

  const vendor = product.vendor
  const categorySlug = product.category?.slug || ''
  const primaryMedia =
    product.images?.[0] || '/products/cadet-action-rig-navy.jpg'

  // Fetch more from this vendor
  const { products: vendorProducts } = await getPublicProducts({
    limit: 6,
  })
  const moreFromVendor = vendorProducts
    .filter((p) => p.vendor_id === product.vendor_id && p.id !== product.id)
    .slice(0, 4)

  const daysConfirmed = daysSinceConfirmed(product.last_confirmed_at)
  const isVerifiedVendor = vendor?.verification_status === 'verified'
  const vendorInitials = vendor ? getVendorInitials(vendor.shop_name) : 'V'

  const whatsappResult = buildProductWhatsAppUrl({
    whatsappNumber: vendor?.whatsapp_number || '',
    productTitle: product.title,
    price: product.price,
    productUrl: `https://jetty.ng/product/${product.slug || product.id}`,
  })

  const hasLocation = Boolean(
    vendor?.location_label &&
      vendor?.location_visibility !== 'hidden' &&
      vendor.location_label.trim().length > 0
  )

  const facts: Array<[string, string]> = [
    ['Condition', conditionLabels[product.condition] || product.condition || 'Good'],
    ['Category', product.category?.name || 'General'],
  ]

  if (product.variants?.sizes && product.variants.sizes.length > 0) {
    facts.push(['Available Sizes', product.variants.sizes.join(', ')])
  }
  if (product.variants?.colors && product.variants.colors.length > 0) {
    facts.push(['Colors', product.variants.colors.join(', ')])
  }

  return (
    <div className="min-w-0 max-w-full pb-28">
      <div className="container mx-auto max-w-lg px-0">
        {/* 1. Image Gallery matching Prototype (.dimg) */}
        <div className="dimg">
          <div className="slides">
            <div className="slide">
              <img
                src={primaryMedia}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images &&
              product.images.slice(1).map((img, i) => (
                <div key={i} className="slide">
                  <img
                    src={img}
                    alt={`${product.title} view ${i + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
          </div>

          {/* Floating Back Button (.ov.l) */}
          <Link href="/marketplace" className="ov l" aria-label="Back to marketplace">
            <ChevronLeft className="w-5 h-5 -ml-0.5 stroke-[2.2]" />
          </Link>

          {/* Floating Share Button (.ov.r) */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Check out ${product.title} on Jetty (₦${product.price.toLocaleString('en-NG')} · ${product.campus || 'NMU'}):\nhttps://jetty.ng/product/${product.slug || product.id}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on WhatsApp"
            className="ov r"
          >
            <Share2 className="w-4.5 h-4.5" />
          </a>

          {/* Slide Indicator Dots (if multiple images) */}
          {product.images && product.images.length > 1 && (
            <div className="dots">
              <i className="on" />
              {product.images.slice(1).map((_, i) => (
                <i key={i} />
              ))}
            </div>
          )}
        </div>

        {/* 2. Detail Body matching Prototype (.db) */}
        <div className="db">
          {/* Price (.dp) */}
          <div className="dp">{formatNaira(product.price)}</div>

          {/* Title (.dt) */}
          <h1 className="dt">{product.title}</h1>

          {/* Metadata Row (.dmeta) */}
          <div className="dmeta">
            {isVerifiedVendor && (
              <span className="ver">
                <svg
                  className="w-3.5 h-3.5 fill-none stroke-current"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Verified seller</span>
              </span>
            )}
            <span>
              <MapPin className="w-3.5 h-3.5 stroke-[2]" />
              <span>{product.campus || vendor?.campus || 'NMU Campus'}</span>
            </span>
            <span>
              <Clock className="w-3.5 h-3.5 stroke-[2]" />
              <span>
                {daysConfirmed === 0 ? 'Confirmed today' : `Confirmed ${daysConfirmed}d ago`}
              </span>
            </span>
          </div>

          {/* Divider (.dv) */}
          <div className="dv" />

          {/* Facts Definition List (.facts) */}
          <dl className="facts">
            {facts.map(([label, val]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{val}</dd>
              </div>
            ))}
          </dl>

          {/* Location Landmark: ONLY SHOWN IF VENDOR ADDED ONE (User Rule) */}
          {hasLocation && (
            <div className="mt-4 p-3.5 rounded-[12px] bg-card border border-border/80 text-xs flex items-start gap-2.5 text-muted-foreground shadow-2xs">
              <MapPin className="w-4 h-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
              <div>
                <b className="text-foreground">Pickup Location: </b>
                <span>{vendor?.location_label}</span>
              </div>
            </div>
          )}

          {/* Divider (.dv) */}
          <div className="dv" />

          {/* Seller Row (.sr) */}
          {vendor && (
            <Link
              href={`/vendors/${vendor.slug || vendor.id}`}
              className="sr group"
              aria-label={`View ${vendor.shop_name}'s storefront`}
            >
              <div className="av">
                {vendor.logo_url ? (
                  <img
                    src={vendor.logo_url}
                    alt={vendor.shop_name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{vendorInitials}</span>
                )}
              </div>

              <div className="bd">
                <b>
                  <span>{vendor.shop_name}</span>
                  {isVerifiedVendor && (
                    <svg
                      className="w-4 h-4 text-[#0F6E6E] dark:text-[#22D3EE] shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </b>
                <small>Visit seller storefront</small>
              </div>

              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {/* Divider (.dv) */}
          <div className="dv" />

          {/* About this item (.hh & .dd) */}
          <h3 className="hh">About this item</h3>
          <p className="dd">{product.description}</p>

          {/* Divider (.dv) */}
          <div className="dv" />

          {/* Campus Safety Tip (.tip) */}
          <div className="tip">
            <ShieldCheck className="w-5 h-5 text-[#0F6E6E] dark:text-[#22D3EE] shrink-0 mt-0.5" />
            <span>Meet on campus in a public spot and inspect the item before you pay.</span>
          </div>

          {/* More from this seller rail */}
          {moreFromVendor.length > 0 && (
            <>
              <div className="dv" />
              <h3 className="hh">More from {vendor?.shop_name || 'seller'}</h3>
              <div className="rail flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x">
                {moreFromVendor.map((p) => (
                  <WaterlineProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}

          {/* Report listing button */}
          <div className="pt-2 text-center">
            <ReportListingModal
              targetType="product"
              productId={product.id}
              vendorId={product.vendor_id}
              targetName={product.title}
            />
          </div>
        </div>
      </div>

      {/* 3. Sticky Bottom Action Bar (.bar) matching Prototype exactly */}
      <div className="bar">
        <div className="pp min-w-0">
          <b>{formatNaira(product.price)}</b>
          <small>Pay when you meet</small>
        </div>

        {whatsappResult.valid ? (
          <a
            href={whatsappResult.url}
            target="_blank"
            rel="noopener noreferrer"
            className="go"
          >
            <WhatsAppIcon className="w-4.5 h-4.5 text-white" />
            <span>Message seller</span>
          </a>
        ) : (
          <span className="text-xs text-red-500 font-semibold">Unavailable</span>
        )}
      </div>
    </div>
  )
}
