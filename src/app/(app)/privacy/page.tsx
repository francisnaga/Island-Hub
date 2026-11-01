import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Privacy Policy | Jetty NMU',
  description: 'Jetty privacy policy and student data security architecture for Nigeria Maritime University.',
  alternates: {
    canonical: 'https://jetty.francisnaga.site/privacy',
  },
}

export default function PrivacyPage() {
  redirect('/safety#privacy-policy')
}
