import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserContext, getPublicCategories } from '@/lib/queries'
import { Product } from '@/lib/types'
import { VendorDashboardClient } from './VendorDashboardClient'

export const dynamic = 'force-dynamic'

export default async function VendorDashboardPage() {
  const [{ user, profile, vendor }, categories] = await Promise.all([
    getCurrentUserContext(),
    getPublicCategories(),
  ])

  if (!user || !profile) {
    redirect('/login?next=/vendor/dashboard')
  }

  if (!vendor) {
    redirect('/vendor/apply')
  }

  let vendorProducts: Product[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })

    if (data) {
      vendorProducts = data as Product[]
    }
  } catch {
    vendorProducts = []
  }

  return (
    <div className="py-8 md:py-10">
      <div className="container mx-auto max-w-7xl px-4">
        <VendorDashboardClient
          user={user}
          profile={profile}
          vendor={vendor}
          initialProducts={vendorProducts}
          categories={categories}
        />
      </div>
    </div>
  )
}
