import { useTimer } from '@/hooks/useTimer';

export function Timer(): React.ReactElement {
    const { formatted } = useTimer();
    return (
        <div className="text-2xl font-mono font-bold text-(--text-muted)">
            {formatted}
        </div>
    );
}
