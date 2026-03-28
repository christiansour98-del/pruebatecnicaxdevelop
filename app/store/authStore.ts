import { create } from 'zustand'

type Role = 'admin' | 'user' | null

interface AuthStore {
  role: Role
  email: string | null
  setAuth: (role: Role, email: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>(set => ({
  role:  null,
  email: null,
  setAuth:   (role, email) => set({ role, email }),
  clearAuth: () => set({ role: null, email: null }),
}))