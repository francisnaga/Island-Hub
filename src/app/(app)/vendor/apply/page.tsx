import { redirect } from 'next/navigation'
import { getCurrentUserContext } from '@/lib/queries'
import { VendorApplyForm } from './VendorApplyForm'

export const dynamic = 'force-dynamic'

export default async function VendorApplyPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>
}) {
  const sp = searchParams ? await searchParams : {}
  const nextUrl = sp.next || '/vendor/dashboard'

  const { user, profile, vendor } = await getCurrentUserContext()

  if (!user || !profile) {
    redirect(`/login?next=${encodeURIComponent(`/vendor/apply${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ''}`)}`)
  }

  // If the signed-in user already has a vendor store, take them straight to destination
  if (vendor && vendor.shop_name && vendor.whatsapp_number) {
    redirect(nextUrl)
  }

  return (
    <VendorApplyForm
      user={user}
      profile={profile}
      existingVendor={vendor}
      nextUrl={nextUrl}
    />
  )
}
