import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Protect these routes — require login
        const protected_ = ["/hub/settings", "/hub/space/edit", "/hub/onboarding"];
        if (protected_.some((p) => pathname.startsWith(p))) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/hub/settings/:path*", "/hub/space/:path*", "/hub/onboarding/:path*"],
};
