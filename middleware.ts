import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // --- RATE LIMITING ---
    // Only run on specific routes to save Redis calls
    if (request.nextUrl.pathname.startsWith('/api/payment')) {
        const ip = (request as any).ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
        try {
            // Create a new ratelimiter, that allows 10 requests per 60 seconds
            const ratelimit = new Ratelimit({
                redis: new Redis({
                    url: process.env.UPSTASH_REDIS_REST_URL!,
                    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
                }),
                limiter: Ratelimit.slidingWindow(10, "60 s"),
                prefix: "@upstash/ratelimit",
            });

            const { success } = await ratelimit.limit(`ratelimit_payment_${ip}`);

            if (!success) {
                return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
            }
        } catch (error) {
            console.error('Rate limit error:', error);
            // Fail open so we don't block users if Redis is down
        }
    }
    // ---------------------

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // --- SECURITY: Route Guard ---
    const url = request.nextUrl.clone();
    const path = url.pathname;

    // Protected Routes
    const protectedPrefixes = ['/profile', '/orders', '/account'];
    if (protectedPrefixes.some(p => path.startsWith(p)) && !user) {
        url.pathname = '/login';
        url.searchParams.set('next', path);
        return NextResponse.redirect(url);
    }

    // Admin Routes
    if (path.startsWith('/admin')) {
        if (!user) {
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        // Strictly check role from DB or custom claims if available
        // For now, we trust the session but ideally we fetch profile
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        // @ts-ignore
        if (profile?.role !== 'admin') {
            url.pathname = '/'; // Bounce non-admins to home
            return NextResponse.redirect(url);
        }
    }
    // -----------------------------

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}