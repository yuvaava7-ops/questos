import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const PROTECTED_PATHS = ["/dashboard"];
const SIGNED_OUT_ONLY_PATHS = ["/", "/login", "/signup"];

export async function middleware(request: NextRequest) {
  // Without Supabase configured, /dashboard renders SetupNotice instead —
  // nothing to gate yet.
  if (!isSupabaseConfigured) return NextResponse.next();

  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && SIGNED_OUT_ONLY_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|camera-hero|.*\\.(?:png|jpg|jpeg|svg|webp|mp4|webm)$).*)"],
};
