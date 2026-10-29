import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserContext, getPublicCategories } from '@/lib/queries'
import { INITIAL_PRODUCTS, INITIAL_VENDORS } from '@/lib/marketplace-data'
import { isAdminEmail, ModerationLog, Product, ReportRecord, Vendor, CategoryRequest } from '@/lib/types'
import { AdminDashboardClient } from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const { user, profile } = await getCurrentUserContext()

  if (!user || !profile) {
    redirect('/login?next=/admin')
  }

  if (profile.role !== 'admin' && !isAdminEmail(user.email)) {
    redirect('/')
  }

  let vendors: Vendor[] = INITIAL_VENDORS
  let products: Product[] = INITIAL_PRODUCTS
  let reports: ReportRecord[] = []
  let logs: ModerationLog[] = []
  let categoryRequests: CategoryRequest[] = []
  const categories = await getPublicCategories()

  try {
    const supabase = await createClient()
    const [vRes, pRes, rRes, lRes, crRes] = await Promise.all([
      supabase.from('vendors').select('*').order('created_at', { ascending: false }),
      supabase
        .from('products')
        .select('*, category:categories(*), vendor:vendors(*)')
        .order('created_at', { ascending: false }),
      supabase
        .from('reports')
        .select('*, product:products(id, title, slug), vendor:vendors(id, shop_name, slug)')
        .order('created_at', { ascending: false }),
      supabase
        .from('moderation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('category_requests')
        .select('*')
        .order('created_at', { ascending: false }),
    ])

    if (vRes.data && vRes.data.length > 0) vendors = vRes.data as Vendor[]
    if (pRes.data && pRes.data.length > 0) products = pRes.data as Product[]
    if (rRes.data) reports = rRes.data as ReportRecord[]
    if (lRes.data) logs = lRes.data as ModerationLog[]
    if (crRes.data) categoryRequests = crRes.data as CategoryRequest[]
  } catch {
    // Graceful fallback if DB tables are unreachable
  }

  return (
    <div className="py-6 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 min-w-0">
        <AdminDashboardClient
          adminId={user.id}
          initialVendors={vendors}
          initialProducts={products}
          initialReports={reports}
          initialCategories={categories}
          initialCategoryRequests={categoryRequests}
          initialLogs={logs}
        />
      </div>
    </div>
  )
}
