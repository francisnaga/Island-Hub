import { redirect } from 'next/navigation'

export default async function NewVendorProductPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const sp = await searchParams
  const kind =
    sp.type === 'housing' || sp.type === 'room'
      ? 'room'
      : sp.type === 'service' || sp.type === 'svc'
      ? 'svc'
      : sp.type === 'item' || sp.type === 'product' || sp.type === 'food'
      ? 'item'
      : ''

  if (kind) {
    redirect(`/vendor/dashboard?tab=new&kind=${kind}`)
  }
  redirect('/vendor/dashboard?tab=new')
}
