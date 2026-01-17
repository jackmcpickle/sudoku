import { useState } from 'react'
import { Modal, Button } from '@/components/ui'
import { useUserStore } from '@/stores/userStore'

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/

interface UsernameModalProps {
  isOpen: boolean
}

export function UsernameModal({ isOpen }: UsernameModalProps) {
  const [input, setInput] = useState('')
  const [validationError, setValidationError] = useState('')
  const setUsername = useUserStore(state => state.setUsername)
  const isLoading = useUserStore(state => state.isLoading)
  const error = useUserStore(state => state.error)
  const clearError = useUserStore(state => state.clearError)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    clearError()

    const trimmed = input.trim()
    if (!USERNAME_REGEX.test(trimmed)) {
      setValidationError('3-20 chars, letters/numbers/underscore/hyphen only')
      return
    }

    try {
      await setUsername(trimmed)
    } catch {
      // Error handled in store
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Choose a Username">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-400">
          Your username will appear on the leaderboard.
        </p>
        <div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter username"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            disabled={isLoading}
          />
          {(validationError || error) && (
            <p className="mt-2 text-sm text-red-400">{validationError || error}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading || !input.trim()}>
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </form>
    </Modal>
  )
}
