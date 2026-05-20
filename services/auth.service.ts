import { apiClient, serverApiClient } from '@/lib/api-client'
import type { IUser as User } from '@/models/User'

export async function login(email: string, password: string) {
  return apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function register(userData: {
  name: string
  email: string
  password: string
}) {
  return apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

export async function getCurrentUser() {
  return apiClient<User>('/auth/me')
}

export async function logout() {
  return apiClient('/auth/logout', { method: 'POST' })
}

// Server-side
export async function verifyUserSession() {
  return serverApiClient('/auth/verify-session')
}
