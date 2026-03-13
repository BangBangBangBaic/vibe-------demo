export class RequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'RequestError'
    this.status = status
  }
}

interface RequestOptions extends RequestInit {
  skipJsonContentType?: boolean
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { skipJsonContentType = false, headers, ...rest } = options
  const mergedHeaders = new Headers(headers)

  if (!skipJsonContentType && !mergedHeaders.has('Content-Type')) {
    mergedHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...rest,
    headers: mergedHeaders,
  })

  const text = await response.text()
  const data = text ? (JSON.parse(text) as unknown) : null

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message: string }).message)
        : `Request failed: ${response.status}`
    throw new RequestError(message, response.status)
  }

  return data as T
}
