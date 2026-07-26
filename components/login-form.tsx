'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/components/auth-provider'
import { authApi, type UserRole } from '@/features/auth/api/auth-api'
import { ChevronDown, CheckCircle2, ShieldCheck, User, ShieldAlert, KeyRound, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const DISTRICTS = [
  'Bengaluru (Urban)',
  'Bengaluru (Rural)',
  'Mysuru',
  'Belagavi',
  'Ballari',
  'Dakshina Kannada',
  'Davangere',
  'Gulbarga',
  'Hassan',
  'Hubballi-Dharwad',
  'Kolar',
  'Mandya',
  'Shimoga',
  'Tumkur',
  'Udupi',
  'Uttara Kannada',
]

const ROLES: { id: UserRole; label: string; desc: string; icon: typeof ShieldCheck }[] = [
  { id: 'officer', label: 'Police Officer', desc: 'Investigating Officers & Station Staff', icon: ShieldCheck },
  { id: 'admin', label: 'System Admin', desc: 'SCRB & Division Administrators', icon: ShieldAlert },
  { id: 'civilian', label: 'Civilian / Citizen', desc: 'Public Complaints & FIR Tracking', icon: User },
]

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole>('officer')
  const [formData, setFormData] = useState({
    name: '',
    identifier: '',
    credential: '',
    district: 'Bengaluru (Urban)',
    agreed: true,
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const identifier = formData.identifier.trim() || (selectedRole === 'admin' ? 'admin@pramaan.gov.in' : selectedRole === 'civilian' ? '9876543210' : 'KSP-30412')
    const displayName = formData.name.trim() || (selectedRole === 'admin' ? 'Division Administrator' : selectedRole === 'civilian' ? 'Citizen User' : 'Officer User')

    setLoading(true)
    try {
      await login({
        identifier,
        credential: formData.credential || '123456',
        district: formData.district,
        role: selectedRole,
        name: displayName,
        mode: selectedRole === 'admin' ? 'admin' : selectedRole === 'civilian' ? 'civilian' : 'psn_pin',
      })
      setSubmitted(true)
      setTimeout(() => {
        window.location.href = '/workspace/'
      }, 500)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center py-10">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="size-10" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">Authentication Successful</h3>
        <p className="mt-1 text-xs text-blue-200/70">Redirecting to PRAMAAN Intelligence Workspace...</p>
      </div>
    )
  }

  return (
    <div className="relative z-10 space-y-6">
      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-white/10 p-1.5 backdrop-blur-md">
        {ROLES.map(r => {
          const Icon = r.icon
          const active = selectedRole === r.id
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRole(r.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg py-2.5 px-2 text-center transition-all',
                active
                  ? 'bg-blue-600 text-white shadow-lg ring-1 ring-blue-400/50'
                  : 'text-white/70 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon className="size-4" />
              <span className="text-xs font-bold leading-none">{r.label}</span>
            </button>
          )
        })}
      </div>

      <p className="text-center text-xs font-medium text-blue-200/80">
        {selectedRole === 'officer' && 'Secure Login for Police Personnel & Investigating Officers'}
        {selectedRole === 'admin' && 'System Administrator Portal — Full Governance & Audit Control'}
        {selectedRole === 'civilian' && 'Public Citizen Portal — File Complaint & Track FIR Status'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
            Your Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder={
              selectedRole === 'officer'
                ? 'e.g. Insp. Sakthi Vengatesan'
                : selectedRole === 'admin'
                ? 'e.g. Administrator Pavan Sanjay'
                : 'e.g. Citizen Applicant'
            }
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Identifier Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
            {selectedRole === 'officer' ? 'Police Service No. (PSN) / Mobile' : selectedRole === 'admin' ? 'Admin ID / Official Email' : 'Mobile Number'}
          </label>
          <input
            type="text"
            value={formData.identifier}
            onChange={e => setFormData({ ...formData, identifier: e.target.value })}
            placeholder={
              selectedRole === 'officer'
                ? 'KSP-30412 or 9876543210'
                : selectedRole === 'admin'
                ? 'admin@scrb.karnataka.gov.in'
                : 'Enter 10-digit mobile'
            }
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Passcode / PIN / OTP */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
            {selectedRole === 'officer' ? 'PIN / Security Code' : selectedRole === 'admin' ? 'Admin Master Passcode' : 'OTP Code'}
          </label>
          <input
            type="password"
            value={formData.credential}
            onChange={e => setFormData({ ...formData, credential: e.target.value })}
            placeholder={selectedRole === 'civilian' ? '123456' : '••••'}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
          />
        </div>

        {/* District Select */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
            District Jurisdiction
          </label>
          <div className="relative">
            <select
              value={formData.district}
              onChange={e => setFormData({ ...formData, district: e.target.value })}
              className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            >
              {DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-white/50 pointer-events-none" />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {loading ? 'Authenticating...' : `Login as ${ROLES.find(r => r.id === selectedRole)?.label}`}
        </button>
      </form>
    </div>
  )
}
