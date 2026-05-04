import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED = [
  '/dashboard', '/learn', '/quiz', '/flashcards', '/mistakes',
  '/progress', '/chat', '/writing', '/upload', '/study-plan',
  '/listening', '/shadowing', '/mock-exam', '/settings', '/billing',
  '/api/chat', '/api/quiz', '/api/upload', '/api/listening',
  '/api/flashcards', '/api/progress',
]

const PUBLIC = ['/', '/login', '/register', '/api/stripe/webhook']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow public routes and static assets
  if (
    PUBLIC.some(p => pathname === p || pathname.startsWith('/api/stripe/webhook')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts') ||
    pathname.match(/\.(png|jpg|svg|ico|webp|json|txt|xml)$/)
  ) {
    return NextResponse.next()
  }

  // Auth check for protected routes
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:  () => req.cookies.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // API routes → 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Pages → redirect to login
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
