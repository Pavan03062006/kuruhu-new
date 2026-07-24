import type { AuthUser } from './auth-api'

const KEY = 'kuruhu.demo-session'

export const demoSession = {
  get(): AuthUser | null {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  },
  create(payload: { identifier: string; district: string; language: string; name?: string }): AuthUser {
    const formattedName = payload.name || payload.identifier.split('@')[0] || 'Investigating Officer'
    const user: AuthUser = {
      id: 'demo-user',
      login_identifier: payload.identifier,
      mobile_number: payload.identifier,
      psn: 'KSP-30412',
      is_active: true,
      last_login_at: new Date().toISOString(),
      role: 'officer',
      roles: ['investigation_officer'],
      permissions: ['fir:read', 'fir:create', 'fir:update', 'person:read', 'graph:read', 'ai:query', 'ai:verify', 'audit:read'],
      display_name: formattedName,
      district: payload.district || 'Bengaluru (Urban)',
      station: 'Jayanagar PS',
      badge_number: 'KSP-30412',
    }
    if (typeof window !== 'undefined') window.localStorage.setItem(KEY, JSON.stringify(user))
    return user
  },
  clear() {
    if (typeof window !== 'undefined') window.localStorage.removeItem(KEY)
  },
}
