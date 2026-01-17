import { createFileRoute } from '@tanstack/react-router';
import { DIFFICULTY_CONFIG, DIFFICULTIES } from '@/lib/sudoku/difficulty';

export const Route = createFileRoute('/help')({
    component: HelpPage,
});

function HelpPage() {
    return (
        <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-2xl font-bold text-white mb-6">How to Play</h1>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-3">Rules</h2>
                <div className="bg-slate-800 rounded-lg p-4 space-y-2 text-slate-300">
                    <p>Fill the 9×9 grid so that:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                            Each <strong>row</strong> contains digits 1-9 (no
                            repeats)
                        </li>
                        <li>
                            Each <strong>column</strong> contains digits 1-9 (no
                            repeats)
                        </li>
                        <li>
                            Each <strong>3×3 box</strong> contains digits 1-9
                            (no repeats)
                        </li>
                    </ul>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-3">
                    Controls
                </h2>
                <div className="bg-slate-800 rounded-lg p-4 text-slate-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium text-white mb-2">
                                Mouse/Touch
                            </h3>
                            <ul className="space-y-1 text-sm">
                                <li>Click cell to select</li>
                                <li>Click number pad to enter</li>
                                <li>Click Erase to clear</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-white mb-2">
                                Keyboard
                            </h3>
                            <ul className="space-y-1 text-sm">
                                <li>
                                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">
                                        1-9
                                    </kbd>{' '}
                                    Enter number
                                </li>
                                <li>
                                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">
                                        Backspace
                                    </kbd>{' '}
                                    Erase
                                </li>
                                <li>
                                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">
                                        Arrow keys
                                    </kbd>{' '}
                                    Move selection
                                </li>
                                <li>
                                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">
                                        N
                                    </kbd>{' '}
                                    Toggle notes mode
                                </li>
                                <li>
                                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">
                                        Ctrl+Z
                                    </kbd>{' '}
                                    Undo
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-3">
                    Notes Mode
                </h2>
                <div className="bg-slate-800 rounded-lg p-4 text-slate-300 space-y-2">
                    <p>
                        Press{' '}
                        <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">
                            N
                        </kbd>{' '}
                        or tap "Notes" to toggle notes mode.
                    </p>
                    <p>
                        In notes mode, entering numbers adds small candidates to
                        the cell instead of filling it.
                    </p>
                    <p>
                        When you correctly place a number, notes for that number
                        are automatically cleared from the same row, column, and
                        box.
                    </p>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-3">
                    Scoring
                </h2>
                <div className="bg-slate-800 rounded-lg p-4 text-slate-300 space-y-4">
                    <div>
                        <h3 className="font-medium text-white mb-2">Formula</h3>
                        <p className="text-sm bg-slate-900 p-2 rounded font-mono">
                            (Base + Time Bonus - Hint Penalty - Mistake Penalty)
                            × Multiplier
                        </p>
                    </div>

                    <div>
                        <h3 className="font-medium text-white mb-2">
                            Time Bonus
                        </h3>
                        <p className="text-sm">
                            Complete faster than the target time to earn up to
                            50% of base score as bonus.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-medium text-white mb-2">
                            Penalties
                        </h3>
                        <ul className="text-sm space-y-1">
                            <li>
                                <span className="text-red-400">Mistakes</span> —
                                Points deducted immediately when you enter a
                                wrong number.{' '}
                                <strong>Cannot be recovered with undo.</strong>
                            </li>
                            <li>
                                <span className="text-red-400">Hints</span> —
                                Points deducted for each hint used.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-3">
                    Difficulty Levels
                </h2>
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                                    Level
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-slate-400 uppercase">
                                    Base
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-slate-400 uppercase">
                                    Multiplier
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-slate-400 uppercase">
                                    Mistake
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-slate-400 uppercase">
                                    Hint
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-slate-400 uppercase hidden sm:table-cell">
                                    Target
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {DIFFICULTIES.map((d) => {
                                const config = DIFFICULTY_CONFIG[d];
                                const mistakeCost = Math.floor(
                                    config.mistakePenalty *
                                        config.difficultyMultiplier,
                                );
                                const hintCost = Math.floor(
                                    config.hintPenalty *
                                        config.difficultyMultiplier,
                                );
                                const targetMins = Math.floor(
                                    config.timeBonusThreshold / 60,
                                );
                                return (
                                    <tr key={d}>
                                        <td className="px-3 py-2 text-slate-300 capitalize">
                                            {d}
                                        </td>
                                        <td className="px-3 py-2 text-right text-slate-300">
                                            {config.baseScore}
                                        </td>
                                        <td className="px-3 py-2 text-right text-blue-400">
                                            ×{config.difficultyMultiplier}
                                        </td>
                                        <td className="px-3 py-2 text-right text-red-400">
                                            -{mistakeCost}
                                        </td>
                                        <td className="px-3 py-2 text-right text-red-400">
                                            -{hintCost}
                                        </td>
                                        <td className="px-3 py-2 text-right text-slate-400 hidden sm:table-cell">
                                            {targetMins}m
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Target = time to beat for max time bonus. Hints available
                    decrease with difficulty.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-3">Tips</h2>
                <div className="bg-slate-800 rounded-lg p-4 text-slate-300">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Use notes to track possible candidates</li>
                        <li>Look for cells with only one possible value</li>
                        <li>
                            Scan rows, columns, and boxes for missing numbers
                        </li>
                        <li>
                            Avoid guessing — mistakes cost points permanently
                        </li>
                        <li>
                            Higher difficulties give bigger rewards but harsher
                            penalties
                        </li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
