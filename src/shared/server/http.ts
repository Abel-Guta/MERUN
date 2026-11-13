export type FieldErrors = Record<string, string>

export function errorResponse(
  status: number,
  code: string,
  message: string,
  fields?: FieldErrors,
): Response {
  return Response.json({ error: { code, message, ...(fields && { fields }) } }, { status })
}
