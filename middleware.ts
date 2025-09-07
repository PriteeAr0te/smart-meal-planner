import { JWT } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(
    function middleware() {
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }: { token: JWT | null, req: NextRequest }) => {
                const { pathname } = req.nextUrl;

                if (pathname.startsWith('/api/auth') ||
                    pathname === '/login' ||
                    pathname === '/register' ||
                    pathname === '/forgot-password' ||
                    pathname === '/reset-password' ||
                    pathname === '/') {
                    return true;
                }

                return !!token;
            }
        }
    }
);

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}