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
} from 'lucide-react'
import { ProductOrderBox } from '@/components/marketplace/ProductOrderBox'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { ProductCard } from '@/components/cards/ProductCard'
import {
  getPublicProductBySlugOrId,
  getPublicProducts,
} from '@/lib/queries'
import { daysSinceConfirmed, isListingStale } from '@/lib/whatsapp'

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

  const { products: relatedProducts } = await getPublicProducts({
    category: product.category?.slug || product.category_id,
    limit: 5,
  })
  const moreInCategory = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  const stale = isListingStale(product.last_confirmed_at, 14)
  const daysConfirmed = daysSinceConfirmed(product.last_confirmed_at)

  return (
    <div className="py-8 md:py-10">
      <div className="container mx-auto max-w-7xl px-4 space-y-10">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/marketplace" className="inline-flex items-center gap-1 hover:text-slate-900 font-medium">
              <ArrowLeft className="h-3.5 w-3.5" />
              Marketplace
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <Link
                  href={`/category/${product.category.slug}`}
                  className="hover:text-slate-900"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate max-w-[220px]">
              {product.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Share Button */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `🛒 Found this on Jetty — ${product.title} at ₦${product.price.toLocaleString('en-NG')}\n\nCheck it out: https://jetty.ng/product/${product.slug || product.id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-1.5 text-xs font-semibold text-[#128C7E] hover:bg-[#25D366]/20 transition-colors"
              title="Share this product on WhatsApp"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Product Photos & Description (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Image Gallery */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="aspect-4/3 w-full bg-slate-100 relative">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <Package className="h-16 w-16" />
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-3 border-t border-slate-100 bg-slate-50">
                  {product.images.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg border border-slate-200 overflow-hidden bg-white"
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                {product.category && (
                  <Link
                    href={`/category/${product.category.slug}`}
                    className="inline-flex items-center gap-1 rounded-full bg-[#E6F2F2] border border-[#0F6E6E]/25 px-3 py-1 text-xs font-semibold text-[#0A4F4F]"
                  >
                    <Tag className="h-3 w-3 text-[#0F6E6E]" />
                    {product.category.name}
                  </Link>
                )}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Condition: {conditionLabels[product.condition] || product.condition}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  <Clock className="h-3 w-3 text-slate-500" />
                  {daysConfirmed === 0
                    ? 'Stock confirmed today'
                    : `Stock confirmed ${daysConfirmed}d ago`}
                </span>
              </div>

              {stale && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Availability check advised:</strong> This listing has not had its stock status re-confirmed in over 14 days. Message the vendor on WhatsApp to confirm it is still in stock.
                  </div>
                </div>
              )}

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {product.title}
                </h1>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Product Description
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Box & Vendor Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <ProductOrderBox product={product} />

            {/* Vendor Identity Card */}
            {product.vendor && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E6F2F2] border border-[#0F6E6E]/15 text-[#0F6E6E]">
                      {product.vendor.logo_url ? (
                        <img
                          src={product.vendor.logo_url}
                          alt={product.vendor.shop_name}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        <Store className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/vendors/${product.vendor.slug || product.vendor.id}`}
                          className="text-base font-bold text-slate-900 hover:text-[#0F6E6E] transition-colors"
                        >
                          {product.vendor.shop_name}
                        </Link>
                        {product.vendor.verification_status === 'verified' && (
                          <BadgeCheck
                            className="h-4 w-4 text-[#0F6E6E] shrink-0"
                            aria-label="Verified Vendor"
                          />
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {product.vendor.verification_status === 'verified'
                          ? 'Sold by a verified Jetty vendor'
                          : 'Pending verification'}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.vendor.description}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    Verified badge confirms seller contact details
                  </span>
                  <Link
                    href={`/vendors/${product.vendor.slug || product.vendor.id}`}
                    className="text-xs font-bold text-[#0F6E6E] hover:underline shrink-0"
                  >
                    Visit Storefront →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products in Category */}
        {moreInCategory.length > 0 && (
          <section className="pt-8 border-t border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                More in {product.category?.name || 'Marketplace'}
              </h2>
              {product.category && (
                <Link
                  href={`/category/${product.category.slug}`}
                  className="text-xs font-semibold text-[#0F6E6E] hover:underline"
                >
                  View all in category →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
