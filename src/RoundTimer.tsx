import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Раунды (UTC)
const EARLY_BIRD_END = new Date('2026-10-20T23:59:59Z').getTime()
const PRESALE_END = new Date('2026-10-31T23:59:59Z').getTime()

function currentRound() {
  const now = Date.now()
  if (now <= EARLY_BIRD_END) return { key: 'early', label: 'Early Bird', end: EARLY_BIRD_END }
  if (now <= PRESALE_END) return { key: 'presale', label: 'Presale', end: PRESALE_END }
  return { key: 'ended', label: '', end: PRESALE_END }
}

export default function RoundTimer({ compact = false, coins, coinImg }: { compact?: boolean; coins?: number; coinImg?: string }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const round = currentRound()
  if (round.key === 'ended') return null

  let diff = Math.max(0, round.end - Date.now())
  const d = Math.floor(diff / 864e5); diff -= d * 864e5
  const h = Math.floor(diff / 36e5); diff -= h * 36e5
  const m = Math.floor(diff / 6e4); diff -= m * 6e4
  const s = Math.floor(diff / 1e3)
  const p = (n: number) => String(n).padStart(2, '0')

  return (
    <motion.div
      className={`round-timer ${compact ? 'round-timer-compact' : ''}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="rt-top">
        <div className="rt-label">
          <span className="rt-dot" />
          {round.label} заканчивается через
        </div>
        {coins !== undefined && coinImg && (
          <div className="rt-balance">
            <img src={coinImg} alt="🪙" />
            <span>{coins}</span>
          </div>
        )}
      </div>
      <div className="rt-clock">
        <div className="rt-unit"><span className="rt-num">{p(d)}</span><span className="rt-cap">дн</span></div>
        <span className="rt-sep">:</span>
        <div className="rt-unit"><span className="rt-num">{p(h)}</span><span className="rt-cap">ч</span></div>
        <span className="rt-sep">:</span>
        <div className="rt-unit"><span className="rt-num">{p(m)}</span><span className="rt-cap">мин</span></div>
        <span className="rt-sep">:</span>
        <div className="rt-unit"><span className="rt-num">{p(s)}</span><span className="rt-cap">сек</span></div>
      </div>
    </motion.div>
  )
}
