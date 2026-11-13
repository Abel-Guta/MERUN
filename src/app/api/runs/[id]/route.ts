import { errorResponse } from '../../../../lib/server/http'
import { getRun } from '../../../../lib/server/runs'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = getRun(id)
  if (!run) return errorResponse(404, 'not_found', 'Run not found.')
  return Response.json(run)
}
