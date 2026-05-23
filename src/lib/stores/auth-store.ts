import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (username: string, password: string): Promise<boolean> => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: username, password }),
          })

          if (!response.ok) {
            return false
          }

          const data = await response.json()

          if (data.success && data.user) {
            set({
              user: {
                id: data.user.id,
                name: data.user.fullName || data.user.userName,
                email: data.user.email,
                role: data.user.role,
              },
              isAuthenticated: true,
            })
            return true
          }

          return false
        } catch {
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'ems-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
