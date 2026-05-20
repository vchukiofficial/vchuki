import { config } from './config'
import { cookies } from 'next/headers'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    const res = await fetch(`${config.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || `HTTP ${res.status}`,
      }
    }

    const data = await res.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('[API Client Error]:', error)
    return {
      success: false,
      error: 'Network error',
    }
  }
}

// Server-side helper (no cookies needed for SSR)
export async function serverApiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${config.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || `HTTP ${res.status}`,
      }
    }

    const data = await res.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('[Server API Client Error]:', error)
    return {
      success: false,
      error: 'Network error',
    }
  }
}
