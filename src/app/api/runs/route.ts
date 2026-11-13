import type { NextRequest } from 'next/server'
import { errorResponse, listResponse } from '../../../lib/server/http'
import { createRun } from '../../../lib/server/runs'
import { parseNewRun } from '../../../lib/server/validate'

export function GET(request: NextRequest) {
  return listResponse(request.nextUrl.searchParams)
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse(400, 'invalid_json', 'Request body must be valid JSON.')
  }

  const parsed = parseNewRun(body)
  if (!parsed.ok) {
    return errorResponse(422, 'validation_failed', 'The run is invalid.', parsed.fields)
  }

  const run = createRun(parsed.value)
  return Response.json(run, { status: 201, headers: { Location: `/api/runs/${run.id}` } })
}
