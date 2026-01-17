import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import type { CellValue } from '@/types';

export function useKeyboard() {
    const selectedCell = useGameStore((state) => state.selectedCell);
    const selectCell = useGameStore((state) => state.selectCell);
    const setCell = useGameStore((state) => state.setCell);
    const toggleNotesMode = useGameStore((state) => state.toggleNotesMode);
    const undo = useGameStore((state) => state.undo);
    const puzzle = useGameStore((state) => state.puzzle);
    const isComplete = useGameStore((state) => state.isComplete);

    useEffect(() => {
        if (!puzzle || isComplete) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                undo();
                return;
            }

            if (e.key === 'n' || e.key === 'N') {
                e.preventDefault();
                toggleNotesMode();
                return;
            }

            if (e.key.startsWith('Arrow') && selectedCell) {
                e.preventDefault();
                let { row, col } = selectedCell;
                switch (e.key) {
                    case 'ArrowUp':
                        row = row > 0 ? row - 1 : 8;
                        break;
                    case 'ArrowDown':
                        row = row < 8 ? row + 1 : 0;
                        break;
                    case 'ArrowLeft':
                        col = col > 0 ? col - 1 : 8;
                        break;
                    case 'ArrowRight':
                        col = col < 8 ? col + 1 : 0;
                        break;
                }
                selectCell({ row, col });
                return;
            }

            if (selectedCell) {
                const num = parseInt(e.key, 10);
                if (num >= 1 && num <= 9) {
                    e.preventDefault();
                    setCell(num as CellValue);
                    return;
                }
                if (e.key === 'Backspace' || e.key === 'Delete') {
                    e.preventDefault();
                    setCell(0);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        puzzle,
        isComplete,
        selectedCell,
        selectCell,
        setCell,
        toggleNotesMode,
        undo,
    ]);
}
