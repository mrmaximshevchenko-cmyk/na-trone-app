import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import Stats from './Stats'
import BuyScreen from './BuyScreen'
import RoundTimer from './RoundTimer'
import { ACHIEVEMENTS, getUnlockedIds } from './achievements'
import Profile from './Profile'
import mascotMain from './assets/mascot/main.png'
import mascotHappy from './assets/mascot/happy.png'
import mascotNeutral from './assets/mascot/neutral.png'
import mascotSad from './assets/mascot/sad.png'
import mascotShrug from './assets/mascot/shrug.png'
import mascotStreak from './assets/mascot/streak.png'
import { saveSessionToServer, loadSessionsFromServer, registerUser, acceptInvite, getUserId, notifyAchievement, haptic, loadCoins, markCoinsOnboarded, loadTapState, sendTaps, upgradeTapPower } from './api'
import coinImg from './assets/coin.png'
import confetti from 'canvas-confetti'

// ==== БИБЛИОТЕКА ФРАЗ ====
const PRAISE = [
  'Шедевр! Можно вешать в галерею 🖼️',
  'Чистая работа, король трона 👑',
  'Вот это ты выдал! Стоячая овация 👏',
  'Идеально. Прям учебное пособие 📚',
  'Ты сегодня в ударе! 🔥',
  'Профессионал своего дела 🏆',
  'Легенда трона проснулась 🐉',
  'Ты справился на все сто! 💯',
  'Космос! Прям взлёт без турбулентности 🚀',
  'Ювелирная работа 💎',
  'Ты сегодня победитель. Официально 🥇',
  'Как швейцарские часы. Точно и надёжно',
  'Это было эпично. Титры 🎬',
  'Вот она — гармония с собой ☯️',
  'Изящно! Балет, а не поход',
  'Вот это контроль! Мастер дзена 🧘',
  'Триумф! Можно и похвастаться друзьям 📣',
]

const NEUTRAL = [
  'Норм заход. Дело сделано 👍',
  'Стабильно. Без сюрпризов',
  'Рабочий вариант. Живём дальше',
  'Ок, задача выполнена ✅',
  'Обычный день на троне. И это нормально',
  'Сойдёт! Не каждый раз шедевр',
  'Твёрдая серединка. Всё по плану',
  'Без фанфар, но чётко 🫡',
]

const SYMPATHY = [
  'Бывает и такое. В следующий раз будет легче 💛',
  'Не переживай, у всех бывают трудные дни',
  'Организм капризничает — это пройдёт',
  'Держись, дружище. Мы это переживём 🫂',
  'Иногда трон испытывает нас на прочность',
  'Это временно. Верю в твой кишечник 🙏',
  'Обнимаю. Пусть следующий раз будет мягче 🫂',
  'Организму сегодня непросто. Побереги себя',
  'Сложный заход. Отдохни, попей водички',
  'Ты сильнее, чем кажется. Даже на троне 💪',
  'Немного сбой в системе — перезагрузимся 🔄',
  'Крепись. И побольше воды, ага? 💧',
  'Пусть следующий трон будет добрее к тебе',
]

const ENCOURAGE = [
  'Бывает! Не всё сразу 🫡',
  'Ложная тревога — тоже результат 😄',
  'Организм просто передумал. Ничего страшного',
  'Не вышло — значит, не время. Всё ок 👍',
]

const TIPS_HARD = [
  'Съешь сегодня свёклу или морковь — они помогают 🥕',
  'Чернослив — твой друг. Пара штук творят чудеса',
  'Закинься киви или грушей, организм скажет спасибо 🥝',
  'Выпей стакан кефира на ночь 🥛',
  'Побольше воды сегодня — сухость любит влагу 💧',
  'Прогуляйся 20–30 минут, движение помогает кишечнику 🚶',
  'Овсянка на завтрак — и станет легче',
]

const TIPS_LOOSE = [
  'Сегодня рис и бананы — они закрепляют 🍌',
  'Побольше воды! При жидком легко обезводиться 💧',
  'Сухарики и тосты — простая спасительная еда',
  'Избегай сегодня жирного и острого 🌶️',
  'Крепкий несладкий чай тоже выручает 🍵',
  'Дай желудку отдохнуть — лёгкая еда сегодня',
]

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

