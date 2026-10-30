import { LODGE_LISTINGS } from '@/lib/lodge-data'
import { HousingClient } from './HousingClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Student Lodges & Bedspaces near NMU | Jetty',
  description:
    'Find inspected and verified student rooms, self-contains, and bedspaces around NMU Okerenkoko and Kurutie campuses. No inspection fees, direct WhatsApp contact with caretakers.',
}

export default async function HousingPage({
  searchParams,
}: {
  searchParams: Promise<{ campus?: string; type?: string }>
}) {
  const sp = await searchParams
  const selectedCampus = sp.campus || 'all'
  const selectedType = sp.type || 'all'

  return (
    <div className="py-5 sm:py-8 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 min-w-0">
        <HousingClient
          initialLodges={LODGE_LISTINGS}
          initialCampus={selectedCampus}
          initialType={selectedType}
        />
      </div>
    </div>
  )
}
