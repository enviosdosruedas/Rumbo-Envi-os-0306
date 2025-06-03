import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
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
    // Primero verificamos si hay una sesión activa
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error in middleware:", sessionError.message)
      // Continue to next middleware/route handler
      return supabaseResponse
    }

    if (!sessionData.session) {
      // Si no hay sesión y está intentando acceder a rutas protegidas
      const isProtectedRoute =
        pathname.startsWith("/panel") ||
        pathname.startsWith("/repartos") ||
        pathname.startsWith("/mapa-rutas") ||
        pathname.startsWith("/perfil") ||
        pathname.startsWith("/envios")

      if (isProtectedRoute) {
        const redirectUrl = new URL("/login", request.url)
        return NextResponse.redirect(redirectUrl)
      }

      return supabaseResponse
    }

    // Si hay sesión, verificamos el usuario
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("User error in middleware:", userError.message)
      return supabaseResponse
    }

    const isAuthPage = pathname.startsWith("/login")
    const isProtectedRoute =
      pathname.startsWith("/panel") ||
      pathname.startsWith("/repartos") ||
      pathname.startsWith("/mapa-rutas") ||
      pathname.startsWith("/perfil") ||
      pathname.startsWith("/envios")

    // Si está autenticado y trata de acceder al login
    if (userData.user && isAuthPage) {
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
