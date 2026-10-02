import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import coinImg from './assets/coin.png'
import RoundTimer from './RoundTimer'

// ===== КОНФИГ ТОКЕНОМИКИ (меняется в одном месте) =====
const CFG = {
  kakaPerSolEarly: 2_000_000,   // 1 SOL -> 2,000,000 KAKA (Early Bird)
  rateEarlyUsd: 0.000075,       // 1 KAKA = $0.000075 (Early Bird, SOL=$150)
  presaleMult: 2,               // Presale ×2
  listingBase: 10,              // Listing базовый ×10
  listingMoon: 30,              // Listing муншот ×30
  minBuySol: 0.5,               // минимум для реальной покупки
  maxSol: 20,
  wallet: 'E5UskyD3uQK4YPCZJjrLecBM84RJuVJTqwPbo78C2ZNt',
  supportUrl: 'https://t.me/natrone_bot', // TODO: заменить на саппорт-оператора
}

const fmtUsd = (v: number) => {
  if (v >= 1000) return '$' + Math.round(v).toLocaleString('ru-RU')
  return '$' + v.toFixed(2)
}
const fmtKaka = (v: number) => Math.round(v).toLocaleString('ru-RU')

export default function BuyScreen({ balance, onClose }: { balance: number; onClose: () => void }) {
  const [sol, setSol] = useState(0)          // ползунок от 0 (0 = только мой баланс)
  const [copied, setCopied] = useState(false)

  const bought = sol * CFG.kakaPerSolEarly
  const total = balance + bought
  const canBuy = sol >= CFG.minBuySol

  const pts = useMemo(() => {
    const now = total * CFG.rateEarlyUsd
    return {
      now,
      presale: now * CFG.presaleMult,
      list10: now * CFG.listingBase,
      list30: now * CFG.listingMoon,
    }
  }, [total])

  // ===== геометрия =====
  const W = 320, H = 190, padL = 14, padR = 14, padT = 34, padB = 30
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  // Лог-шкала: красивое распределение по высоте независимо от сумм.
  const minV = Math.max(pts.now, 0.01)
  const maxV = pts.list30 || 1
  const lmin = Math.log(minV)
  const lmax = Math.log(Math.max(maxV, minV) * 1.08)
  const yOf = (v: number) => {
    if (lmax === lmin) return padT + innerH * 0.5
    const t = (Math.log(Math.max(v, 1e-6)) - lmin) / (lmax - lmin)
    const tt = 0.08 + Math.max(0, Math.min(1, t)) * 0.88
    return padT + innerH - tt * innerH
  }

  const xNow = padL
  const xPre = padL + innerW * 0.5
  const xList = padL + innerW

  const pNow = { x: xNow, y: yOf(pts.now) }
  const pPre = { x: xPre, y: yOf(pts.presale) }
  const p10 = { x: xList, y: yOf(pts.list10) }
  const p30 = { x: xList, y: yOf(pts.list30) }

  const basePath = `M ${pNow.x} ${pNow.y} L ${pPre.x} ${pPre.y} L ${p10.x} ${p10.y}`
  const moonPath = `M ${pPre.x} ${pPre.y} L ${p30.x} ${p30.y}`
  const areaPath = `${basePath} L ${p10.x} ${padT + innerH} L ${pNow.x} ${padT + innerH} Z`

  const copyWallet = () => {
    navigator.clipboard?.writeText(CFG.wallet).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1400)
    }).catch(() => {})
  }

  const goSupport = () => {
    const tg = (window as any).Telegram?.WebApp
    const text = encodeURIComponent(
      `Здравствуйте! Хочу зайти в $KAKA на ${sol} SOL. Прикрепляю транзакцию: [вставь хэш]. Мой ник в приложении: `
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

        <RoundTimer compact />

        <p className="buy-sub">
          {sol === 0
            ? <>Вот во что превратится твой баланс. Подвигай ползунок — <span className="grn">докупи и смотри рост</span>.</>
            : <>Чем раньше зайдёшь — тем дешевле $KAKA. Потенциал <span className="grn">10–30x</span> к листингу.</>}
        </p>

        {/* ===== ГРАФИК ===== */}
        <div className="buy-chart">
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8C87A" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#E8C87A" stopOpacity="0" />
              </linearGradient>
              <filter id="moonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} stroke="#2e2a36" strokeWidth="1" />

            <motion.path
              d={areaPath} fill="url(#areaGrad)"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />

            <motion.path
              d={moonPath} fill="none" stroke="#5bd37a" strokeWidth="2.5"
              strokeDasharray="5 5" strokeLinecap="round" filter="url(#moonGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
            />
            <motion.path
              d={basePath} fill="none" stroke="#E8C87A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />

            <motion.circle cx={pNow.x} cy={pNow.y} r="6" fill="#E8C87A"
              animate={{ scale: [1, 1.35, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
            <circle cx={pPre.x} cy={pPre.y} r="5" fill="#E8C87A" />
            <circle cx={p10.x} cy={p10.y} r="5" fill="#E8C87A" />
            <motion.circle cx={p30.x} cy={p30.y} r="6.5" fill="#5bd37a" filter="url(#moonGlow)"
              animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.3, repeat: Infinity }} />

            {/* ЦИФРЫ С ПОДЛОЖКАМИ */}
            {/* сейчас */}
            <g transform={`translate(${pNow.x}, ${pNow.y - 20})`}>
              <rect x="-4" y="-13" width={fmtUsd(pts.now).length * 7.5 + 8} height="18" rx="5" fill="#0f0d13" opacity="0.85" />
              <text x="0" y="0" fill="#E8C87A" fontSize="12" fontWeight="800" textAnchor="start">{fmtUsd(pts.now)}</text>
            </g>
            {/* presale */}
            <g transform={`translate(${pPre.x}, ${pPre.y - 20})`}>
              <rect x={-(fmtUsd(pts.presale).length * 6.5 + 8) / 2} y="-13" width={fmtUsd(pts.presale).length * 6.5 + 8} height="18" rx="5" fill="#0f0d13" opacity="0.85" />
              <text x="0" y="0" fill="#efe9df" fontSize="11" fontWeight="700" textAnchor="middle">{fmtUsd(pts.presale)}</text>
            </g>
            {/* 30x — высоко в угол */}
            <g transform={`translate(${p30.x + 6}, ${p30.y - 26})`}>
              <rect x={-(fmtUsd(pts.list30).length * 7.5 + 30)} y="-13" width={fmtUsd(pts.list30).length * 7.5 + 30} height="19" rx="5" fill="#0f0d13" opacity="0.9" />
              <text x="0" y="0" fill="#5bd37a" fontSize="13" fontWeight="800" textAnchor="end">{fmtUsd(pts.list30)} 🚀</text>
              <text x="0" y="12" fill="#5bd37a" fontSize="9" fontWeight="700" textAnchor="end" opacity="0.9">30x</text>
            </g>
            {/* 10x — ниже и левее, оторван от жёлтой */}
            <g transform={`translate(${p10.x - 2}, ${p10.y + 24})`}>
              <rect x={-(fmtUsd(pts.list10).length * 7.5 + 8)} y="-13" width={fmtUsd(pts.list10).length * 7.5 + 8} height="19" rx="5" fill="#0f0d13" opacity="0.9" />
              <text x="0" y="0" fill="#E8C87A" fontSize="12" fontWeight="800" textAnchor="end">{fmtUsd(pts.list10)}</text>
              <text x="0" y="12" fill="#E8C87A" fontSize="9" fontWeight="700" textAnchor="end" opacity="0.9">10x</text>
            </g>

            <text x={pNow.x} y={H - 8} fill="#b2924f" fontSize="10" fontWeight="700" textAnchor="start">{sol === 0 ? 'Сейчас' : 'Твой вход'}</text>
            <text x={pPre.x} y={H - 8} fill="#E8C87A" fontSize="10" fontWeight="700" textAnchor="middle">Presale</text>
            <text x={p10.x} y={H - 8} fill="#5bd37a" fontSize="10" fontWeight="700" textAnchor="end">Листинг</text>
          </svg>
        </div>

        {/* ===== ПОЛЗУНОК ===== */}
        <div className="buy-calc">
          <div className="buy-calc-row">
            <span className="buy-calc-lab">{sol === 0 ? 'Докупить (двигай)' : 'Докупить'}</span>
            <span className="buy-calc-sol">{sol % 1 === 0 ? sol : sol.toFixed(1)} SOL</span>
          </div>
          <input
            type="range" min={0} max={CFG.maxSol} step={0.5} value={sol}
            onChange={(e) => setSol(parseFloat(e.target.value))}
            className="buy-range"
            style={{ ['--pct' as any]: `${(sol / CFG.maxSol) * 100}%` }}
          />
          <div className="buy-calc-get">
            {sol === 0 ? (
              <span className="buy-calc-base">Твой баланс: {fmtKaka(balance)} $KAKA</span>
            ) : (
              <><img src={coinImg} className="buy-calc-coin" alt="" />+{fmtKaka(bought)} $KAKA</>
            )}
          </div>
        </div>

        {/* ===== КОШЕЛЁК ===== */}
        <div className="buy-wallet">
          <div className="buy-wallet-head">Отправь SOL сюда</div>
          <div className="buy-wallet-sub">Сеть Solana · минимум 0.5 SOL</div>
          <div className="buy-addr-row">
            <div className="buy-addr">{CFG.wallet}</div>
            <button className="buy-copy" onClick={copyWallet}>{copied ? '✓' : 'Копир.'}</button>
          </div>
          <img
            className="buy-qr"
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&bgcolor=ffffff&data=${encodeURIComponent(CFG.wallet)}`}
            alt="QR кошелька"
            loading="lazy"
          />
        </div>

        {/* ===== САППОРТ ===== */}
        <button
          className="btn-gold buy-paid-btn"
          onClick={goSupport}
          disabled={!canBuy}
          style={!canBuy ? { opacity: 0.5 } : undefined}
        >
          {canBuy ? (
            <span className="buy-paid-inner">
              <span className="buy-paid-top">Я оплатил</span>
              <span className="buy-paid-sub">Подтвердить транзакцию →</span>
            </span>
          ) : 'Минимум 0.5 SOL для входа'}
        </button>

        <p className="buy-legal">
          Оценка по цене текущего раунда. Потенциал роста — не гарантия. Участвуй ответственно.
        </p>
      </motion.div>
    </div>
  )
}
