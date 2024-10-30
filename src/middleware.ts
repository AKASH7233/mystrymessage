import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export { default } from "next-auth/middleware"
import { getToken  } from 'next-auth/jwt'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const url = request.nextUrl;

    if(token && (
        url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up') ||
        url.pathname.startsWith('/verify-email') ||
        url.pathname.startsWith('/forgot-password') ||
        url.pathname.startsWith('/reset-password')
    ) ){
        return NextResponse.redirect(new URL('/dashboard', url.origin))
    }

    // if(!token && (
    //     url.pathname.startsWith('/dashboard') ||
    //     url.pathname.startsWith('/profile') ||
    //     url.pathname.startsWith('/messages') ||
    //     url.pathname.startsWith('/settings') ||
    //     url.pathname.startsWith('/logout') 
    // ) ){
    //     return NextResponse.redirect(new URL('/sign-in', url.origin))
    // }

    return NextResponse.next()
}
 

export const config = {
  matcher:[ 
    '/sign-in',
    '/sing-up',
    '/',
    '/dashboard/:path*',
    '/forgot-password',
    '/reset-password/[...token]',
    '/verify-email/[...token]'
 ],
}