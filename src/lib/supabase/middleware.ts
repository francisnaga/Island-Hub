import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isProtectedRoute = 
    pathname.startsWith('/home') || 
    pathname.startsWith('/houses') || 
    pathname.startsWith('/services') || 
    pathname.startsWith('/marketplace') || 
    pathname.startsWith('/requests') || 
    pathname.startsWith('/lost-found') || 
    pathname.startsWith('/vendors') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/announcements') || 
    pathname.startsWith('/notifications')
    
  const isAdminRoute = pathname.startsWith('/admin')

  if (!user && (isProtectedRoute || isAdminRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  if (isAdminRoute && user) {
     const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
     if (profile?.role !== 'admin') {
         const url = request.nextUrl.clone()
         url.pathname = '/home'
         return NextResponse.redirect(url)
     }
  }

  return supabaseResponse
}
