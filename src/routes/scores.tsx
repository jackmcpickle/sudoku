import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { getScores, getUserStats } from '@/lib/storage'
import { useGameStore } from '@/stores/gameStore'
import { Button } from '@/components/ui'
import { DIFFICULTIES } from '@/lib/sudoku/difficulty'
import { formatTime } from '@/lib/scoring'
import type { Difficulty } from '@/types'

export const Route = createFileRoute('/scores')({
  component: ScoresPage,
})

function ScoresPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | undefined>(undefined)
  const userId = useGameStore(state => state.userId)

  const scores = getScores(selectedDifficulty, 20)
  const stats = getUserStats(userId)

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Leaderboard</h1>

      {stats.totalGames > 0 && (
        <div className="bg-blue-900/30 rounded-lg p-4 mb-6">
          <h2 className="font-medium text-blue-100 mb-2">Your Stats</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{stats.totalGames}</div>
              <div className="text-xs text-blue-300">Games</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{stats.totalScore.toLocaleString()}</div>
              <div className="text-xs text-blue-300">Total Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{stats.averageScore}</div>
              <div className="text-xs text-blue-300">Avg Score</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant={selectedDifficulty === undefined ? 'primary' : 'secondary'} size="sm" onClick={() => setSelectedDifficulty(undefined)}>All</Button>
        {DIFFICULTIES.map(d => (
          <Button key={d} variant={selectedDifficulty === d ? 'primary' : 'secondary'} size="sm" onClick={() => setSelectedDifficulty(d)} className="capitalize">{d}</Button>
        ))}
      </div>

      {scores.length > 0 ? (
        <div className="bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {scores.map((score, index) => {
                const isCurrentUser = score.userId === userId
                return (
                  <tr key={score.id} className={isCurrentUser ? 'bg-blue-900/20' : ''}>
                    <td className="px-4 py-3 text-sm font-medium text-white">#{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-bold text-white">
                      {score.score.toLocaleString()}
                      {isCurrentUser && <span className="ml-2 text-xs text-blue-400">(You)</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 capitalize">{score.difficulty}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 font-mono">{formatTime(score.timeSeconds)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 hidden sm:table-cell">{new Date(score.completedAt).toLocaleDateString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">No scores yet. Be the first to complete a puzzle!</div>
      )}
    </div>
  )
}
