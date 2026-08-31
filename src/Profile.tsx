import { useState } from 'react'
import { getTelegramUser } from './api'

const AVATARS = ['💩', '👑', '🚽', '🧻', '🦠', '🍑', '💎', '🔥', '🌟', '🎯']

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
  const [avatar, setAvatar] = useState(() => localStorage.getItem('throne_avatar') || '💩')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(nick)
  const [error, setError] = useState('')

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

  const chooseAvatar = (a: string) => {
    setAvatar(a)
    localStorage.setItem('throne_avatar', a)
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
      <div className="profile-avatar">{avatar}</div>
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

      {/* Выбор аватара */}
      <p className="field-label ach-block-title">Аватар</p>
      <div className="avatar-grid">
        {AVATARS.map((a) => (
          <button
            key={a}
            className={avatar === a ? 'avatar-btn active' : 'avatar-btn'}
            onClick={() => chooseAvatar(a)}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Друзья (заготовка) */}
      <p className="field-label ach-block-title">Друзья</p>
      <div className="soon-card">
        <span>🔍 Найти друзей по нику</span>
        <span className="soon-badge">скоро</span>
      </div>
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
      <p className="profile-about" style={{ fontSize: '11px', opacity: 0.6 }}>
        DEBUG: TG = {(window as any).Telegram?.WebApp ? 'ЕСТЬ' : 'НЕТ'} ·
        user = {JSON.stringify((window as any).Telegram?.WebApp?.initDataUnsafe?.user || 'пусто')}
      </p>
    </div>
  )
}

export default Profile