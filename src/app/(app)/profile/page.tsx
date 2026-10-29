import { redirect } from 'next/navigation'
import { getCurrentUserContext } from '@/lib/queries'
import { ProfileClient } from './ProfileClient'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const { user, profile, vendor } = await getCurrentUserContext()

  if (!user || !profile) {
    redirect('/login?next=/profile')
  }

  return (
    <div className="py-8 md:py-10">
      <div className="container mx-auto max-w-4xl px-4">
        <ProfileClient user={user} profile={profile} vendor={vendor} />
      </div>
    </div>
  )
}
