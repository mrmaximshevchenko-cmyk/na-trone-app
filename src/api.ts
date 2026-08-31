// Адрес нашего сервера
export const API_URL = 'https://na-trone-server.onrender.com'

// Пока нет Telegram — используем ник из localStorage как id пользователя
export function getUserId(): string {
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
}