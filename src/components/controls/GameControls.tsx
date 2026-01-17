import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui';
import { DIFFICULTY_CONFIG } from '@/lib/sudoku/difficulty';

export function GameControls() {
    const isNotesMode = useGameStore((state) => state.isNotesMode);
    const toggleNotesMode = useGameStore((state) => state.toggleNotesMode);
    const undo = useGameStore((state) => state.undo);
    const useHint = useGameStore((state) => state.useHint);
    const hintsUsed = useGameStore((state) => state.hintsUsed);
    const puzzle = useGameStore((state) => state.puzzle);
    const history = useGameStore((state) => state.history);
    const mistakes = useGameStore((state) => state.mistakes);
    const pointsLost = useGameStore((state) => state.pointsLost);

    const maxHints = puzzle ? DIFFICULTY_CONFIG[puzzle.difficulty].maxHints : 0;
    const hintsRemaining = maxHints - hintsUsed;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-3 text-sm text-slate-400">
                <span>
                    Mistakes:{' '}
                    <strong className={mistakes > 0 ? 'text-red-400' : ''}>
                        {mistakes}
                    </strong>
                </span>
                <span>|</span>
                <span>
                    Points Lost:{' '}
                    <strong className={pointsLost > 0 ? 'text-red-400' : ''}>
                        {pointsLost}
                    </strong>
                </span>
                <span>|</span>
                <span>
                    Hints:{' '}
                    <strong>
                        {hintsRemaining}/{maxHints}
                    </strong>
                </span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                <Button
                    onClick={undo}
                    variant="secondary"
                    disabled={history.length === 0}
                >
                    Undo
                </Button>
                <Button
                    onClick={toggleNotesMode}
                    variant={isNotesMode ? 'primary' : 'secondary'}
                    active={isNotesMode}
                >
                    Notes {isNotesMode ? 'ON' : 'OFF'}
                </Button>
                <Button
                    onClick={useHint}
                    variant="secondary"
                    disabled={hintsRemaining <= 0}
                >
                    Hint
                </Button>
            </div>
            <p className="text-xs text-center text-slate-500">
                Keyboard: 1-9 to enter, N for notes, Ctrl+Z to undo
            </p>
        </div>
    );
}
