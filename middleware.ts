import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const pathname = request.nextUrl.pathname

  // No procesar la página raíz o la página de bienvenida en el middleware
  if (pathname === "/" || pathname === "/welcome") {
    return supabaseResponse
  }

  // Verificar si el usuario está autenticado solo para rutas que no sean la raíz o welcome
  try {
    // Primero verificamos si hay una sesión activa
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      // Si no hay sesión y está intentando acceder a rutas protegidas
      const isProtectedRoute =
        pathname.startsWith("/panel") ||
        pathname.startsWith("/repartos") ||
        pathname.startsWith("/mapa-rutas") ||
        pathname.startsWith("/perfil")

      if (isProtectedRoute) {
        const redirectUrl = new URL("/login", request.url)
        return NextResponse.redirect(redirectUrl)
      }

      return supabaseResponse
    }

    // Si hay sesión, verificamos el usuario
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isAuthPage = pathname.startsWith("/login")
    const isProtectedRoute =
      pathname.startsWith("/panel") ||
      pathname.startsWith("/repartos") ||
      pathname.startsWith("/mapa-rutas") ||
      pathname.startsWith("/perfil")

    // Si está autenticado y trata de acceder al login
    if (user && isAuthPage) {
      const redirectUrl = new URL("/panel", request.url)
      return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
  } catch (error) {
    // En caso de error, permitir que la página se encargue
    console.error("Error en middleware:", error)
    return supabaseResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
