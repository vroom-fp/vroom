import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import CustomError from "./server/helpers/CustomError";
import * as jose from 'jose'
import { errorHandler } from "./server/helpers/ErrorHandler";

export async function middleware(request: NextRequest) {
  try {
    const api = request.nextUrl.pathname.startsWith("/api")
    const routes = ["/api/profile", "/api/wishlist", "/api/trips"]
    const currentRoute = request.nextUrl.pathname
    const cookieStore = await cookies()
    
    if (api) {
      if (routes.includes(currentRoute)) {
        const authorization = request.headers.get('authorization')
        if (!authorization) throw new CustomError("Unauthorized", 401)
        const secret = new TextEncoder().encode(process.env.SECRET_KEY)

        const { payload } = await jose.jwtVerify<{ id: string, email: string }>(authorization, secret)

        const newHeader = new Headers(request.headers)
        newHeader.set("x-user-id", payload.id)
        newHeader.set("x-user-email", payload.email)

        const response = NextResponse.next({
          headers: newHeader
        })

        return response
      }
    }
  } catch (err: unknown) {
    const { status, message } = errorHandler(err)
    return NextResponse.json({ message }, { status })
  }
}
