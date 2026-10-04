import { t } from './i18n'
// Тип сессии (такой же, как в App.tsx)
export type Session = {
  id: number
  date: string
  rating: number
  amount: string
  consistency: string
  sheets: number
  noPaper: boolean
}

// Описание одной ачивки
export type Achievement = {
  id: string          // уникальный код
  emoji: string
  name: () => string
  condition: () => string   // геттеры (зависят от языка)
  secret: boolean     // секретная?
  wave: number        // волна (для будущих "сундуков")
  coins: number       // награда в какакоинах
  check: (history: Session[]) => boolean  // проверка по всей истории
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

// Ключ дня из времени сессии
function dayKey(ms: number) {
  const d = new Date(ms)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// Группируем по дням: сколько сессий в каждый день
function sessionsByDay(history: Session[]): Record<string, Session[]> {
  const map: Record<string, Session[]> = {}
  history.forEach((s) => {
    const k = dayKey(s.id)
    if (!map[k]) map[k] = []
    map[k].push(s)
  })
  return map
}

// Максимум сессий за один день
function maxPerDay(history: Session[]): number {
  const byDay = sessionsByDay(history)
  let max = 0
  for (const k in byDay) if (byDay[k].length > max) max = byDay[k].length
  return max
}

// Текущий стрик (дней подряд)
function calcStreak(history: Session[]): number {
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

// История отсортирована по возрастанию времени (старые -> новые)
function chrono(history: Session[]): Session[] {
  return [...history].sort((a, b) => a.id - b.id)
}

// Есть ли N одинаковых подряд по условию
function hasStreakOf(history: Session[], n: number, test: (s: Session) => boolean): boolean {
  const arr = chrono(history)
  let count = 0
  for (const s of arr) {
    if (test(s)) {
      count++
      if (count >= n) return true
    } else {
      count = 0
    }
  }
  return false
}

// Час сессии
function hourOf(s: Session): number {
  return new Date(s.id).getHours()
}

// Есть ли сессия в каждом из 4 времён суток за всю историю
function hasAllDayparts(history: Session[]): boolean {
  let morning = false, day = false, evening = false, night = false
  history.forEach((s) => {
    const h = hourOf(s)
    if (h >= 5 && h < 12) morning = true
    else if (h >= 12 && h < 18) day = true
    else if (h >= 18 && h < 23) evening = true
    else night = true
  })
  return morning && day && evening && night
}

// ===== СПИСОК АЧИВОК =====

export const ACHIEVEMENTS: Achievement[] = [
  // ---------- ВОЛНА 1: ВИДИМЫЕ ----------
  { id: 'first', emoji: '🚽', name: () => t('ach.first.name'), condition: () => t('ach.first.cond'), secret: false, wave: 1, coins: 50,
    check: (h) => h.length >= 1 },
  { id: 'five', emoji: '🖐️', name: () => t('ach.five.name'), condition: () => t('ach.five.cond'), secret: false, wave: 1, coins: 50,
    check: (h) => h.length >= 5 },
  { id: 'ten', emoji: '🔟', name: () => t('ach.ten.name'), condition: () => t('ach.ten.cond'), secret: false, wave: 1, coins: 100,
    check: (h) => h.length >= 10 },
  { id: 'hundred', emoji: '💯', name: () => t('ach.hundred.name'), condition: () => t('ach.hundred.cond'), secret: false, wave: 1, coins: 200,
    check: (h) => h.length >= 100 },
  { id: 'perfect', emoji: '💎', name: () => t('ach.perfect.name'), condition: () => t('ach.perfect.cond'), secret: false, wave: 1, coins: 200,
    check: (h) => h.some((s) => s.rating === 10 && s.consistency === 'Колбаска') },
  { id: 'paperking', emoji: '👑', name: () => t('ach.paperking.name'), condition: () => t('ach.paperking.cond'), secret: false, wave: 1, coins: 100,
    check: (h) => h.some((s) => !s.noPaper && s.sheets > 10) },
  { id: 'ecoguard', emoji: '🌿', name: () => t('ach.ecoguard.name'), condition: () => t('ach.ecoguard.cond'), secret: false, wave: 1, coins: 100,
    check: (h) => h.some((s) => !s.noPaper && s.sheets > 0 && s.sheets <= 2) },
  { id: 'survival', emoji: '🏜️', name: () => t('ach.survival.name'), condition: () => t('ach.survival.cond'), secret: false, wave: 1, coins: 100,
    check: (h) => h.some((s) => !s.noPaper && s.sheets === 1) },
  { id: 'aqua', emoji: '🧴', name: () => t('ach.aqua.name'), condition: () => t('ach.aqua.cond'), secret: false, wave: 1, coins: 50,
    check: (h) => h.some((s) => s.noPaper) },
  { id: 'earlybird', emoji: '🌅', name: () => t('ach.earlybird.name'), condition: () => t('ach.earlybird.cond'), secret: false, wave: 1, coins: 50,
    check: (h) => h.some((s) => hourOf(s) >= 5 && hourOf(s) < 7) },
  { id: 'midnight', emoji: '🌙', name: () => t('ach.midnight.name'), condition: () => t('ach.midnight.cond'), secret: false, wave: 1, coins: 50,
    check: (h) => h.some((s) => hourOf(s) >= 0 && hourOf(s) < 5) },
  { id: 'double', emoji: '🎳', name: () => t('ach.double.name'), condition: () => t('ach.double.cond'), secret: false, wave: 1, coins: 100,
    check: (h) => maxPerDay(h) >= 2 },
  { id: 'hattrick', emoji: '🎯', name: () => t('ach.hattrick.name'), condition: () => t('ach.hattrick.cond'), secret: false, wave: 1, coins: 200,
    check: (h) => maxPerDay(h) >= 3 },
  { id: 'streak3', emoji: '🔥', name: () => t('ach.streak3.name'), condition: () => t('ach.streak3.cond'), secret: false, wave: 1, coins: 100,
    check: (h) => calcStreak(h) >= 3 },
  { id: 'streak7', emoji: '📅', name: () => t('ach.streak7.name'), condition: () => t('ach.streak7.cond'), secret: false, wave: 1, coins: 200,
    check: (h) => calcStreak(h) >= 7 },
  { id: 'loose', emoji: '🌊', name: () => t('ach.loose.name'), condition: () => t('ach.loose.cond'), secret: false, wave: 1, coins: 50,
    check: (h) => h.some((s) => s.consistency === 'Жидко') },
  { id: 'hard', emoji: '🪨', name: () => t('ach.hard.name'), condition: () => t('ach.hard.cond'), secret: false, wave: 1, coins: 100,
    check: (h) => h.some((s) => s.consistency === 'Сухари') },
  { id: 'sausage10', emoji: '🌭', name: () => t('ach.sausage10.name'), condition: () => t('ach.sausage10.cond'), secret: false, wave: 1, coins: 200,
    check: (h) => h.filter((s) => s.consistency === 'Колбаска').length >= 10 },
  { id: 'spectrum', emoji: '🌈', name: () => t('ach.spectrum.name'), condition: () => t('ach.spectrum.cond'), secret: false, wave: 1, coins: 200,
    check: (h) => ['Жидко', 'Мягко', 'Колбаска', 'Сухари'].every((c) => h.some((s) => s.consistency === c)) },
  { id: 'artillery', emoji: '🎖️', name: () => t('ach.artillery.name'), condition: () => t('ach.artillery.cond'), secret: false, wave: 1, coins: 100,
    check: (h) => h.filter((s) => s.amount === 'Куча').length >= 3 },

  // ---------- ВОЛНА 1: СЕКРЕТНЫЕ ----------
  { id: 'alien', emoji: '👽', name: () => t('ach.alien.name'), condition: () => t('ach.alien.cond'), secret: true, wave: 1, coins: 300,
    check: (h) => h.some((s) => s.rating === 1) },
  { id: 'nightwatch', emoji: '🦉', name: () => t('ach.nightwatch.name'), condition: () => t('ach.nightwatch.cond'), secret: true, wave: 1, coins: 300,
    check: (h) => h.some((s) => hourOf(s) >= 2 && hourOf(s) < 4) },
  { id: 'doomsday', emoji: '💀', name: () => t('ach.doomsday.name'), condition: () => t('ach.doomsday.cond'), secret: true, wave: 1, coins: 500,
    check: (h) => maxPerDay(h) >= 5 },
  { id: 'clean', emoji: '⚡', name: () => t('ach.clean.name'), condition: () => t('ach.clean.cond'), secret: true, wave: 1, coins: 300,
    check: (h) => h.some((s) => s.rating === 10 && s.noPaper) },
  { id: 'rollercoaster', emoji: '🎢', name: () => t('ach.rollercoaster.name'), condition: () => t('ach.rollercoaster.cond'), secret: true, wave: 1, coins: 300,
    check: (h) => {
      const byDay = sessionsByDay(h)
      for (const k in byDay) {
        const r = byDay[k].map((s) => s.rating)
        if (r.includes(10) && r.includes(1)) return true
      }
      return false
    } },
  { id: 'roadworks', emoji: '🚧', name: () => t('ach.roadworks.name'), condition: () => t('ach.roadworks.cond'), secret: true, wave: 1, coins: 300,
    check: (h) => {
      // 3 разных дня подряд, в каждом была осечка
      const byDay = sessionsByDay(h)
      const daysWithMiss = Object.keys(byDay)
        .filter((k) => byDay[k].some((s) => s.amount === 'Осечка'))
        .map((k) => {
          const [y, m, d] = k.split('-').map(Number)
          return new Date(y, m, d).getTime()
        })
        .sort((a, b) => a - b)
      let run = 1
      for (let i = 1; i < daysWithMiss.length; i++) {
        const diff = (daysWithMiss[i] - daysWithMiss[i - 1]) / 86400000
        if (diff === 1) { run++; if (run >= 3) return true } else run = 1
      }
      return false
    } },
  { id: 'jackpot', emoji: '🎰', name: () => t('ach.jackpot.name'), condition: () => t('ach.jackpot.cond'), secret: true, wave: 1, coins: 300,
    check: (h) => h.some((s) => { const d = new Date(s.id); return d.getHours() === 0 && d.getMinutes() < 10 }) },
  { id: 'prophecy', emoji: '🔮', name: () => t('ach.prophecy.name'), condition: () => t('ach.prophecy.cond'), secret: true, wave: 1, coins: 500,
    check: (h) => hasStreakOf(h, 7, (s) => s.rating === 7) },
  { id: 'dragon', emoji: '🐉', name: () => t('ach.dragon.name'), condition: () => t('ach.dragon.cond'), secret: true, wave: 1, coins: 500,
    check: (h) => h.some((s) => s.amount === 'Куча' && !s.noPaper && s.sheets > 10) },
  { id: 'ninja', emoji: '🥷', name: () => t('ach.ninja.name'), condition: () => t('ach.ninja.cond'), secret: true, wave: 1, coins: 300,
    check: (h) => h.filter((s) => s.noPaper).length >= 5 },
  { id: 'blackstreak', emoji: '📉', name: () => t('ach.blackstreak.name'), condition: () => t('ach.blackstreak.cond'), secret: true, wave: 1, coins: 300,
    check: (h) => hasStreakOf(h, 3, (s) => s.rating >= 1 && s.rating <= 3) },
  { id: 'goat', emoji: '🐐', name: () => t('ach.goat.name'), condition: () => t('ach.goat.cond'), secret: true, wave: 1, coins: 500,
    check: (h) => hasStreakOf(h, 10, (s) => s.rating >= 8) },
  { id: 'thirty', emoji: '🌗', name: () => t('ach.thirty.name'), condition: () => t('ach.thirty.cond'), secret: true, wave: 1, coins: 300,
    check: (h) => h.length >= 30 },
  { id: 'timeless', emoji: '♾️', name: () => t('ach.timeless.name'), condition: () => t('ach.timeless.cond'), secret: true, wave: 1, coins: 300,
    check: (h) => hasAllDayparts(h) },
  { id: 'zen', emoji: '🧘', name: () => t('ach.zen.name'), condition: () => t('ach.zen.cond'), secret: true, wave: 1, coins: 500,
    check: (h) => hasStreakOf(h, 3, (s) => s.rating === 10) },
  // "Ты дочитал до конца" — особая, проверяется на экране, не по истории
  { id: 'reader', emoji: '🏁', name: () => t('ach.reader.name'), condition: () => t('ach.reader.cond'), secret: true, wave: 1, coins: 300,
    check: () => false },
]

// Проверяет всю историю и возвращает id всех выполненных ачивок
export function getUnlockedIds(history: Session[]): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(history)).map((a) => a.id)
}