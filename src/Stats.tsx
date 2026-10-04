import { useState, useEffect } from 'react'
import { t, MONTHS, WEEKDAYS, TIMES } from './i18n'
import { motion } from 'framer-motion'
import { loadLeaderboardBalanceFriends, loadUserStats, loadDaily, loadTapState } from './api'


// Число прокручивается от 0 до value
function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const duration = 800
    const startTime = performance.now()
    let raf: number
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{display.toFixed(decimals)}</>
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

// Цвет клетки по средней оценке дня
function dayColor(sessions: Session[]) {
  const rated = sessions.filter((s) => s.rating > 0)
  if (rated.length === 0) return 'day-gray' // только осечки/без оценки
  const avg = rated.reduce((sum, s) => sum + s.rating, 0) / rated.length
  if (avg >= 7) return 'day-green'
  if (avg >= 4) return 'day-yellow'
  return 'day-red'
}

function Stats({ history }: { history: Session[] }) {
  const [view, setView] = useState('numbers')

  // Рейтинг

  const [lbData, setLbData] = useState<any[]>([])
  const [lbLoading, setLbLoading] = useState(false)
  const [viewUser, setViewUser] = useState<any | null>(null)

  const openUserStats = async (u: any) => {
    setViewUser({ loading: true, base: u })
    const data = await loadUserStats(u.user_id)
    setViewUser({ loading: false, base: u, stats: data })
  }

  // Мой user_id (чтобы подсветить себя)
  const myId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id
    ? 'tg_' + (window as any).Telegram.WebApp.initDataUnsafe.user.id
    : (localStorage.getItem('throne_nick') || 'throne_user')

  // Daily-стрик заходов + награда за завтра
  const [dailyStreak, setDailyStreak] = useState(0)
  const [nextReward, setNextReward] = useState(100)
  useEffect(() => {
    loadTapState().then((ts: any) => {
      setDailyStreak(ts.dailyStreak || 0)
      setNextReward(ts.nextReward || 100)
    })
  }, [])

  // Заработок KAKA по дням: ключ 'YYYY-M-D' (month 0-based под календарь)
  const [earnByDay, setEarnByDay] = useState<Record<string, number>>({})
  useEffect(() => {
    loadDaily().then((rows: any[]) => {
      const map: Record<string, number> = {}
      ;(Array.isArray(rows) ? rows : []).forEach((r) => {
        const [y, m, d] = r.day.split('-').map((x: string) => parseInt(x, 10))
        map[`${y}-${m - 1}-${d}`] = r.earned
      })
      setEarnByDay(map)
    })
  }, [])

  useEffect(() => {
    if (view !== 'rating') return
    setLbLoading(true)
    loadLeaderboardBalanceFriends().then((data) => {
      setLbData(Array.isArray(data) ? data : [])
      setLbLoading(false)
    })
  }, [view])
  // Какой месяц показываем в календаре
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  // Выбранный день (для показа деталей снизу)
  const [selectedDay, setSelectedDay] = useState<string | null>(() => {
    const t = new Date()
    return `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`
  })

  const total = history.length

  const rated = history.filter((s) => s.rating > 0)
  const avgRating =
    rated.length > 0
      ? (rated.reduce((sum, s) => sum + s.rating, 0) / rated.length).toFixed(1)
      : '—'

  const totalSheets = history.reduce((sum, s) => sum + (s.noPaper ? 0 : s.sheets), 0)

  const consCount: Record<string, number> = {}
  history.forEach((s) => {
    if (s.consistency) consCount[s.consistency] = (consCount[s.consistency] || 0) + 1
  })
  let topCons = '—'
  let topConsN = 0
  for (const key in consCount) {
    if (consCount[key] > topConsN) {
      topConsN = consCount[key]
      topCons = key
    }
  }

  const timeCounts = [0, 0, 0, 0]  // утро, день, вечер, ночь
  history.forEach((s) => {
    const hour = new Date(s.id).getHours()
    if (hour >= 5 && hour < 12) timeCounts[0]++
    else if (hour >= 12 && hour < 18) timeCounts[1]++
    else if (hour >= 18 && hour < 23) timeCounts[2]++
    else timeCounts[3]++
  })
  let topTimeIdx = -1
  let topTimeN = 0
  timeCounts.forEach((c, i) => { if (c > topTimeN) { topTimeN = c; topTimeIdx = i } })
  const topTime = topTimeIdx >= 0 ? TIMES()[topTimeIdx] : '—' 

  // ===== Данные для календаря =====
  const year = calMonth.getFullYear()
  const month = calMonth.getMonth()
  const monthNames = MONTHS()

  // Группируем сеансы по дню
  const byDay: Record<string, Session[]> = {}
  history.forEach((s) => {
    const d = new Date(s.id)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!byDay[key]) byDay[key] = []
    byDay[key].push(s)
  })

  // Сколько пустых клеток в начале (неделя с понедельника)
  let firstWeekday = new Date(year, month, 1).getDay() // 0=вс
  firstWeekday = firstWeekday === 0 ? 6 : firstWeekday - 1 // делаем пн=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const todayKey = (() => {
    const t = new Date()
    return `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`
  })()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const prevMonth = () => {
    setSelectedDay(null)
    setCalMonth(new Date(year, month - 1, 1))
  }
  const nextMonth = () => {
    setSelectedDay(null)
    setCalMonth(new Date(year, month + 1, 1))
  }

  const selectedSessions = selectedDay ? byDay[selectedDay] || [] : []

  return (
    <div className="tab-content">
      <h2 className="record-title">{t('stats.titleFull')}</h2>

      <div className="seg">
        <button className={view === 'numbers' ? 'seg-btn active' : 'seg-btn'} onClick={() => setView('numbers')}>{t('stats.numbers')}</button>
        <button className={view === 'calendar' ? 'seg-btn active' : 'seg-btn'} onClick={() => setView('calendar')}>{t('stats.calendar')}</button>
        <button className={view === 'rating' ? 'seg-btn active seg-rating' : 'seg-btn seg-rating'} onClick={() => setView('rating')}>{t('stats.rating')}</button>
      </div>

      {/* ВИД: ЦИФРЫ */}
      {view === 'numbers' && (
        <>
          {total === 0 && <p className="subtitle">{t('stats.noDataYet')}</p>}
          {total > 0 && (
            <div className="stats-grid">
              <motion.div
                className="stat-card stat-wide streak-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="streak-left">
                  <motion.span
                    className="streak-fire-big"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                  >🔥</motion.span>
                  <div className="streak-num-wrap">
                    <span className="streak-num-big">{dailyStreak}</span>
                    <span className="streak-days-lab">{t('stats.streakDays')}</span>
                  </div>
                </div>
                <div className="streak-next">
                  {t('stats.streakTomorrow')} <span className="grn">+{nextReward} $KAKA</span>
                </div>
              </motion.div>
              {[
                { v: <>📊 <CountUp value={total} /></>, l: t('stats.totalVisits'), wide: false },
                { v: <>⭐ {avgRating === '—' ? '—' : <CountUp value={Number(avgRating)} decimals={1} />}</>, l: t('stats.avgScore'), wide: false },
                { v: <>🧻 <CountUp value={totalSheets} /></>, l: t('stats.totalSheets'), wide: false },
                { v: <>💩 {topCons}</>, l: t('stats.mostOften'), wide: false },
                { v: <>{topTime}</>, l: t('stats.favTime'), wide: true },
              ].map((c, i) => (
                <motion.div
                  key={i}
                  className={c.wide ? 'stat-card stat-wide' : 'stat-card'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
                >
                  <div className="stat-value">{c.v}</div>
                  <div className="stat-label">{c.l}</div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ВИД: КАЛЕНДАРЬ */}
      {view === 'calendar' && (
        <div className="calendar">
          <div className="cal-head">
            <button className="cal-arrow" onClick={prevMonth}>◀</button>
            <span className="cal-title">{monthNames[month]} {year}</span>
            <button className="cal-arrow" onClick={nextMonth}>▶</button>
          </div>

          <div className="cal-weekdays">
            {WEEKDAYS().map((w) => (
              <div key={w} className="cal-wd">{w}</div>
            ))}
          </div>

          <div className="cal-grid">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} className="cal-cell empty" />
              const key = `${year}-${month}-${d}`
              const sessions = byDay[key] || []
              const has = sessions.length > 0
              const colorClass = has ? dayColor(sessions) : ''
              const isToday = key === todayKey
              return (
                <motion.button
                  key={i}
                  className={`cal-cell ${colorClass} ${isToday ? 'today' : ''} ${has ? 'clickable' : ''}`}
                  onClick={() => has && setSelectedDay(key)}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.015, 0.4), duration: 0.25 }}
                >
                  <span className="cal-daynum">{d}</span>
                  {has && (
                    <span className="cal-poop">
                      💩{sessions.length > 1 ? `×${sessions.length}` : ''}
                    </span>
                  )}
                  {earnByDay[key] > 0 && (
                    <span className="cal-earn">+{earnByDay[key] >= 1000 ? (earnByDay[key] / 1000).toFixed(1) + 'k' : earnByDay[key]}</span>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Легенда */}
          <div className="cal-legend">
            <span><span className="dot green" /> хорошо</span>
            <span><span className="dot yellow" /> средне</span>
            <span><span className="dot red" /> плохо</span>
          </div>

          {/* Детали выбранного дня */}
          {selectedDay && (
            <div className="cal-details">
              <p className="field-label">{t('stats.dayVisits')}</p>
              <div className="history-list">
                {selectedSessions.map((s) => (
                  <div key={s.id} className="history-card">
                    <div className="history-top">
                      <span className="history-rating">{s.rating > 0 ? `${s.rating}/10` : '—'}</span>
                      <span className="history-date">{s.date}</span>
                    </div>
                    <div className="history-tags">
                      {s.amount && <span className="tag">{s.amount}</span>}
                      {s.consistency && <span className="tag">{s.consistency}</span>}
                      <span className="tag">{s.noPaper ? t('rec.noPaper') : `🧻 ${s.sheets}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}



      {/* ВИД: РЕЙТИНГ */}
      {view === 'rating' && (
        <div className="lb">


          <p className="lb-hint">
            {t('stats.lbBalance')}
          </p>

          {lbLoading ? (
            <p className="subtitle">{t('common.loading')}</p>
          ) : lbData.length === 0 ? (
            <p className="subtitle">
              {t('stats.lbEmpty')}
            </p>
          ) : (
            <div className="lb-list">
              {lbData.map((u, i) => {
                const isMe = u.user_id === myId
                const name = u.username || u.first_name || t('stats.anon')
                const value = u.count
                const unit = ' $KAKA'
                return (
                  <motion.div key={u.user_id} className={isMe ? 'lb-row me' : 'lb-row'}
                    onClick={() => { if (!isMe) openUserStats(u) }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5), duration: 0.3 }}>
                    <span className="lb-rank">{i + 1}</span>
                    <span className="lb-name">{name}{isMe ? ' ' + t('stats.you') : ''}</span>
                    <span className="lb-value">{value}{unit}</span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {viewUser && (
        <div className="ach-popup-overlay" onClick={() => setViewUser(null)}>
          <div className="ach-popup" onClick={(e) => e.stopPropagation()}>
            <button className="ach-close-btn" onClick={() => setViewUser(null)}>✕</button>
            <div className="ach-popup-title">@{viewUser.base.username || viewUser.base.first_name}</div>
            {viewUser.loading ? (
              <p className="subtitle">{t('common.loading')}</p>
            ) : viewUser.stats?.ok ? (
              <div className="stats-grid" style={{ marginTop: 12 }}>
                <div className="stat-card"><div className="stat-value">📊 {viewUser.stats.total}</div><div className="stat-label">{t('stats.total')}</div></div>
                <div className="stat-card"><div className="stat-value">⭐ {viewUser.stats.avg}</div><div className="stat-label">{t('stats.avg')}</div></div>
                <div className="stat-card"><div className="stat-value">🧻 {viewUser.stats.totalSheets}</div><div className="stat-label">{t('stats.sheets')}</div></div>
                <div className="stat-card"><div className="stat-value">🔥 {viewUser.stats.bestStreak}</div><div className="stat-label">{t('stats.bestStreak')}</div></div>
              </div>
            ) : (
              <p className="subtitle">{t('profile.noData')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Stats