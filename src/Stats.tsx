import { useState, useEffect } from 'react'
import { loadLeaderboardWeek, loadLeaderboardMonth } from './api'

// Карта аватарок (те же, что в профиле)
import avKing from './assets/avatars/free/king.png'
import avGym from './assets/avatars/free/gym.png'
import avCool from './assets/avatars/free/cool.png'
import avGamer from './assets/avatars/free/gamer.png'
import avZen from './assets/avatars/free/zen.png'
import avChad from './assets/avatars/premium/chad.jpg'
import av67 from './assets/avatars/premium/s67.jpg'
import avLux from './assets/avatars/premium/lux.jpg'

const LB_AVATARS: Record<string, string> = {
  king: avKing, gym: avGym, cool: avCool, gamer: avGamer, zen: avZen,
  chad: avChad, s67: av67, lux: avLux,
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
  const [lbPeriod, setLbPeriod] = useState<'week' | 'month'>('week')
  const [lbScope, setLbScope] = useState<'global' | 'friends'>('global')
  const [lbData, setLbData] = useState<any[]>([])
  const [lbLoading, setLbLoading] = useState(false)

  // Мой user_id (чтобы подсветить себя)
  const myId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id
    ? 'tg_' + (window as any).Telegram.WebApp.initDataUnsafe.user.id
    : (localStorage.getItem('throne_nick') || 'throne_user')

  useEffect(() => {
    if (view !== 'rating') return
    setLbLoading(true)
    const loader = lbPeriod === 'week' ? loadLeaderboardWeek : loadLeaderboardMonth
    loader().then((data) => {
      setLbData(Array.isArray(data) ? data : [])
      setLbLoading(false)
    })
  }, [view, lbPeriod])
  // Какой месяц показываем в календаре
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  // Выбранный день (для показа деталей снизу)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

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

  const times = { 'Утро 🌅': 0, 'День ☀️': 0, 'Вечер 🌆': 0, 'Ночь 🌙': 0 }
  history.forEach((s) => {
    const hour = new Date(s.id).getHours()
    if (hour >= 5 && hour < 12) times['Утро 🌅']++
    else if (hour >= 12 && hour < 18) times['День ☀️']++
    else if (hour >= 18 && hour < 23) times['Вечер 🌆']++
    else times['Ночь 🌙']++
  })
  let topTime = '—'
  let topTimeN = 0
  for (const key in times) {
    if (times[key as keyof typeof times] > topTimeN) {
      topTimeN = times[key as keyof typeof times]
      topTime = key
    }
  }

  // ===== Данные для календаря =====
  const year = calMonth.getFullYear()
  const month = calMonth.getMonth()
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ]

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
      <h2 className="record-title">Статистика 📊</h2>

      <div className="seg">
        <button className={view === 'numbers' ? 'seg-btn active' : 'seg-btn'} onClick={() => setView('numbers')}>Цифры</button>
        <button className={view === 'calendar' ? 'seg-btn active' : 'seg-btn'} onClick={() => setView('calendar')}>Календарь</button>
        <button className={view === 'list' ? 'seg-btn active' : 'seg-btn'} onClick={() => setView('list')}>История</button>
        <button className={view === 'rating' ? 'seg-btn active' : 'seg-btn'} onClick={() => setView('rating')}>🏆</button>
      </div>

      {/* ВИД: ЦИФРЫ */}
      {view === 'numbers' && (
        <>
          {total === 0 && <p className="subtitle">Пока нет данных. Запиши первый сеанс!</p>}
          {total > 0 && (
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-value">📊 {total}</div><div className="stat-label">всего сеансов</div></div>
              <div className="stat-card"><div className="stat-value">⭐ {avgRating}</div><div className="stat-label">средняя оценка</div></div>
              <div className="stat-card"><div className="stat-value">🧻 {totalSheets}</div><div className="stat-label">листов всего</div></div>
              <div className="stat-card"><div className="stat-value">💩 {topCons}</div><div className="stat-label">чаще всего</div></div>
              <div className="stat-card stat-wide"><div className="stat-value">{topTime}</div><div className="stat-label">любимое время</div></div>
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
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((w) => (
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
                <button
                  key={i}
                  className={`cal-cell ${colorClass} ${isToday ? 'today' : ''} ${has ? 'clickable' : ''}`}
                  onClick={() => has && setSelectedDay(key)}
                >
                  <span className="cal-daynum">{d}</span>
                  {has && (
                    <span className="cal-poop">
                      💩{sessions.length > 1 ? `×${sessions.length}` : ''}
                    </span>
                  )}
                </button>
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
              <p className="field-label">Сеансы за день</p>
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
                      <span className="tag">{s.noPaper ? 'Без бумаги' : `🧻 ${s.sheets}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ВИД: ИСТОРИЯ */}
      {view === 'list' && (
        <>
          {total === 0 && <p className="subtitle">Пока пусто. Запиши первый сеанс!</p>}
          <div className="history-list">
            {history.map((s) => (
              <div key={s.id} className="history-card">
                <div className="history-top">
                  <span className="history-rating">{s.rating > 0 ? `${s.rating}/10` : '—'}</span>
                  <span className="history-date">{s.date}</span>
                </div>
                <div className="history-tags">
                  {s.amount && <span className="tag">{s.amount}</span>}
                  {s.consistency && <span className="tag">{s.consistency}</span>}
                  <span className="tag">{s.noPaper ? 'Без бумаги' : `🧻 ${s.sheets}`}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ВИД: РЕЙТИНГ */}
      {view === 'rating' && (
        <div className="lb">
          <div className="seg lb-seg">
            <button className={lbPeriod === 'week' ? 'seg-btn active' : 'seg-btn'} onClick={() => setLbPeriod('week')}>Неделя</button>
            <button className={lbPeriod === 'month' ? 'seg-btn active' : 'seg-btn'} onClick={() => setLbPeriod('month')}>Месяц</button>
          </div>
          <div className="seg lb-seg">
            <button className={lbScope === 'global' ? 'seg-btn active' : 'seg-btn'} onClick={() => setLbScope('global')}>Глобально</button>
            <button className={lbScope === 'friends' ? 'seg-btn active' : 'seg-btn'} onClick={() => setLbScope('friends')}>Друзья</button>
          </div>

          <p className="lb-hint">
            {lbPeriod === 'week' ? 'Сеансов за неделю' : 'Лучший стрик за месяц'}
          </p>

          {lbScope === 'friends' ? (
            <p className="subtitle">Друзья скоро появятся 👥</p>
          ) : lbLoading ? (
            <p className="subtitle">Загрузка…</p>
          ) : lbData.length === 0 ? (
            <p className="subtitle">Пока пусто. Будь первым! 👑</p>
          ) : (
            <div className="lb-list">
              {lbData.map((u, i) => {
                const isMe = u.user_id === myId
                const name = u.username || u.first_name || 'Аноним'
                const value = lbPeriod === 'week' ? u.count : u.streak
                const unit = lbPeriod === 'week' ? '' : ' дн.'
                return (
                  <div key={u.user_id} className={isMe ? 'lb-row me' : 'lb-row'}>
                    <span className="lb-rank">{i + 1}</span>
                    <img src={LB_AVATARS[u.avatar] || avKing} className="lb-avatar" alt="" />
                    <span className="lb-name">{name}{isMe ? ' (ты)' : ''}</span>
                    <span className="lb-value">{value}{unit}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Stats