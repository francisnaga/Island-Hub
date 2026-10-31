import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/types'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. Canonical Deep-Link Normalization so shared links ALWAYS land on the exact item, store, room, or service
  if (pathname === '/home') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/products/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/products\//, '/product/')
    return NextResponse.redirect(url)
  }

  if (
    pathname.startsWith('/vendor/') &&
    !pathname.startsWith('/vendor/apply') &&
    !pathname.startsWith('/vendor/dashboard') &&
    !pathname.startsWith('/vendor/products')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/vendor\//, '/vendors/')
    return NextResponse.redirect(url)
  }

  if (
    pathname.startsWith('/lodge/') ||
    pathname.startsWith('/lodges/') ||
    pathname.startsWith('/room/') ||
    pathname.startsWith('/rooms/')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/(lodge|lodges|room|rooms)\//, '/housing/')
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/service/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/service\//, '/services/')
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const rawUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zagfgxhewhwothrbyesw.supabase.co'
  ).trim()
  const supabaseUrl = rawUrl.includes('jlhnzqanrzwiiyrwfbja')
    ? 'https://zagfgxhewhwothrbyesw.supabase.co'
    : rawUrl
  const supabaseAnonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZ2ZneGhld2h3b3RocmJ5ZXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzg1NDAsImV4cCI6MjA4ODkxNDU0MH0.iBKqu5z7WMATRF0sJOm60LsJnue0XKfi91N1AdhSXz4'
  ).trim()

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
  // Only account, vendor management, and admin routes require authentication.
  // Browsing products, categories, vendor storefronts, housing, and services is 100% public.
  const isProtectedRoute =
    pathname.startsWith('/vendor/dashboard') ||
    pathname.startsWith('/vendor/products') ||
    pathname.startsWith('/vendor/apply') ||
    pathname.startsWith('/profile')

  const isAdminRoute = pathname.startsWith('/admin')

  if (!user && (isProtectedRoute || isAdminRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const nextPath = request.nextUrl.searchParams.get('next') || '/'
    const url = request.nextUrl.clone()
    url.pathname = nextPath
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (isAdminRoute && user) {
    if (isAdminEmail(user.email)) {
      return supabaseResponse
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
