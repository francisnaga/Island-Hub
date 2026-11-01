import { redirect } from 'next/navigation'
import { getCurrentUserContext } from '@/lib/queries'
import { VendorApplyForm } from './VendorApplyForm'

export const dynamic = 'force-dynamic'

export default async function VendorApplyPage() {
  const { user, profile, vendor } = await getCurrentUserContext()

  if (!user || !profile) {
    redirect('/login?next=/vendor/apply')
  }

  // If the signed-in user already has a vendor store, take them straight to their store dashboard
  if (vendor && vendor.shop_name && vendor.whatsapp_number) {
    redirect('/vendor/dashboard')
  }

  return (
    <VendorApplyForm
      user={user}
      profile={profile}
      existingVendor={vendor}
    />
  )
}
