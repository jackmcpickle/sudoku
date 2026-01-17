import { useGameStore } from '@/stores/gameStore';
import { Cell } from './Cell';

export function Board(): React.ReactElement {
    const board = useGameStore((state) => state.board);
    const solution = useGameStore((state) => state.solution);
    const selectedCell = useGameStore((state) => state.selectedCell);
    const selectCell = useGameStore((state) => state.selectCell);

    const selectedValue = selectedCell
        ? board[selectedCell.row][selectedCell.col].value
        : 0;

    return (
        <div className="w-full max-w-md mx-auto">
            <div
                className="grid grid-cols-9 border-2 border-[var(--sudoku-border-thick)] rounded-lg overflow-hidden bg-[var(--sudoku-bg)]"
                style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            >
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                        const isSelected =
                            selectedCell?.row === rowIndex &&
                            selectedCell?.col === colIndex;
                        const isHighlighted =
                            selectedCell !== null &&
                            !isSelected &&
                            (selectedCell.row === rowIndex ||
                                selectedCell.col === colIndex ||
                                (Math.floor(selectedCell.row / 3) ===
                                    Math.floor(rowIndex / 3) &&
                                    Math.floor(selectedCell.col / 3) ===
                                        Math.floor(colIndex / 3)));
                        const isError =
                            cell.value !== 0 &&
                            cell.value !== solution[rowIndex]?.[colIndex] &&
                            !cell.isGiven;
                        const isSameNumber =
                            !isSelected &&
                            selectedValue !== 0 &&
                            cell.value === selectedValue;

                        const borderRight =
                            (colIndex + 1) % 3 === 0 && colIndex !== 8
                                ? 'border-r-2 border-r-[var(--sudoku-border-thick)]'
                                : 'border-r border-r-[var(--sudoku-border)]';
                        const borderBottom =
                            (rowIndex + 1) % 3 === 0 && rowIndex !== 8
                                ? 'border-b-2 border-b-[var(--sudoku-border-thick)]'
                                : 'border-b border-b-[var(--sudoku-border)]';

                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`${borderRight} ${borderBottom}`}
                            >
                                <Cell
                                    value={cell.value}
                                    isGiven={cell.isGiven}
                                    isSelected={isSelected}
                                    isHighlighted={isHighlighted}
                                    isError={isError}
                                    isSameNumber={isSameNumber}
                                    notes={cell.notes}
                                    selectedNumber={selectedValue}
                                    onClick={() =>
                                        selectCell({
                                            row: rowIndex,
                                            col: colIndex,
                                        })
                                    }
                                />
                            </div>
                        );
                    }),
                )}
            </div>
        </div>
    );
}
