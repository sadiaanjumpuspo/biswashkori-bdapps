import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, customResponse?: NextResponse) {
  const supabaseResponse = customResponse || NextResponse.next({
    request,
  })

  // Next.js middleware pass-through for BDApps subscriber session
  return supabaseResponse
}
