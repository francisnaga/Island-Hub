import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserContext, getPublicCategories } from '@/lib/queries'
import { Product } from '@/lib/types'
import { VendorDashboardClient } from './VendorDashboardClient'

export const dynamic = 'force-dynamic'

export default async function VendorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; kind?: string; edit?: string; new_store?: string }>
}) {
  const [sp, { user, profile, vendor }, categories] = await Promise.all([
    searchParams,
    getCurrentUserContext(),
    getPublicCategories(),
  ])

  if (!user || !profile) {
    redirect('/login?next=/vendor/dashboard')
  }

  if (!vendor || !vendor.shop_name || !vendor.whatsapp_number) {
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
    <VendorDashboardClient
      user={user}
      profile={profile}
      vendor={vendor}
      initialProducts={vendorProducts}
      categories={categories}
      initialTab={sp.tab === 'new' ? 'new' : sp.tab === 'store' ? 'store' : 'listings'}
      initialKind={
        sp.kind === 'room' || sp.kind === 'svc' || sp.kind === 'item'
          ? sp.kind
          : undefined
      }
      initialEditId={sp.edit || undefined}
      initialNewStore={sp.new_store === '1'}
    />
  )
}
