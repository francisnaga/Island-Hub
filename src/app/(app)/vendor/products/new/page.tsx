import { redirect } from 'next/navigation'
import { getCurrentUserContext, getPublicCategories } from '@/lib/queries'
import { ProductForm } from '@/components/vendor/ProductForm'
import { ListingType } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function NewVendorProductPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const sp = await searchParams
  const [{ user, vendor }, categories] = await Promise.all([
    getCurrentUserContext(),
    getPublicCategories(),
  ])

  const requestedType =
    sp.type === 'housing' || sp.type === 'service' || sp.type === 'food'
      ? (sp.type as ListingType)
      : 'product'

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/vendor/products/new?type=${requestedType}`)}`)
  }

  if (!vendor) {
    redirect('/vendor/apply')
  }

  return (
    <div className="py-8 md:py-10">
      <div className="container mx-auto max-w-4xl px-4">
        <ProductForm
          vendor={vendor}
          categories={categories}
          initialType={requestedType}
        />
      </div>
    </div>
  )
}
