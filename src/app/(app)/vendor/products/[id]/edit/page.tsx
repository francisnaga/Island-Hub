import { redirect } from 'next/navigation'

export default async function EditVendorProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/vendor/dashboard?edit=${encodeURIComponent(id)}`)
}
