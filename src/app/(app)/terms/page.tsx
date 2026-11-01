import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Terms of Service | Jetty NMU',
  description: 'Jetty terms of service and student trading community rules for Nigeria Maritime University.',
  alternates: {
    canonical: 'https://jetty.francisnaga.site/terms',
  },
}

export default function TermsPage() {
  redirect('/safety#terms-of-use')
}
