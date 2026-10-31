import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
} from '@testing-library/react';
import { useGameStore } from '@/stores/gameStore';
import { AppUpdates } from '@/components/AppUpdates';
import {
    applyUpdate,
    checkForUpdates,
    startAppUpdates,
    useAppUpdates,
} from '@/lib/appUpdates';
import {
    restoreUpdateCheckpoint,
    saveUpdateCheckpoint,
} from '@/lib/updateCheckpoint';
import type { Grid } from '@/types';
import {
    createRouter,
    createMemoryHistory,
    RouterProvider,
} from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';

const worker = vi.hoisted(() => {
    let callbacks:
        | undefined
        | {
              onNeedReload: () => void;
              onRegisteredSW: (
                  url: string,
                  registration: {
                      update: () => Promise<void>;
                      installing: null;
                  },
              ) => void;
          };
    return {
        get options() {
            return callbacks;
        },
        set options(value: typeof callbacks) {
            callbacks = value;
        },
        update: vi.fn(async () => {}),
    };
});
vi.mock('virtual:pwa-register', () => ({
    registerSW: (options: NonNullable<typeof worker.options>) => {
        worker.options = options;
    },
}));

const solution: Grid = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

function simulateFreshPage(): void {
    const raw = sessionStorage.getItem('sudoku-update-checkpoint');
    useGameStore.getState().reset();
    if (raw) sessionStorage.setItem('sudoku-update-checkpoint', raw);
}

beforeEach(() => {
    sessionStorage.clear();
    useGameStore.getState().reset();
    useAppUpdates.setState({ available: false, checking: false, message: '' });
    const grid = solution.map((row) => [...row]);
    grid[0][0] = 0;
    grid[0][1] = 0;
    grid[8][8] = 0;
    useGameStore.getState().newGame({ grid, solution, difficulty: 'hard' });
    vi.stubGlobal('__APP_VERSION__', '1.1.0 · test-build');
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('safe app updates', () => {
    it.each(['/play?difficulty=medium', '/play?difficulty=medium&resume=true'])(
        'keeps the recovered puzzle rather than fetching or regenerating it at %s',
        async (url) => {
            useGameStore.getState().selectCell({ row: 0, col: 1 });
            useGameStore.getState().toggleNote(7);
            saveUpdateCheckpoint();
            simulateFreshPage();
            restoreUpdateCheckpoint();
            vi.stubGlobal(
                'fetch',
                vi.fn(async () => new Response('null', { status: 404 })),
            );
            const router = createRouter({
                routeTree,
                history: createMemoryHistory({ initialEntries: [url] }),
            });

            await act(async () => {
                render(<RouterProvider router={router} />);
            });

            expect(await screen.findByText('hard')).toBeInTheDocument();
            expect(useGameStore.getState().board[0][1].notes).toEqual(
                new Set([7]),
            );
            expect(useGameStore.getState().puzzle?.difficulty).toBe('hard');
        },
    );

    it('recovers the latest values, notes, penalties and undo history without a network save', () => {
        const game = useGameStore.getState();
        game.selectCell({ row: 0, col: 0 });
        game.setCell(1);
        game.setCell(5);
        game.selectCell({ row: 0, col: 1 });
        game.toggleNote(3);
        game.toggleNote(7);
        game.tick();
        game.tick();
        game.pause();
        game.toggleNotesMode();
        const expected = useGameStore.getState();

        saveUpdateCheckpoint();
        simulateFreshPage();
        restoreUpdateCheckpoint();

        const restored = useGameStore.getState();
        expect(restored).toMatchObject({
            puzzle: expected.puzzle,
            board: expected.board,
            timer: 2,
            mistakes: 1,
            pointsLost: expected.pointsLost,
            history: expected.history,
            selectedCell: { row: 0, col: 1 },
            isNotesMode: true,
            isPaused: true,
        });
        expect(restored.board[0][1].notes).toEqual(new Set([3, 7]));
        restored.undo();
        expect(useGameStore.getState().board[0][1].notes).toEqual(new Set([3]));

        simulateFreshPage();
        restoreUpdateCheckpoint();
        expect(useGameStore.getState().board[0][1].notes).toEqual(new Set([3]));
        useGameStore.getState().reset();
        expect(sessionStorage.getItem('sudoku-update-checkpoint')).toBeNull();
    });

    it('does not restore a different visitor’s game or discard corrupt recovery data', () => {
        localStorage.setItem('sudoku-visitor-id', 'first-player');
        saveUpdateCheckpoint();
        simulateFreshPage();
        localStorage.setItem('sudoku-visitor-id', 'second-player');
        restoreUpdateCheckpoint();
        expect(useGameStore.getState().puzzle).toBeNull();

        sessionStorage.setItem('sudoku-update-checkpoint', '{broken');
        expect(restoreUpdateCheckpoint).toThrow();
        expect(sessionStorage.getItem('sudoku-update-checkpoint')).toBe(
            '{broken',
        );
    });

    it('keeps the current page when device storage cannot save progress', () => {
        useAppUpdates.setState({ available: true });
        render(<AppUpdates />);
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('quota');
        });

        fireEvent.click(screen.getByRole('button', { name: 'Update now' }));

        expect(
            screen.getByText(/The app has not reloaded/),
        ).toBeInTheDocument();
        expect(useAppUpdates.getState().available).toBe(true);
        expect(useGameStore.getState().puzzle?.difficulty).toBe('hard');
    });

    it('does not reload or replay a completed puzzle’s score', () => {
        useGameStore.setState({ isComplete: true });
        useAppUpdates.setState({ available: true });
        applyUpdate();
        expect(useAppUpdates.getState().message).toMatch(
            /Leave the completed puzzle/,
        );
        expect(sessionStorage.getItem('sudoku-update-checkpoint')).toBeNull();
    });

    it('checks on return and reconnect, offers an update without reloading, and allows retry after a failed check', async () => {
        render(<AppUpdates />);
        startAppUpdates();
        await act(async () =>
            worker.options?.onRegisteredSW('/sw.js', {
                update: worker.update,
                installing: null,
            }),
        );
        expect(screen.getByText('You’re up to date.')).toBeInTheDocument();
        expect(
            screen.getByText('Version 1.1.0 · test-build'),
        ).toBeInTheDocument();

        worker.update.mockRejectedValueOnce(new Error('offline'));
        await act(async () => window.dispatchEvent(new Event('online')));
        expect(screen.getByText(/Could not check/)).toBeInTheDocument();

        worker.update.mockImplementationOnce(async () => {
            worker.options?.onNeedReload();
        });
        await act(async () =>
            document.dispatchEvent(new Event('visibilitychange')),
        );
        expect(screen.getByText('Update available')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Update now' }),
        ).toBeEnabled();
        expect(useGameStore.getState().puzzle?.difficulty).toBe('hard');
        expect(sessionStorage.getItem('sudoku-update-checkpoint')).toBeNull();
        await act(checkForUpdates);
        expect(
            screen.queryByText('You’re up to date.'),
        ).not.toBeInTheDocument();
    });
});
