import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createUser as apiCreateUser, getUser as apiGetUser } from '@/lib/api'

interface UserState {
  visitorId: string
  username: string | null
  isLoading: boolean
  error: string | null

  init: () => Promise<void>
  setUsername: (username: string) => Promise<void>
  loginByUsername: (username: string, newVisitorId: string) => Promise<void>
  clearError: () => void
}

function getOrCreateVisitorId(): string {
  const key = 'sudoku-visitor-id'
  const stored = localStorage.getItem(key)
  if (stored) return stored
  const id = crypto.randomUUID()
  localStorage.setItem(key, id)
  return id
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      visitorId: '',
      username: null,
      isLoading: false,
      error: null,

      init: async () => {
        const visitorId = getOrCreateVisitorId()
        set({ visitorId, isLoading: true })

        try {
          const user = await apiGetUser(visitorId)
          if (user) {
            set({ username: user.username, isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ isLoading: false })
        }
      },

      setUsername: async (username: string) => {
        const { visitorId } = get()
        set({ isLoading: true, error: null })

        try {
          const user = await apiCreateUser(username, visitorId)
          set({ username: user.username, isLoading: false })
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Failed to set username'
          set({ isLoading: false, error: msg })
          throw e
        }
      },

      loginByUsername: async (username: string, newVisitorId: string) => {
        set({ isLoading: true, error: null })
        try {
          localStorage.setItem('sudoku-visitor-id', newVisitorId)
          set({ visitorId: newVisitorId, username, isLoading: false })
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Failed to resume session'
          set({ isLoading: false, error: msg })
          throw e
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'sudoku-user',
      partialize: (state) => ({ username: state.username }),
    }
  )
)
