import { useState } from 'react'
import { getTelegramUser, searchUser } from './api'

// Бесплатные аватарки (картинки без фона)
import avKing from './assets/avatars/free/king.png'
import avGym from './assets/avatars/free/gym.png'
import avCool from './assets/avatars/free/cool.png'
import avGamer from './assets/avatars/free/gamer.png'
import avZen from './assets/avatars/free/zen.png'

// Премиум аватарки (картинки с цветным фоном)
import avChad from './assets/avatars/premium/chad.jpg'
import avNeo from './assets/avatars/premium/neo.jpg'
import avRap from './assets/avatars/premium/rap.jpg'
import av67 from './assets/avatars/premium/s67.jpg'
import avLux from './assets/avatars/premium/lux.jpg'

// Список бесплатных: id + картинка
const FREE_AVATARS = [
  { id: 'king', img: avKing },
  { id: 'gym', img: avGym },
  { id: 'cool', img: avCool },
  { id: 'gamer', img: avGamer },
  { id: 'zen', img: avZen },
]

// Список премиум: id + картинка + цена в звёздах
const PREMIUM_AVATARS = [
  { id: 'chad', img: avChad, price: 199 },
  { id: 's67', img: av67, price: 499 },
  { id: 'lux', img: avLux, price: 999 },
]

// Карта id -> картинка (для показа выбранной авы в шапке)
const AVATAR_MAP: Record<string, string> = {
  king: avKing, gym: avGym, cool: avCool, gamer: avGamer, zen: avZen,
  chad: avChad, neo: avNeo, rap: avRap, s67: av67, lux: avLux,
}

// Проверка ника: латиница, цифры, _ ; без пробелов и спецсимволов; 3-20 символов
function validateNick(nick: string): string {
  if (nick.length < 3) return 'Минимум 3 символа'
  if (nick.length > 20) return 'Максимум 20 символов'
  if (!/^[a-zA-Z0-9_]+$/.test(nick)) return 'Только латиница, цифры и _'
  return '' // пусто = всё ок
}

function Profile({ onClearHistory }: { onClearHistory: () => void }) {
  // Имя: сначала из Telegram (username или имя), иначе из памяти
  const tgUser = getTelegramUser()
  const [nick, setNick] = useState(() => {
    if (tgUser?.username) return tgUser.username
    if (tgUser?.firstName) return tgUser.firstName
    return localStorage.getItem('throne_nick') || 'throne_user'
  })

  // Аватар хранит id (king/gym/...). Старые эмодзи-авы -> откат на короля
  const [avatar, setAvatar] = useState(() => {
    const saved = localStorage.getItem('throne_avatar') || 'king'
    return AVATAR_MAP[saved] ? saved : 'king'
  })

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(nick)
  const [error, setError] = useState('')

  // Поиск друзей
  const [searchNick, setSearchNick] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)

  const doSearch = async () => {
    if (!searchNick.trim()) return
    const results = await searchUser(searchNick.trim())
    setSearchResults(Array.isArray(results) ? results : [])
    setSearched(true)
  }

  const saveNick = () => {
    const err = validateNick(draft)
    if (err) {
      setError(err)
      return
    }
    setNick(draft)
    localStorage.setItem('throne_nick', draft)
    setError('')
    setEditing(false)
  }

  const chooseAvatar = (id: string) => {
    setAvatar(id)
    localStorage.setItem('throne_avatar', id)
  }

  const buyPremium = (price: number) => {
    // Оплата через Telegram Stars появится позже
    window.alert(`Премиум-аватар за ${price} ⭐\n\nПокупка за звёзды скоро появится 👑`)
  }

  const confirmClear = () => {
    if (window.confirm('Удалить всю историю и достижения? Это нельзя отменить.')) {
      onClearHistory()
    }
  }

  return (
    <div className="tab-content profile">
      <h2 className="record-title">Профиль 👤</h2>

      {/* Шапка */}
      <div className="profile-avatar">
        <img src={AVATAR_MAP[avatar]} className="profile-avatar-img" alt="аватар" />
      </div>
      {!editing ? (
        <div className="profile-nick-row">
          <span className="profile-nick">@{nick}</span>
          <button className="nick-edit-btn" onClick={() => { setDraft(nick); setEditing(true) }}>
            ✏️
          </button>
        </div>
      ) : (
        <div className="nick-edit-box">
          <input
            className="nick-input"
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setError('') }}
            placeholder="ник"
            maxLength={20}
          />
          {error && <p className="nick-error">{error}</p>}
          <div className="nick-actions">
            <button className="btn-gold small" onClick={saveNick}>Сохранить</button>
            <button className="back-btn small" onClick={() => { setEditing(false); setError('') }}>Отмена</button>
          </div>
        </div>
      )}

      {/* Обычные аватары */}
      <p className="field-label ach-block-title">Аватар</p>
      <div className="avatar-grid">
        {FREE_AVATARS.map((a) => (
          <button
            key={a.id}
            className={avatar === a.id ? 'avatar-btn active' : 'avatar-btn'}
            onClick={() => chooseAvatar(a.id)}
          >
            <img src={a.img} className="avatar-img" alt={a.id} />
          </button>
        ))}
      </div>

      {/* Премиум аватары */}
      <p className="field-label ach-block-title">Премиум ⭐</p>
      <div className="avatar-grid premium-grid">
        {PREMIUM_AVATARS.map((a) => (
          <div key={a.id} className="premium-cell">
            <button
              className="avatar-btn premium locked"
              onClick={() => buyPremium(a.price)}
            >
              <img src={a.img} className="avatar-img" alt={a.id} />
              <span className="avatar-lock">🔒</span>
            </button>
            <span className="premium-price-label">{a.price} ⭐</span>
          </div>
        ))}
      </div>

      {/* Друзья */}
      <p className="field-label ach-block-title">Друзья</p>
      <div className="friend-search">
        <input
          className="nick-input"
          value={searchNick}
          onChange={(e) => setSearchNick(e.target.value)}
          placeholder="Найти по нику"
          onKeyDown={(e) => { if (e.key === 'Enter') doSearch() }}
        />
        <button className="btn-gold small" onClick={doSearch}>🔍</button>
      </div>

      {searched && searchResults.length === 0 && (
        <p className="subtitle">Никого не нашли 🤷</p>
      )}
      {searchResults.map((u) => {
        const isMe = u.username === (tgUser?.username || '')
        return (
          <div key={u.user_id} className="friend-found">
            <img src={AVATAR_MAP[u.avatar] || AVATAR_MAP['king']} className="friend-avatar" alt="" />
            <span className="friend-name">@{u.username || u.first_name}</span>
            {!isMe && <button className="btn-gold small" onClick={() => window.alert('Добавление в друзья скоро 👥')}>＋</button>}
          </div>
        )
      })}

      <div className="soon-card">
        <span>➕ Пригласить друга</span>
        <span className="soon-badge">скоро</span>
      </div>

      {/* Приватность (заготовка) */}
      <p className="field-label ach-block-title">Приватность</p>
      <div className="soon-card">
        <span>🔒 Приватный аккаунт</span>
        <span className="soon-badge">скоро</span>
      </div>

      {/* Данные */}
      <p className="field-label ach-block-title">Данные</p>
      <button className="danger-btn" onClick={confirmClear}>
        🗑️ Очистить историю
      </button>

      {/* О приложении */}
      <p className="profile-about">На троне · версия 0.1</p>
    </div>
  )
}

export default Profile
