import { useGameStore } from '@/stores/gameStore';
import type { CellValue } from '@/types';

export function NumberPad() {
    const setCell = useGameStore((state) => state.setCell);
    const board = useGameStore((state) => state.board);
    const isNotesMode = useGameStore((state) => state.isNotesMode);

    const counts = new Map<number, number>();
    for (let n = 1; n <= 9; n++) counts.set(n, 0);
    for (const row of board) {
        for (const cell of row) {
            if (cell.value !== 0)
                counts.set(cell.value, (counts.get(cell.value) || 0) + 1);
        }
    }

    return (
        <div className="grid grid-cols-9 sm:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const count = counts.get(num) || 0;
                const isComplete = count >= 9;
                return (
                    <button
                        key={num}
                        onClick={() => setCell(num as CellValue)}
                        disabled={isComplete}
                        className={`aspect-square sm:aspect-auto sm:py-3 flex flex-col items-center justify-center rounded-lg font-bold text-xl sm:text-2xl transition-colors ${
                            isComplete
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                        }`}
                    >
                        {num}
                        {!isNotesMode && (
                            <span className="text-xs font-normal opacity-60">
                                {9 - count}
                            </span>
                        )}
                    </button>
                );
            })}
            <button
                onClick={() => setCell(0)}
                className="aspect-square sm:aspect-auto sm:py-3 flex items-center justify-center rounded-lg font-medium text-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
                Erase
            </button>
        </div>
    );
}
