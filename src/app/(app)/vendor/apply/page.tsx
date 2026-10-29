import { redirect } from 'next/navigation'
import { getCurrentUserContext, getPublicCategories } from '@/lib/queries'
import { VendorApplyForm } from './VendorApplyForm'

export const dynamic = 'force-dynamic'

export default async function VendorApplyPage() {
  const [{ user, profile, vendor }, categories] = await Promise.all([
    getCurrentUserContext(),
    getPublicCategories(),
  ])

  if (!user || !profile) {
    redirect('/login?next=/vendor/apply')
  }

  return (
    <div className="py-8 md:py-10">
      <div className="container mx-auto max-w-4xl px-4">
        <VendorApplyForm
          user={user}
          profile={profile}
          existingVendor={vendor}
          categories={categories}
        />
      </div>
    </div>
  )
}
