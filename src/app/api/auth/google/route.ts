import { NextResponse } from 'next/server'

function getPublicOrigin(request: Request): string {
  const url = new URL(request.url)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }
  return url.origin
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') || '/vendor/apply'
  const origin = getPublicOrigin(request)

  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '933767752231-lqadfle5brnh3bcf05q8lhfdd6ulpvsn.apps.googleusercontent.com'

  const redirectUri = `${origin}/auth/callback`

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', clientId)
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('prompt', 'select_account')
  googleAuthUrl.searchParams.set('state', next)

  return NextResponse.redirect(googleAuthUrl.toString())
}
