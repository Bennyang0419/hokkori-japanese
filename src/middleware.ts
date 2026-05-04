import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
 
const PROTECTED = [
  '/dashboard', '/learn', '/quiz', '/flashcards', '/mistakes',
  '/progress', '/chat', '/writing', '/upload', '/study-plan',
  '/listening', '/shadowing', '/mock-exam', '/settings', '/billing',
  '/api/chat', '/api/quiz', '/api/upload', '/api/listening',
]
 
const PUBLIC_EXACT = ['/', '/login', '/register']
 
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
 
  // Allow static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts') ||
    pathname === '/api/stripe/webhook' ||
    pathname.match(/\.(png|jpg|svg|ico|webp|json|txt|xml|css|js)$/)
  ) {
    return NextResponse.next()
  }
 
  // Allow public pages
  if (PUBLIC_EXACT.includes(pathname)) {
    return NextResponse.next()
  }
 
  // Check if protected
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()
 
  const res = NextResponse.next()
 
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )
 
  const { data: { user } } = await supabase.auth.getUser()
 
  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }
 
  return res
}
 
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
