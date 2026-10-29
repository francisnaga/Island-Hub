import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserContext, getPublicCategories } from '@/lib/queries'
import { Product } from '@/lib/types'
import { ProductForm } from '@/components/vendor/ProductForm'

export const dynamic = 'force-dynamic'

export default async function EditVendorProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [{ user, vendor }, categories] = await Promise.all([
    getCurrentUserContext(),
    getPublicCategories(),
  ])

  if (!user) {
    redirect(`/login?next=/vendor/products/${id}/edit`)
  }

  if (!vendor) {
    redirect('/vendor/apply')
  }

  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('vendor_id', vendor.id)
    .maybeSingle()

  if (!product) {
    notFound()
  }

  return (
    <div className="py-8 md:py-10">
      <div className="container mx-auto max-w-4xl px-4">
        <ProductForm
          vendor={vendor}
          categories={categories}
          existingProduct={product as Product}
        />
      </div>
    </div>
  )
}