type Session = {
  id: number
  date: string
  rating: number
  amount: string
  consistency: string
  sheets: number
  noPaper: boolean
}



function dayKey(ms: number) {
  const d = new Date(ms)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function calcStreak(history: Session[]) {
  if (history.length === 0) return 0
  const days = new Set(history.map((s) => dayKey(s.id)))
  let streak = 0
  const cursor = new Date()
  if (!days.has(dayKey(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (days.has(dayKey(cursor.getTime()))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function App() {
  const [tab, setTab] = useState('home')
  const [buyOpen, setBuyOpen] = useState(false)
  const [coins, setCoins] = useState<number>(0)
  const [coinsOnboard, setCoinsOnboard] = useState<any | null>(null)

  // ===== ТАПАЛКА =====
  const [tapPower, setTapPower] = useState(1)
  const [earnedToday, setEarnedToday] = useState(0)
  const [dailyLimit, setDailyLimit] = useState(1000)
  const [floatTaps, setFloatTaps] = useState<{ id: number; x: number; y: number; n: number }[]>([])
  const [poops, setPoops] = useState<{ id: number; x: number; y: number; dx: number }[]>([])
  const [tapScale, setTapScale] = useState(1)
  const pendingTaps = useRef(0)       // буфер тапов, ещё не отправленных на сервер
  const flushTimer = useRef<any>(null)
  const [flow, setFlow] = useState(false)       // идёт ли запись
  const [step, setStep] = useState('rating')    // текущий шаг записи

  const [rating, setRating] = useState(0)
  const [amount, setAmount] = useState('')
  const [consistency, setConsistency] = useState('')
  const [sheets, setSheets] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [noPaper, setNoPaper] = useState(false)

  const [resultTitle, setResultTitle] = useState('')
  const [resultTip, setResultTip] = useState('')
  const [resultMascot, setResultMascot] = useState(mascotHappy)

  const [history, setHistory] = useState<Session[]>(() => {
    const saved = localStorage.getItem('throne_history')
    return saved ? JSON.parse(saved) : []
  })

  const [unlocked, setUnlocked] = useState<string[]>(() => {
    const saved = localStorage.getItem('throne_unlocked')
    return saved ? JSON.parse(saved) : []
  })

  const [popupAch, setPopupAch] = useState<typeof ACHIEVEMENTS>([])
  const [pendingAch, setPendingAch] = useState<typeof ACHIEVEMENTS>([])
  const [viewAch, setViewAch] = useState<typeof ACHIEVEMENTS[number] | null>(null)

  const shareAch = (a: typeof ACHIEVEMENTS[number]) => {
    const tg = (window as any).Telegram?.WebApp
    // Запрос — только id ачивки (название сервер подставит сам)
    const query = a.id
    if (tg?.switchInlineQuery) {
      tg.switchInlineQuery(query, ['users', 'groups', 'channels', 'bots'])
    } else {
      // Запасной вариант вне Telegram
      const text = `🏆 Новое достижение на троне: «${a.name}»!`
      const url = 'https://t.me/natrone_bot/throne'
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  const TOTAL_SHEETS = 10

  useEffect(() => {
    localStorage.setItem('throne_history', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem('throne_unlocked', JSON.stringify(unlocked))
  }, [unlocked])
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
    }
        loadCoins().then((data) => setCoins(data.balance || 0))
    registerUser().then(() => {
      // Проверяем, пришёл ли по инвайт-ссылке (?startapp=ref_XXX)
      const startParam = tg?.initDataUnsafe?.start_param
      if (startParam && startParam.startsWith('ref_')) {
        const inviterId = 'tg_' + startParam.replace('ref_', '')
        if (inviterId !== getUserId()) {
          acceptInvite(inviterId)
        }
      }
    })
    loadTapState().then((ts) => {
      setTapPower(ts.tapPower || 1)
      setEarnedToday(ts.earnedToday || 0)
      setDailyLimit(ts.dailyLimit || 1000)
    })
    loadCoins().then((data) => {
      setCoins(data.balance || 0)
      // Первый вход после обновления — показать салют
      if (!data.onboarded && data.balance > 0) {
        // Считаем разбивку из лога
        const log = data.log || []
        const achSum = log.filter((l: any) => l.reason.startsWith('ach_')).reduce((a: number, l: any) => a + l.amount, 0)
        const achCount = log.filter((l: any) => l.reason.startsWith('ach_')).length
        const bonus = log.filter((l: any) => l.reason === 'oldbie_bonus').reduce((a: number, l: any) => a + l.amount, 0)
        setCoinsOnboard({ total: data.balance, achSum, achCount, bonus })
        setTimeout(() => confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 }, colors: ['#E8C87A', '#FFD700', '#8B5A2B', '#ffffff'] }), 300)
      }
    })
    loadSessionsFromServer().then((serverHistory) => {
      if (serverHistory && serverHistory.length > 0) {
        setHistory(serverHistory)
        // Пересчитываем ачивки из серверной истории (чтобы на новом устройстве они подтянулись)
        const idsFromServer = getUnlockedIds(serverHistory)
        setUnlocked((prev) => Array.from(new Set([...prev, ...idsFromServer])))
      }
    })
  }, [])

  // ===== ЛОГИКА ТАПА =====
  const flushTaps = () => {
    const n = pendingTaps.current
    if (n <= 0) return
    pendingTaps.current = 0
    sendTaps(n).then((r) => {
      if (r && r.ok) {
        setCoins(r.balance)
        setEarnedToday(r.earnedToday)
      }
    })
  }

  const handleTap = (e: any) => {
    if (earnedToday >= dailyLimit) { haptic('warning'); return }
    haptic('light')

    const rect = e.currentTarget.getBoundingClientRect()
    const cx = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left
    const cy = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top

    setCoins((c) => c + tapPower)
    setEarnedToday((v) => Math.min(dailyLimit, v + tapPower))
    pendingTaps.current += 1

    setTapScale(0.92)
    setTimeout(() => setTapScale(1), 90)

    const fid = Date.now() + Math.random()
    setFloatTaps((arr) => [...arr, { id: fid, x: cx, y: cy, n: tapPower }])
    setTimeout(() => setFloatTaps((arr) => arr.filter((t) => t.id !== fid)), 700)

    const burst = 2 + Math.floor(Math.random() * 2)
    const newPoops = Array.from({ length: burst }).map(() => ({
      id: Date.now() + Math.random(),
      x: cx, y: cy,
      dx: (Math.random() - 0.5) * 120,
    }))
    setPoops((arr) => [...arr, ...newPoops])
    setTimeout(() => {
      const ids = new Set(newPoops.map((p) => p.id))
      setPoops((arr) => arr.filter((p) => !ids.has(p.id)))
    }, 800)

    if (pendingTaps.current % 20 === 0) haptic('medium')

    if (flushTimer.current) clearTimeout(flushTimer.current)
    flushTimer.current = setTimeout(flushTaps, 1500)
  }

  const TAP_COSTS = [0, 500, 1500, 4000, 10000, 25000]
  const nextTapCost = tapPower < TAP_COSTS.length ? TAP_COSTS[tapPower] : null
  const doTapUpgrade = () => {
    if (nextTapCost === null || coins < nextTapCost) { haptic('error'); return }
    haptic('medium')
    upgradeTapPower().then((r) => {
      if (r && r.ok) {
        setTapPower(r.tapPower)
        setCoins(r.balance)
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#E8C87A', '#FFD700', '#ffffff'] })
      } else { haptic('error') }
    })
  }

  const handleSheetClick = (sheetNumber: number) => {
    haptic('light')
    setNoPaper(false)
    setSheets(sheetNumber)
  }

  const startRecord = () => {
    setRating(0)
    setAmount('')
    setConsistency('')
    setSheets(0)
    setNoPaper(false)
    setStep('rating')
    setFlow(true)
  }

  // Переход вперёд с учётом пропуска консистенции при Осечке
  const goNext = () => {
    if (step === 'rating') setStep('amount')
    else if (step === 'amount') setStep(amount === 'Осечка' ? 'paper' : 'consistency')
    else if (step === 'consistency') setStep('paper')
  }

  // Переход назад
  const goBack = () => {
    if (step === 'amount') setStep('rating')
    else if (step === 'consistency') setStep('amount')
    else if (step === 'paper') setStep(amount === 'Осечка' ? 'amount' : 'consistency')
  }

  const saveSession = () => {
    haptic('medium')
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.7 },
      colors: ['#E8C87A', '#FFD700', '#8B5A2B', '#ffffff'],
    })
    let title = ''
    let tip = ''

           if (amount === 'Осечка') {
      title = pick(ENCOURAGE)
      tip = pick(TIPS_HARD)
      setResultMascot(mascotShrug)
    } else if (consistency === 'Сухарь') {
      title = pick(SYMPATHY)
      tip = pick(TIPS_HARD)
      setResultMascot(mascotSad)
    } else if (consistency === 'Жидко') {
      title = pick(SYMPATHY)
      tip = pick(TIPS_LOOSE)
      setResultMascot(mascotSad)
    } else if (rating >= 7) {
      title = pick(PRAISE)
      setResultMascot(mascotHappy)
    } else if (rating >= 4) {
      title = pick(NEUTRAL)
      setResultMascot(mascotNeutral)
    } else {
      title = pick(SYMPATHY)
      setResultMascot(mascotSad)
    }

    setResultTitle(title)
    setResultTip(tip)

    const now = new Date()
    const dateStr = now.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
    const newSession: Session = {
      id: now.getTime(),
      date: dateStr,
      rating,
      amount,
      consistency,
      sheets,
      noPaper,
    }

    const newHistory = [newSession, ...history]
    setHistory(newHistory)
    saveSessionToServer(newSession)

    const nowUnlockedIds = getUnlockedIds(newHistory)
    const freshIds = nowUnlockedIds.filter((id) => !unlocked.includes(id))
    if (freshIds.length > 0) {
      setUnlocked([...unlocked, ...freshIds])
      const freshAch = ACHIEVEMENTS.filter((a) => freshIds.includes(a.id))
      setPendingAch(freshAch)
      haptic('success')
      // Тихо шлём картинки полученных ачивок в чат с ботом
      freshAch.forEach((a) => notifyAchievement(a.id, a.name))
    }

    setStep('result')
  }

  const closeFlow = () => setFlow(false)

  // ===== Показатели =====
  const total = history.length
  const streak = calcStreak(history)
  const isNewbie = total === 0



  const achPopup = popupAch.length > 0 && (
    <div className="ach-popup-overlay" onClick={() => setPopupAch([])}>
      <motion.div
        className="ach-popup"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      >
        <div className="ach-popup-title">
          {popupAch.length === 1 ? 'Достижение получено!' : `Получено ${popupAch.length} достижения!`}
        </div>
        <div className="ach-popup-list">
          {popupAch.map((a) => (
            <div key={a.id}
              className={popupAch.length > 1 ? 'ach-popup-item clickable' : 'ach-popup-item'}
              onClick={() => { if (popupAch.length > 1) setViewAch(a) }}>
              <span className="ach-popup-emoji">{a.emoji}</span>
              <div className="ach-popup-text">
                <span className="ach-popup-name">{a.name}</span>
                <span className="ach-popup-cond">{a.condition}</span>
              </div>
              {popupAch.length > 1 && <span className="ach-popup-arrow">›</span>}
            </div>
          ))}
        </div>
        <button className="btn-gold" onClick={() => { setPopupAch([]); closeFlow() }}>
          Круто! 🎉
        </button>
        {popupAch.length === 1 && (
          <button className="btn-share-soft" onClick={() => shareAch(popupAch[0])}>
            Поделиться 📤
          </button>
        )}
      </motion.div>
    </div>
  )

  const achViewModal = viewAch && (
    <div className="ach-popup-overlay" onClick={() => setViewAch(null)}>
      <div className="ach-popup" onClick={(e) => e.stopPropagation()}>
        <button className="ach-close-btn" onClick={() => setViewAch(null)}>✕</button>
        <div className="ach-view-emoji">{viewAch.emoji}</div>
        <div className="ach-popup-title">{viewAch.name}</div>
        <div className="ach-view-cond">{viewAch.condition}</div>
        <button className="btn-gold" onClick={() => shareAch(viewAch)}>
          Похвастаться 📤
        </button>
      </div>
    </div>
  )

  // Индикатор прогресса (точки). Всего шагов: 4 (или 3 при Осечке)
  const steps = amount === 'Осечка'
    ? ['rating', 'amount', 'paper']
    : ['rating', 'amount', 'consistency', 'paper']
  const currentStepIndex = steps.indexOf(step)
  const progress = (
    <div className="progress-bar">
      {currentStepIndex > 0 ? (
        <button className="back-arrow" onClick={goBack} aria-label="Назад">←</button>
      ) : (
        <span className="back-arrow-placeholder" />
      )}
      <div className="progress-dots">
        {steps.map((s, i) => (
          <span key={s} className={i <= currentStepIndex ? 'dot-step active' : 'dot-step'} />
        ))}
      </div>
      <span className="back-arrow-placeholder" />
    </div>
  )

  // ======================================================
  // ПРОЦЕСС ЗАПИСИ (пошаговый)
  // ======================================================
  if (flow) {
    // --- Шаг: результат ---
    if (step === 'result') {
      return (
        <div className="app">
          <motion.img
            src={resultMascot} className="mascot-img" alt="Результат"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h2 className="record-title">{resultTitle}</h2>
          {resultTip && <p className="result-tip">💡 {resultTip}</p>}
          <button className="btn-gold next-btn result-main-btn" onClick={() => {
            if (pendingAch.length > 0) {
              setPopupAch(pendingAch)
              setPendingAch([])
            } else {
              closeFlow()
            }
          }}>
            Готово
          </button>
          {achPopup}
          {achViewModal}
        </div>
      )
    }

    // --- Шаг: оценка ---
    if (step === 'rating') {
      return (
        <div className="app app-scroll">
          {progress}
          <motion.div className="step-motion" key="rating" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
          <h2 className="record-title">Как всё прошло?</h2>
          <p className="subtitle">Оцени сеанс от 1 до 10</p>
          <div className="rating-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                className={rating === n ? 'rating-btn active' : 'rating-btn'}
                onClick={() => { haptic('light'); setRating(n) }}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            className={rating > 0 ? 'btn-gold next-btn' : 'btn-gold next-btn disabled'}
            disabled={rating === 0}
            onClick={goNext}
          >
            Далее →
          </button>
          <button className="back-btn" onClick={closeFlow}>← Отмена</button>
          </motion.div>
        </div>
      )
    }

    // --- Шаг: количество ---
    if (step === 'amount') {
      return (
        <div className="app app-scroll">
          {progress}
          <motion.div className="step-motion" key="amount" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
          <h2 className="record-title">Сколько добра?</h2>
          <p className="subtitle">Оцени объём</p>
          <div className="big-options">
                      {[['Осечка','💨'], ['Чуток','🤏'], ['Стандарт','👍'], ['Куча','💪']].map(([opt, ico]) => (
              <button
                key={opt}
                className={amount === opt ? 'big-option active' : 'big-option'}
                onClick={() => { haptic('light'); setAmount(opt) }}
              >
                <span className="opt-ico">{ico}</span> {opt}
              </button>
            ))}
          </div>
          <button
            className={amount ? 'btn-gold next-btn' : 'btn-gold next-btn disabled'}
            disabled={!amount}
            onClick={goNext}
          >
            Далее →
          </button>
          </motion.div>
        </div>
      )
    }

    // --- Шаг: консистенция ---
    if (step === 'consistency') {
      return (
        <div className="app app-scroll">
          {progress}
          <motion.div className="step-motion" key="consistency" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
          <h2 className="record-title">Какая консистенция?</h2>
          <p className="subtitle">Выбери, что ближе</p>
          <div className="big-options">
              {[['Жидко','💧'], ['Мягко','🍦'], ['Колбаска','🌭'], ['Сухарь','🪨']].map(([opt, ico]) => (
              <button
                key={opt}
                className={consistency === opt ? 'big-option active' : 'big-option'}
                onClick={() => { haptic('light'); setConsistency(opt) }}
              >
                <span className="opt-ico">{ico}</span> {opt}
              </button>
            ))}
          </div>
          <button
            className={consistency ? 'btn-gold next-btn' : 'btn-gold next-btn disabled'}
            disabled={!consistency}
            onClick={goNext}
          >
            Далее →
          </button>
          </motion.div>
        </div>
      )
    }

    // --- Шаг: рулон ---
    return (
      <div className="app app-scroll">
        {progress}
        <motion.div className="step-motion" key="paper" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
        <h2 className="record-title">Сколько бумаги ушло?</h2>
        <p className="subtitle">Тапни по листам или проведи пальцем</p>

        <button
          className={noPaper ? 'option-btn no-paper-btn active' : 'option-btn no-paper-btn'}
          onClick={() => { setNoPaper(true); setSheets(0) }}
        >
          💩 Без бумаги 🚿
        </button>

        <div className="roll-top">🧻</div>

        <div
          className="paper-roll"
          onMouseLeave={() => setIsDragging(false)}
          onMouseUp={() => setIsDragging(false)}
          onTouchMove={(e) => {
            const touch = e.touches[0]
            const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement
            if (el && el.dataset.sheet) {
              setNoPaper(false)
              setSheets(Number(el.dataset.sheet))
            }
          }}
        >
          {Array.from({ length: TOTAL_SHEETS }).map((_, i) => {
            const sheetNumber = i + 1
            const isTorn = !noPaper && sheetNumber <= sheets
            return (
              <motion.button
                key={sheetNumber}
                data-sheet={sheetNumber}
                className={isTorn ? 'sheet torn' : 'sheet'}
                onClick={() => handleSheetClick(sheetNumber)}
                onMouseDown={() => {
                  setNoPaper(false)
                  setIsDragging(true)
                  setSheets(sheetNumber)
                }}
                onMouseEnter={() => {
                  if (isDragging) setSheets(sheetNumber)
                }}
                onTouchStart={() => {
                  setNoPaper(false)
                  setSheets(sheetNumber)
                }}
                animate={isTorn ? { x: [0, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isTorn ? '💩' : ''}
              </motion.button>
            )
          })}
        </div>

        <p className="sheets-count">
          {noPaper ? 'Без бумаги' : sheets === 0 ? 'Ещё не выбрано' : `Оторвано: ${sheets} 🧻`}
        </p>

        <button className="btn-gold next-btn" onClick={saveSession}>
          Сохранить ✅
        </button>
        </motion.div>
      </div>
    )
  }

  // ======================================================
  // ВКЛАДКИ
  // ======================================================
  let content = null

  if (tab === 'home') {
    content = (
      <div className="tab-content home">
        {isNewbie ? (
          <>
            <div className="brand">
              <div className="crown">👑</div>
              <h1 className="brand-title">На троне</h1>
              <p className="brand-sub">Твой личный какашка-трекер</p>
            </div>
            <motion.img
              src={mascotMain} className="mascot-img" alt="На троне"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="newbie-features">
              <div className="feature-row"><span className="feature-ico">✅</span> Веди дневник походов</div>
              <div className="feature-row"><span className="feature-ico">❤️</span> Следи за здоровьем ЖКТ</div>
              <div className="feature-row"><span className="feature-ico">🏆</span> Зарабатывай достижения</div>
              <div className="feature-row"><span className="feature-ico">🔥</span> Ставь рекорды и делись с друзьями</div>
            </div>

            <p className="newbie-cta">Запиши свой первый поход!</p>
            <p className="newbie-arrow">👇 Жми на унитаз</p>
          </>
        ) : (
          <>
            <RoundTimer />

            {/* ТАПАЛКА */}
            <div className="tap-zone">
              <motion.div
                className="tap-mascot-wrap"
                onPointerDown={handleTap}
                animate={{ scale: tapScale }}
                transition={{ type: 'spring', stiffness: 600, damping: 15 }}
              >
                <motion.img
                  src={streak >= 3 ? mascotStreak : mascotMain}
                  className="mascot-img tap-mascot" alt="Тапай"
                  draggable={false}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* летящие 💩 */}
                {poops.map((p) => (
                  <motion.span
                    key={p.id} className="tap-poop"
                    initial={{ x: p.x, y: p.y, opacity: 1, scale: 0.6 }}
                    animate={{ x: p.x + p.dx, y: p.y - 90, opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  >💩</motion.span>
                ))}
                {/* всплывающие +N */}
                {floatTaps.map((t) => (
                  <motion.span
                    key={t.id} className="tap-float"
                    initial={{ x: t.x, y: t.y, opacity: 1 }}
                    animate={{ y: t.y - 60, opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  >+{t.n}</motion.span>
                ))}
              </motion.div>

              <div className="tap-balance">
                <img src={coinImg} className="tap-balance-coin" alt="🪙" />
                <span className="tap-balance-num">{coins}</span>
                <span className="tap-balance-lab">$KAKA</span>
              </div>

              <motion.p
                className="tap-hint"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >👆 Тапай и зарабатывай $KAKA</motion.p>

              {/* прогресс дня */}
              <div className="tap-progress">
                <div className="tap-progress-bar" style={{ width: `${Math.min(100, (earnedToday / dailyLimit) * 100)}%` }} />
                <span className="tap-progress-label">
                  {earnedToday >= dailyLimit ? 'Лимит на сегодня 👑' : `${earnedToday} / ${dailyLimit} за сегодня`}
                </span>
              </div>

              {/* сила тапа */}
              <button className="tap-upgrade" onClick={doTapUpgrade} disabled={nextTapCost === null || coins < nextTapCost}>
                <span className="tap-up-left">⚡ Сила тапа · ур.{tapPower}</span>
                <span className="tap-up-right">
                  {nextTapCost === null ? 'MAX' : <><img src={coinImg} className="tap-up-coin" alt="" />{nextTapCost}</>}
                </span>
              </button>
            </div>

            <button className="buy-cta" onClick={() => setBuyOpen(true)}>
              <span className="buy-cta-top">🚀 Войти в Early Bird</span>
              <span className="buy-cta-sub">Потенциал 10–30x</span>
            </button>
          </>
        )}
      </div>
    )
  }

  if (tab === 'stats') {
    content = <Stats history={history} />
  }

  if (tab === 'achievements') {
    const visible = ACHIEVEMENTS.filter((a) => !a.secret)
    const secret = ACHIEVEMENTS.filter((a) => a.secret)
    const gotCount = ACHIEVEMENTS.filter((a) => unlocked.includes(a.id)).length

    const unlockReader = () => {
      if (!unlocked.includes('reader')) {
        setUnlocked((prev) => Array.from(new Set([...prev, 'reader'])))
        const readerAch = ACHIEVEMENTS.filter((a) => a.id === 'reader')
        setPopupAch(readerAch)
      }
    }

    content = (
      <div className="tab-content ach-screen">
        <h2 className="record-title">Достижения 🏆</h2>
        <p className="ach-counter">Получено {gotCount} из {ACHIEVEMENTS.length}</p>

        <p className="field-label ach-block-title">🎯 Задания</p>
        <div className="ach-grid">
          {visible.map((a, i) => {
            const got = unlocked.includes(a.id)
            return (
              <motion.div key={a.id} className={got ? 'ach-card got' : 'ach-card locked'}
                onClick={() => { if (got) setViewAch(a) }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.03, 0.5), duration: 0.3 }}>
                <div className="ach-emoji">{got ? a.emoji : '🔒'}</div>
                <div className="ach-name">{a.name}</div>
                <div className="ach-cond">{a.condition}</div>
                <div className={got ? 'ach-coins got' : 'ach-coins'}>
                  <img src={coinImg} className="ach-coin-icon" alt="🪙" />
                  {got ? '+' : ''}{a.coins}
                </div>
              </motion.div>
            )
          })}
        </div>

        <p className="field-label ach-block-title">🕵️ Секретные</p>
        <div className="ach-grid">
          {secret.map((a, i) => {
            const got = unlocked.includes(a.id)
            return (
              <motion.div key={a.id} className={got ? 'ach-card got' : 'ach-card secret'}
                onClick={() => { if (got) setViewAch(a) }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.03, 0.5), duration: 0.3 }}>
                <div className="ach-emoji">{got ? a.emoji : '❓'}</div>
                <div className="ach-name">{got ? a.name : '???'}</div>
                {got && <div className="ach-cond">{a.condition}</div>}
                <div className={got ? 'ach-coins got' : 'ach-coins'}>
                  <img src={coinImg} className="ach-coin-icon" alt="🪙" />
                  {got ? '+' + a.coins : '???'}
                </div>
              </motion.div>
            )
          })}
        </div>
        <button className="ach-end-marker" onClick={unlockReader}>Ты долистал до самого низа 🫡</button>
      </div>
    )
  }

  if (tab === 'profile') {
    content = (
      <Profile
        onOpenBuy={() => setBuyOpen(true)}
        onClearHistory={() => {
          setHistory([])
          setUnlocked([])
          localStorage.removeItem('throne_history')
          localStorage.removeItem('throne_unlocked')
        }}
      />
    )
  }

  // ======================================================
  // ОСНОВНОЙ ВИД
  // ======================================================
  return (
    <div className="app-shell">
      <div className="shell-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </div>

      {buyOpen && <BuyScreen balance={coins} onClose={() => setBuyOpen(false)} />}

      <nav className="tabbar">
        <button className={tab === 'home' ? 'tab active' : 'tab'} onClick={() => setTab('home')}>
          <motion.span className="tab-icon" animate={tab === 'home' ? { y: [0, -6, 0] } : {}} transition={{ duration: 0.3 }}>🏠</motion.span>
          <span className="tab-text">Главная</span>
        </button>
        <button className={tab === 'stats' ? 'tab active' : 'tab'} onClick={() => setTab('stats')}>
          <motion.span className="tab-icon" animate={tab === 'stats' ? { y: [0, -6, 0] } : {}} transition={{ duration: 0.3 }}>📊</motion.span>
          <span className="tab-text">Стата</span>
        </button>
        <button className="tab tab-center" onClick={startRecord}>
          <span className="tab-toilet">🚽</span>
        </button>
        <button className={tab === 'achievements' ? 'tab active' : 'tab'} onClick={() => setTab('achievements')}>
          <motion.span className="tab-icon" animate={tab === 'achievements' ? { y: [0, -6, 0] } : {}} transition={{ duration: 0.3 }}>🏆</motion.span>
          <span className="tab-text">Ачивки</span>
        </button>
        <button className={tab === 'profile' ? 'tab active' : 'tab'} onClick={() => setTab('profile')}>
          <motion.span className="tab-icon" animate={tab === 'profile' ? { y: [0, -6, 0] } : {}} transition={{ duration: 0.3 }}>👤</motion.span>
          <span className="tab-text">Профиль</span>
        </button>
      </nav>

      {achPopup}
      {achViewModal}

      {coinsOnboard && (
        <div className="ach-popup-overlay" onClick={() => {}}>
          <motion.div
            className="ach-popup coin-onboard"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          >
            <div className="ach-popup-title">🎉 Вам начислено!</div>
            <div className="coin-onboard-total">
              <img src={coinImg} className="coin-icon" alt="🪙" />
              <span>{coinsOnboard.total}</span>
            </div>
            <div className="coin-onboard-list">
              <div className="coin-onboard-row"><span>🏆 Ачивки ({coinsOnboard.achCount})</span><span>+{coinsOnboard.achSum}</span></div>
              {coinsOnboard.bonus > 0 && (
                <div className="coin-onboard-row"><span>👑 Бонус старожила</span><span>+{coinsOnboard.bonus}</span></div>
              )}
            </div>
            <p className="coin-onboard-hint">Трать на редкие скины 🎨<br />...или копи 👀</p>
            <button className="btn-gold" onClick={() => { markCoinsOnboarded(); setCoinsOnboard(null) }}>
              Забрать
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default App