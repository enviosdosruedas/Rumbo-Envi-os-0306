// middleware.ts (Modificado para permitir acceso directo)
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Ya no verificamos la sesión aquí.
  // Simplemente creamos la respuesta y la retornamos para que la petición continúe.
  const response = NextResponse.next({
    request,
  });

  return response;
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
};
