import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function VendorsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; campus?: string }>
}) {
  const sp = await searchParams
  const params = new URLSearchParams()
  params.set('tab', 'stores')
  if (sp.q) params.set('q', sp.q)
  if (sp.filter) params.set('filter', sp.filter)
  if (sp.campus) params.set('campus', sp.campus)

  redirect(`/marketplace?${params.toString()}`)
}
