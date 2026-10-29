import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserContext, getPublicCategories } from '@/lib/queries'
import { ModerationLog, Product, ReportRecord, Vendor } from '@/lib/types'
import { AdminDashboardClient } from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const { user, profile } = await getCurrentUserContext()

  if (!user || !profile) {
    redirect('/login?next=/admin')
  }

  if (profile.role !== 'admin') {
    redirect('/')
  }

  let vendors: Vendor[] = []
  let products: Product[] = []
  let reports: ReportRecord[] = []
  let logs: ModerationLog[] = []
  const categories = await getPublicCategories()

  try {
    const supabase = await createClient()
    const [vRes, pRes, rRes, lRes] = await Promise.all([
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
    ])

    if (vRes.data) vendors = vRes.data as Vendor[]
    if (pRes.data) products = pRes.data as Product[]
    if (rRes.data) reports = rRes.data as ReportRecord[]
    if (lRes.data) logs = lRes.data as ModerationLog[]
  } catch {
    // Graceful fallback if DB tables are not yet migrated
  }

  return (
    <div className="py-8 md:py-10">
      <div className="container mx-auto max-w-7xl px-4">
        <AdminDashboardClient
          adminId={user.id}
          initialVendors={vendors}
          initialProducts={products}
          initialReports={reports}
          initialCategories={categories}
          initialLogs={logs}
        />
      </div>
    </div>
  )
}
