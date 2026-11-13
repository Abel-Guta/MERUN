import type { NextRequest } from 'next/server'
import { errorResponse, listResponse } from '../../../../../lib/server/http'
import { userExists } from '../../../../../lib/server/runs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  if (!userExists(username)) return errorResponse(404, 'not_found', 'User not found.')
  return listResponse(request.nextUrl.searchParams, username)
}
