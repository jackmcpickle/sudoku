import { useTimer } from '@/hooks/useTimer'

export function Timer() {
  const { formatted } = useTimer()
  return <div className="text-2xl font-mono font-bold text-slate-300">{formatted}</div>
}
