import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import coinImg from './assets/coin.png'

// ===== КОНФИГ ТОКЕНОМИКИ (меняется в одном месте) =====
const CFG = {
  kakaPerSolEarly: 2_000_000,   // 1 SOL -> 2,000,000 KAKA (Early Bird)
  rateEarlyUsd: 0.0001,         // 1 KAKA = $0.0001 сейчас (Early Bird, SOL=$200)
  presaleMult: 2,               // Presale ×2
  listingBase: 10,              // Listing базовый ×10
  listingMoon: 30,              // Listing муншот ×30
  minSol: 0.5,
  maxSol: 20,
  wallet: 'E5UskyD3uQK4YPCZJjrLecBM84RJuVJTqwPbo78C2ZNt',
  supportUrl: 'https://t.me/natrone_bot', // TODO: заменить на саппорт-оператора
}

const fmtUsd = (v: number) =>
  v >= 1000 ? '$' + Math.round(v).toLocaleString('ru-RU') : '$' + v.toFixed(2)
const fmtKaka = (v: number) => Math.round(v).toLocaleString('ru-RU')

export default function BuyScreen({ balance, onClose }: { balance: number; onClose: () => void }) {
  const [sol, setSol] = useState(CFG.minSol)
  const [copied, setCopied] = useState(false)

  const bought = sol * CFG.kakaPerSolEarly
  const total = balance + bought

  const pts = useMemo(() => {
    const now = total * CFG.rateEarlyUsd
    return {
      now,
      presale: now * CFG.presaleMult,
      list10: now * CFG.listingBase,
      list30: now * CFG.listingMoon,
    }
  }, [total])

  // геометрия
  const W = 320, H = 180, padL = 10, padR = 10, padT = 24, padB = 28
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const maxVal = pts.list30 || 1
  const yOf = (v: number) => padT + innerH - (v / maxVal) * innerH
  const xNow = padL
  const xPre = padL + innerW * 0.5
  const xList = padL + innerW

  const pNow = { x: xNow, y: yOf(pts.now) }
  const pPre = { x: xPre, y: yOf(pts.presale) }
  const p10 = { x: xList, y: yOf(pts.list10) }
  const p30 = { x: xList, y: yOf(pts.list30) }

  const basePath = `M ${pNow.x} ${pNow.y} L ${pPre.x} ${pPre.y} L ${p10.x} ${p10.y}`
  const moonPath = `M ${pPre.x} ${pPre.y} L ${p30.x} ${p30.y}`

  const copyWallet = () => {
    navigator.clipboard?.writeText(CFG.wallet).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1400)
    }).catch(() => {})
  }

  const goSupport = () => {
    const tg = (window as any).Telegram?.WebApp
    const text = encodeURIComponent(
      `Здравствуйте! Оплатил пресейл $KAKA на ${sol} SOL. Прикрепляю транзакцию: [вставь хэш]. Мой ник в приложении: `
    )
    const url = `${CFG.supportUrl}?text=${text}`
    if (tg?.openTelegramLink) tg.openTelegramLink(url)
    else window.open(url, '_blank')
  }

  return (
    <div className="buy-overlay">
      <motion.div
        className="buy-screen"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        <div className="buy-header">
          <span className="buy-title">🚀 Войти в Early Bird</span>
          <button className="ach-close-btn" onClick={onClose}>✕</button>
        </div>

        <p className="buy-sub">
          Чем раньше зайдёшь — тем дешевле $KAKA.
          Потенциал <span className="grn">10–30x</span> к листингу.
        </p>

        <div className="buy-chart">
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
            <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} stroke="#2e2a36" strokeWidth="1" />

            <motion.path
              d={moonPath} fill="none" stroke="#5bd37a" strokeWidth="2.5"
              strokeDasharray="5 5" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
            />
            <motion.path
              d={basePath} fill="none" stroke="#E8C87A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />

            <motion.circle cx={pNow.x} cy={pNow.y} r="6" fill="#E8C87A"
              animate={{ scale: [1, 1.35, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
            <circle cx={pPre.x} cy={pPre.y} r="5" fill="#E8C87A" />
            <circle cx={p10.x} cy={p10.y} r="5" fill="#E8C87A" />
            <motion.circle cx={p30.x} cy={p30.y} r="6" fill="#5bd37a"
              animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.3, repeat: Infinity }} />

            <text x={pNow.x} y={H - 8} fill="#8a8f98" fontSize="10" textAnchor="start">Сейчас</text>
            <text x={pPre.x} y={H - 8} fill="#8a8f98" fontSize="10" textAnchor="middle">Presale</text>
            <text x={p10.x} y={H - 8} fill="#8a8f98" fontSize="10" textAnchor="end">Листинг</text>
          </svg>

          <div className="buy-vals">
            <div className="bv"><span className="bv-k">сейчас</span><span className="bv-v">{fmtUsd(pts.now)}</span></div>
            <div className="bv"><span className="bv-k">×2 presale</span><span className="bv-v">{fmtUsd(pts.presale)}</span></div>
            <div className="bv bv-list">
              <span className="bv-v gold">{fmtUsd(pts.list10)} <small>10x</small></span>
              <span className="bv-v grn">{fmtUsd(pts.list30)} <small>30x 🚀</small></span>
            </div>
          </div>
        </div>

        <div className="buy-calc">
          <div className="buy-calc-row">
            <span className="buy-calc-lab">Докупить</span>
            <span className="buy-calc-sol">{sol % 1 === 0 ? sol : sol.toFixed(1)} SOL</span>
          </div>
          <input
            type="range" min={CFG.minSol} max={CFG.maxSol} step={0.5} value={sol}
            onChange={(e) => setSol(parseFloat(e.target.value))}
            className="buy-range"
            style={{ ['--pct' as any]: `${((sol - CFG.minSol) / (CFG.maxSol - CFG.minSol)) * 100}%` }}
          />
          <div className="buy-calc-get">
            <img src={coinImg} className="buy-calc-coin" alt="" />
            +{fmtKaka(bought)} $KAKA
          </div>
        </div>

        <div className="buy-wallet">
          <div className="buy-wallet-head">Отправь SOL сюда</div>
          <div className="buy-wallet-sub">Сеть Solana · минимум 0.5 SOL</div>
          <div className="buy-addr-row">
            <div className="buy-addr">{CFG.wallet}</div>
            <button className="buy-copy" onClick={copyWallet}>{copied ? '✓' : 'Копир.'}</button>
          </div>
        </div>

        <button className="btn-gold buy-paid-btn" onClick={goSupport}>
          Я оплатил → написать в саппорт
        </button>

        <p className="buy-legal">
          Оценка по цене текущего раунда. Потенциал роста — не гарантия. Участвуй ответственно.
        </p>
      </motion.div>
    </div>
  )
}
