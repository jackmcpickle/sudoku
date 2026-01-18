import type { CellValue } from '@/types';

interface CellProps {
    value: CellValue;
    isGiven: boolean;
    isSelected: boolean;
    isHighlighted: boolean;
    isError: boolean;
    isSameNumber: boolean;
    notes: Set<number>;
    selectedNumber: number;
    onClick: () => void;
}

export function Cell({
    value,
    isGiven,
    isSelected,
    isHighlighted,
    isError,
    isSameNumber,
    notes,
    selectedNumber,
    onClick,
}: CellProps): React.ReactElement {
    let bgClass = 'bg-(--sudoku-cell)';
    if (isError) bgClass = 'bg-(--sudoku-cell-error)';
    else if (isSelected) bgClass = 'bg-(--sudoku-cell-selected)';
    else if (isSameNumber) bgClass = 'bg-(--sudoku-cell-same)';
    else if (isHighlighted) bgClass = 'bg-(--sudoku-cell-highlighted)';
    else if (isGiven) bgClass = 'bg-(--sudoku-cell-given)';

    const textClass = isGiven
        ? 'text-(--sudoku-text-given) font-bold'
        : 'text-(--sudoku-text-entered)';

    return (
        <button
            type="button"
            className={`aspect-square w-full flex items-center justify-center cursor-pointer transition-colors ${bgClass}`}
            onClick={onClick}
        >
            {value !== 0 ? (
                <span className={`text-2xl sm:text-3xl ${textClass}`}>
                    {value}
                </span>
            ) : notes.size > 0 ? (
                <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <div
                            key={n}
                            className={`flex items-center justify-center text-[8px] sm:text-[10px] ${
                                notes.has(n) && selectedNumber === n
                                    ? 'text-(--sudoku-text-notes-hl) font-bold'
                                    : 'text-(--sudoku-text-notes)'
                            }`}
                        >
                            {notes.has(n) ? n : ''}
                        </div>
                    ))}
                </div>
            ) : null}
        </button>
    );
}
