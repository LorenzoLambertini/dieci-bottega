import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — must not write any response body before this
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Allow login page through
  if (pathname.startsWith("/crm/login")) {
    // If already authenticated, redirect to dashboard
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/crm/dashboard";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Protect all /crm/* routes
  if (pathname.startsWith("/crm")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/crm/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/crm/:path*"],
};
