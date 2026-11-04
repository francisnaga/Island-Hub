import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SellRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = searchParams ? await searchParams : {}
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === 'string') {
      params.set(key, value)
    } else if (Array.isArray(value) && value[0]) {
      params.set(key, value[0])
    }
  }

  const qs = params.toString()
  redirect(qs ? `/vendor/apply?${qs}` : '/vendor/apply')
}
