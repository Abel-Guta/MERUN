import 'server-only'
import type { NextRequest } from 'next/server'
import { errorResponse } from '@/shared/server/http'
import { createRun, getRun, listRuns, userExists } from './store'
import { parseLimit, parseNewRun } from './validate'

async function listResponse(searchParams: URLSearchParams, username?: string): Promise<Response> {
  const limit = parseLimit(searchParams.get('limit'))
  if (!limit.ok) {
    return errorResponse(400, 'invalid_query', 'Invalid query parameters.', limit.fields)
  }

  const result = await listRuns({
    limit: limit.value,
    cursor: searchParams.get('cursor') ?? undefined,
    username,
  })
  if (!result.ok) {
    return errorResponse(400, 'invalid_cursor', 'The cursor does not match any run.')
  }

  return Response.json({ items: result.items, nextCursor: result.nextCursor })
}

export function listRunsHandler(request: NextRequest) {
  return listResponse(request.nextUrl.searchParams)
}

export async function createRunHandler(request: Request) {
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

export async function getRunHandler(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const run = getRun(id)
  if (!run) return errorResponse(404, 'not_found', 'Run not found.')
  return Response.json(run)
}

export async function listUserRunsHandler(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  if (!(await userExists(username))) return errorResponse(404, 'not_found', 'User not found.')
  return listResponse(request.nextUrl.searchParams, username)
}
