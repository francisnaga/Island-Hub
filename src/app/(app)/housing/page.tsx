import { cookies } from 'next/headers'
import { getPublicLodges } from '@/lib/queries'
import { HousingClient } from './HousingClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Student Lodges & Bedspaces near NMU | Jetty',
  description:
    'Find inspected and verified student rooms, self-contains, and bedspaces around NMU Okerenkoko and Kurutie campuses. No inspection fees, direct WhatsApp contact with caretakers.',
  keywords: [
    'NMU lodges',
    'NMU student hostels',
    'student accommodation Okerenkoko',
    'bedspaces Kurutie campus',
    'rooms near Nigeria Maritime University',
    'hostels around NMU',
  ],
  alternates: {
    canonical: 'https://jetty.francisnaga.site/housing',
  },
}

export default async function HousingPage({
  searchParams,
}: {
  searchParams: Promise<{ campus?: string; type?: string; q?: string }>
}) {
  const sp = await searchParams
  const cookieStore = await cookies()
  const cookieCampus = cookieStore.get('jetty_campus')?.value
  const selectedCampus =
    sp.campus || (cookieCampus && cookieCampus !== 'all' ? cookieCampus : 'all')
  const selectedType = sp.type || 'all'
  const lodges = await getPublicLodges()

  return (
    <div className="py-5 sm:py-8 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 min-w-0">
        <HousingClient
          initialLodges={lodges}
          initialCampus={selectedCampus}
          initialType={selectedType}
          initialQuery={sp.q || ''}
        />
      </div>
    </div>
  )
}
