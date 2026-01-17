import { Link } from '@tanstack/react-router';
import { useGameStore } from '@/stores/gameStore';
import { ThemeToggle } from '@/components/ui';

export function Header(): React.ReactElement {
    const puzzle = useGameStore((state) => state.puzzle);
    const isNotesMode = useGameStore((state) => state.isNotesMode);

    return (
        <header className="bg-(--surface) shadow-sm">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link
                    to="/"
                    className="text-xl font-bold text-(--body-text)"
                >
                    Sudoku
                </Link>
                <nav className="flex items-center gap-4">
                    {puzzle && isNotesMode && (
                        <span className="px-2 py-1 text-xs font-medium bg-(--accent-muted) text-(--accent-text) rounded">
                            NOTES
                        </span>
                    )}
                    <Link
                        to="/"
                        className="text-(--text-muted) hover:text-(--text-muted-hover)"
                    >
                        Home
                    </Link>
                    <Link
                        to="/scores"
                        className="text-(--text-muted) hover:text-(--text-muted-hover)"
                    >
                        Scores
                    </Link>
                    <Link
                        to="/help"
                        className="text-(--text-muted) hover:text-(--text-muted-hover)"
                    >
                        Help
                    </Link>
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}
