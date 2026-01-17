import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { formatTime } from '@/lib/scoring';

export function useTimer(): { seconds: number; formatted: string } {
    const timer = useGameStore((state) => state.timer);
    const tick = useGameStore((state) => state.tick);
    const puzzle = useGameStore((state) => state.puzzle);
    const isPaused = useGameStore((state) => state.isPaused);
    const isComplete = useGameStore((state) => state.isComplete);

    useEffect(() => {
        if (!puzzle || isPaused || isComplete) return;
        const interval = setInterval(() => tick(), 1000);
        return () => clearInterval(interval);
    }, [puzzle, isPaused, isComplete, tick]);

    return { seconds: timer, formatted: formatTime(timer) };
}
