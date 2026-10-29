import { redirect } from 'next/navigation'
import { getCurrentUserContext, getPublicCategories } from '@/lib/queries'
import { ProductForm } from '@/components/vendor/ProductForm'

export const dynamic = 'force-dynamic'

export default async function NewVendorProductPage() {
  const [{ user, vendor }, categories] = await Promise.all([
    getCurrentUserContext(),
    getPublicCategories(),
  ])

  if (!user) {
    redirect('/login?next=/vendor/products/new')
  }

  if (!vendor) {
    redirect('/vendor/apply')
  }

  return (
    <div className="py-8 md:py-10">
      <div className="container mx-auto max-w-4xl px-4">
        <ProductForm vendor={vendor} categories={categories} />
      </div>
    </div>
  )
}
