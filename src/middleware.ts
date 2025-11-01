import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Session'ı kontrol et
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Auth sayfaları (giriş yapılmışsa erişilmemeli)
  const authPages = ["/giris-yap", "/uye-ol", "/sifremi-unuttum", "/sifremi-yenile"];
  const isAuthPage = authPages.some((page) => pathname.startsWith(page));

  // Kullanıcı giriş yapmış VE auth sayfasındaysa → Anasayfaya yönlendir
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protected sayfalar (giriş yapılmamışsa erişilmemeli)
  const protectedPages = ["/profile", "/biletlerim", "/sepet"];
  const isProtectedPage = protectedPages.some((page) => pathname.startsWith(page));

  // Kullanıcı giriş yapmamış VE protected sayfadaysa → Login'e yönlendir
  if (!user && isProtectedPage) {
    const redirectUrl = new URL("/giris-yap", request.url);
    // Giriş yaptıktan sonra dönmesi için redirect parametresi ekle
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};