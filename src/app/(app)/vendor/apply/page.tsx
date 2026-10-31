import { redirect } from 'next/navigation'
import { getCurrentUserContext } from '@/lib/queries'
import { VendorApplyForm } from './VendorApplyForm'

export const dynamic = 'force-dynamic'

export default async function VendorApplyPage() {
  const { user, profile, vendor } = await getCurrentUserContext()

  if (!user || !profile) {
    redirect('/login?next=/vendor/apply')
  }

  return (
    <VendorApplyForm
      user={user}
      profile={profile}
      existingVendor={vendor}
    />
  )
}
