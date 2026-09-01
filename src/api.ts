// Адрес нашего сервера
export const API_URL = 'https://na-trone-server.onrender.com'

// Берём реальный Telegram-id. Если приложение открыто не в Telegram — откат на ник из localStorage (для тестов в браузере)
export function getUserId(): string {
  const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user
  if (tgUser?.id) {
    return 'tg_' + tgUser.id
  }
  return localStorage.getItem('throne_nick') || 'throne_user'
}

// Сохранить сеанс на сервер
export async function saveSessionToServer(session: {
  id: number
  rating: number
  amount: string
  consistency: string
  sheets: number
  noPaper: boolean
}) {
  console.log('🚀 Отправляю сеанс на сервер...', API_URL)
  try {
    const res = await fetch(`${API_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: session.id,
        user_id: getUserId(),
        rating: session.rating,
        amount: session.amount,
        consistency: session.consistency,
        sheets: session.sheets,
        no_paper: session.noPaper,
      }),
    })
    const data = await res.json()
    console.log('✅ Ответ сервера:', data)
  } catch (err) {
    console.log('❌ Ошибка отправки на сервер:', err)
  }
}

// Загрузить историю с сервера
export async function loadSessionsFromServer() {
  try {
    const res = await fetch(`${API_URL}/sessions/${getUserId()}`)
    const rows = await res.json()
    // Приводим формат базы к формату приложения
    return rows.map((r: any) => ({
      id: Number(r.id),
      date: new Date(Number(r.id)).toLocaleString('ru-RU', {
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
      }),
      rating: r.rating,
      amount: r.amount,
      consistency: r.consistency,
      sheets: r.sheets,
      noPaper: r.no_paper,
    }))
  } catch (err) {
    console.log('Не удалось загрузить с сервера:', err)
    return null
  }
}// Данные пользователя из Telegram (имя, username). null если не в Telegram
export function getTelegramUser() {
  const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user
  if (!tgUser) return null
  return {
    id: tgUser.id,
    username: tgUser.username || '',
    firstName: tgUser.first_name || '',
    lastName: tgUser.last_name || '',
  }
}// Регистрируем/обновляем пользователя на сервере (при входе)
export async function registerUser() {
  const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user
  const user_id = getUserId()
  const username = tgUser?.username || ''
  const first_name = tgUser?.first_name || ''
  const avatar = localStorage.getItem('throne_avatar') || 'king'
  try {
    await fetch(`${API_URL}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, username, first_name, avatar }),
    })
  } catch (err) {
    console.log('Не удалось зарегистрировать юзера:', err)
  }
}// Загрузить недельный рейтинг (по сеансам)
export async function loadLeaderboardWeek() {
  try {
    const res = await fetch(`${API_URL}/leaderboard/week`)
    return await res.json()
  } catch (err) {
    console.log('Ошибка загрузки рейтинга (неделя):', err)
    return []
  }
}

// Загрузить месячный рейтинг (по стрикам)
export async function loadLeaderboardMonth() {
  try {
    const res = await fetch(`${API_URL}/leaderboard/month`)
    return await res.json()
  } catch (err) {
    console.log('Ошибка загрузки рейтинга (месяц):', err)
    return []
  }
}// Поиск юзера по нику
export async function searchUser(nick: string) {
  try {
    const res = await fetch(`${API_URL}/search/${encodeURIComponent(nick)}`)
    return await res.json()
  } catch (err) {
    console.log('Ошибка поиска:', err)
    return []
  }
}// Добавить в друзья
export async function followUser(target: string) {
  try {
    await fetch(`${API_URL}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ me: getUserId(), target }),
    })
  } catch (err) { console.log('Ошибка follow:', err) }
}

// Удалить из друзей
export async function unfollowUser(target: string) {
  try {
    await fetch(`${API_URL}/unfollow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ me: getUserId(), target }),
    })
  } catch (err) { console.log('Ошибка unfollow:', err) }
}

// Список друзей
export async function loadFriends() {
  try {
    const res = await fetch(`${API_URL}/friends/${getUserId()}`)
    return await res.json()
  } catch (err) {
    console.log('Ошибка загрузки друзей:', err)
    return []
  }
}// Рейтинг среди друзей
export async function loadLeaderboardWeekFriends() {
  try {
    const res = await fetch(`${API_URL}/leaderboard/week/friends/${getUserId()}`)
    return await res.json()
  } catch (err) { console.log('Ошибка (друзья, неделя):', err); return [] }
}
export async function loadLeaderboardMonthFriends() {
  try {
    const res = await fetch(`${API_URL}/leaderboard/month/friends/${getUserId()}`)
    return await res.json()
  } catch (err) { console.log('Ошибка (друзья, месяц):', err); return [] }
}// Принять инвайт — стать взаимными друзьями с пригласившим
export async function acceptInvite(inviterId: string) {
  try {
    await fetch(`${API_URL}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ me: getUserId(), target: inviterId }),
    })
  } catch (err) { console.log('Ошибка инвайта:', err) }
}// Статистика конкретного юзера (чужой профиль)
export async function loadUserStats(userId: string) {
  try {
    const res = await fetch(`${API_URL}/stats/${userId}`)
    return await res.json()
  } catch (err) {
    console.log('Ошибка загрузки чужой статы:', err)
    return { ok: false }
  }
}// Переключить приватность
export async function setPrivacy(isPrivate: boolean) {
  try {
    await fetch(`${API_URL}/privacy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: getUserId(), is_private: isPrivate }),
    })
  } catch (err) { console.log('Ошибка приватности:', err) }
}// Отправить картинку ачивки через бота (Путь Б)
export async function shareAchievementImage(achId: string, achName: string) {
  const chatId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id
  if (!chatId) {
    console.log('Нет chat_id (не в Telegram)')
    return false
  }
  try {
    await fetch(`${API_URL}/share-achievement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, ach_id: achId, ach_name: achName }),
    })
    return true
  } catch (err) {
    console.log('Ошибка шаринга картинки:', err)
    return false
  }
}