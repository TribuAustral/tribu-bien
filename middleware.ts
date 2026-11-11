import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, isValidToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // /login y la visita diaria automática (/api/keepalive) no piden contraseña
  if (pathname.startsWith("/login") || pathname === "/api/keepalive") return NextResponse.next();
  const ok = await isValidToken(req.cookies.get(COOKIE_NAME)?.value);
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // El manifiesto y los íconos de la app deben verse sin contraseña (los pide el teléfono al instalar)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.png|apple-icon.png|icon-|logo.png|manifest.webmanifest).*)"],
};
