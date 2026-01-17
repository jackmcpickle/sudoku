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
}: CellProps) {
    let bgClass = 'bg-[var(--sudoku-cell)]';
    if (isSelected) bgClass = 'bg-[var(--sudoku-cell-selected)]';
    else if (isError) bgClass = 'bg-[var(--sudoku-cell-error)]';
    else if (isSameNumber) bgClass = 'bg-blue-900/50';
    else if (isHighlighted) bgClass = 'bg-[var(--sudoku-cell-highlighted)]';
    else if (isGiven) bgClass = 'bg-[var(--sudoku-cell-given)]';

    const textClass = isGiven ? 'text-white font-bold' : 'text-blue-400';

    return (
        <div
            className={`aspect-square flex items-center justify-center cursor-pointer transition-colors ${bgClass}`}
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
                                    ? 'text-blue-400 font-bold'
                                    : 'text-slate-500'
                            }`}
                        >
                            {notes.has(n) ? n : ''}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
