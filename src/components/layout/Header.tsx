import { Link } from '@tanstack/react-router'
import { useGameStore } from '@/stores/gameStore'
import { ThemeToggle } from '@/components/ui'

export function Header() {
  const puzzle = useGameStore(state => state.puzzle)
  const isNotesMode = useGameStore(state => state.isNotesMode)

  return (
    <header className="bg-slate-800 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white">Sudoku</Link>
        <nav className="flex items-center gap-4">
          {puzzle && isNotesMode && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-900 text-blue-300 rounded">NOTES</span>
          )}
          <Link to="/" className="text-slate-400 hover:text-white">Home</Link>
          <Link to="/scores" className="text-slate-400 hover:text-white">Scores</Link>
          <Link to="/help" className="text-slate-400 hover:text-white">Help</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
