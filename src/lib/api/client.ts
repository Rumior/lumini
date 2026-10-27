const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type CsrfResponse = { csrfToken: string }
type CsrfPayload = { csrfToken?: string }

let csrfToken: string | null = null
let csrfRequest: Promise<string> | null = null

async function ensureCsrf(): Promise<string> {
  if (csrfToken) return csrfToken

  if (!csrfRequest) {
    csrfRequest = (async () => {
      const response = await fetch(`${API_BASE}/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new ApiError('Could not initialize secure session.', response.status)
      }

      const data = (await response.json()) as CsrfResponse
      if (!data.csrfToken) {
        throw new ApiError('Server did not provide a CSRF token.', response.status)
      }

      csrfToken = data.csrfToken
      return csrfToken
    })().finally(() => {
      csrfRequest = null
    })
  }

  return csrfRequest
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase()
  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(method)
  const headers = new Headers(options.headers)

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  headers.set('Accept', 'application/json')

  if (mutating) {
    headers.set('X-CSRF-Token', await ensureCsrf())
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') || ''
  let data: unknown = null

  if (contentType.includes('application/json')) {
    data = await response.json()
  } else {
    const text = await response.text()
    data = text ? { error: text } : null
  }

  if (!response.ok) {
    const payload = data as { error?: string; details?: unknown } | null
    throw new ApiError(
      payload?.error || `Request failed (${response.status})`,
      response.status,
      payload?.details,
    )
  }

  const payload = data as CsrfPayload | null
  if (payload?.csrfToken) {
    csrfToken = payload.csrfToken
  }

  if (path === '/auth/logout') {
    csrfToken = null
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}