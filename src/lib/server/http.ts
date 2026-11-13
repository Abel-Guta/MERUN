import { listRuns } from './runs'
import { parseLimit, type FieldErrors } from './validate'

export function errorResponse(
  status: number,
  code: string,
  message: string,
  fields?: FieldErrors,
): Response {
  return Response.json({ error: { code, message, ...(fields && { fields }) } }, { status })
}

export function listResponse(searchParams: URLSearchParams, username?: string): Response {
  const limit = parseLimit(searchParams.get('limit'))
  if (!limit.ok) {
    return errorResponse(400, 'invalid_query', 'Invalid query parameters.', limit.fields)
  }

  const result = listRuns({
    limit: limit.value,
    cursor: searchParams.get('cursor') ?? undefined,
    username,
  })
  if (!result.ok) {
    return errorResponse(400, 'invalid_cursor', 'The cursor does not match any run.')
  }

  return Response.json({ items: result.items, nextCursor: result.nextCursor })
}
