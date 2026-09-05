import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getTelegramUser, searchUser, followUser, unfollowUser, loadFriends, loadUserStats, setPrivacy, setNotify, loadCoins, loadShop, buySkin, selectSkin } from './api'
import coinImg from './assets/coin.png'
import confetti from 'canvas-confetti'

// Русские названия тиров + цвета рамок
const TIER_INFO: Record<string, { name: string; color: string }> = {
  free: { name: 'Обычный', color: '#8a8a8a' },
  common: { name: 'Обычный', color: '#9aa0a6' },
  rare: { name: 'Редкий', color: '#4a90d9' },
  epic: { name: 'Эпический', color: '#a259e6' },
  legendary: { name: 'Легендарный', color: '#E8C87A' },
  mythic: { name: 'Мифический', color: '#e0455e' },
}
const TIER_RANK: Record<string, number> = { free: 0, common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 }

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

  // Друзья
  const [friends, setFriends] = useState<any[]>([])
  const [coins, setCoins] = useState<number>(0)

  // Магазин скинов
  const [shopOpen, setShopOpen] = useState(false)
  const [shop, setShop] = useState<any>({ balance: 0, selected: 'king', owned: [], skins: [] })
  const [previewSkin, setPreviewSkin] = useState<any | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  const refreshShop = () => {
    loadShop().then((data) => {
      setShop(data)
      setCoins(data.balance || 0)
    })
  }

  useEffect(() => {
    loadFriends().then((list) => setFriends(Array.isArray(list) ? list : []))
    loadCoins().then((data) => setCoins(data.balance || 0))
  }, [])

  const openShop = () => { refreshShop(); setShopOpen(true) }

  const doBuy = async (skin: any) => {
    if (skin.price > 500) {
      if (!window.confirm(`Купить за ${skin.price} 🪙?`)) return
    }
    const res = await buySkin(skin.id)
    if (res.ok) {
      const tg = (window as any).Telegram?.WebApp
      tg?.HapticFeedback?.notificationOccurred('success')
      const color = TIER_INFO[skin.tier]?.color || '#E8C87A'
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors: [color, '#FFD700', '#ffffff'] })
      setCoins(res.balance)
      setShop((prev: any) => ({ ...prev, balance: res.balance, owned: [...prev.owned, skin.id] }))
      setPreviewSkin(null)
    } else if (res.error === 'not_enough') {
      window.alert('Не хватает какакоинов 🪙')
    }
  }

  const doSelect = async (skin: any) => {
    await selectSkin(skin.id)
    setShop((prev: any) => ({ ...prev, selected: skin.id }))
    setAvatar(skin.id)
    localStorage.setItem('throne_avatar', skin.id)
    setPreviewSkin(null)
  }

  const isFriend = (userId: string) => friends.some((f) => f.user_id === userId)

  const addFriend = async (u: any) => {
    await followUser(u.user_id)
    setFriends((prev) => [...prev, u])
  }

  const removeFriend = async (userId: string) => {
    await unfollowUser(userId)
    setFriends((prev) => prev.filter((f) => f.user_id !== userId))
  }

    const [viewUser, setViewUser] = useState<any | null>(null)
  const [isPrivate, setIsPrivate] = useState(() => localStorage.getItem('throne_private') === '1')
  const [showPrivacyHelp, setShowPrivacyHelp] = useState(false)

  const togglePrivacy = () => {
    const next = !isPrivate
    setIsPrivate(next)
    localStorage.setItem('throne_private', next ? '1' : '0')
    setPrivacy(next)
  }

  const [notifyOn, setNotifyOn] = useState(() => localStorage.getItem('throne_notify') !== '0')
  const [showNotifyHelp, setShowNotifyHelp] = useState(false)

  const toggleNotify = () => {
    const next = !notifyOn
    setNotifyOn(next)
    localStorage.setItem('throne_notify', next ? '1' : '0')
    setNotify(next)
  }

  const openUserStats = async (u: any) => {
    setViewUser({ loading: true, base: u })
    const data = await loadUserStats(u.user_id)
    setViewUser({ loading: false, base: u, stats: data })
  }
  const inviteFriend = () => {
    const myId = getTelegramUser()?.id
    const ref = myId ? `ref_${myId}` : ''
    const link = `https://t.me/natrone_bot/throne?startapp=${ref}`
    const text = '👑 Го на трон — следи за моими дропами 💩 Кто больше?'
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
    const tg = (window as any).Telegram?.WebApp
    if (tg?.openTelegramLink) tg.openTelegramLink(shareUrl)
    else window.open(shareUrl, '_blank')
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

      {/* Баланс какакоинов */}
      <div className="coin-balance">
        <img src={coinImg} className="coin-icon" alt="какакоин" />
        <span className="coin-amount">{coins}</span>
        <span className="coin-label">какакоинов</span>
      </div>

      {/* Скины */}
      <button className="skins-open-btn" onClick={openShop}>
        🎨 Магазин скинов
      </button>

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
            {isMe ? null : isFriend(u.user_id)
              ? <span className="friend-added">✓</span>
              : <button className="btn-gold small" onClick={() => addFriend(u)}>＋</button>}
          </div>
        )
      })}

      {/* Список друзей */}
      {friends.length > 0 && (
        <>
          <p className="field-label ach-block-title">Мои друзья ({friends.length})</p>
          {friends.map((f) => (
            <div key={f.user_id} className="friend-found">
              <img src={AVATAR_MAP[f.avatar] || AVATAR_MAP['king']} className="friend-avatar" alt=""
                onClick={() => openUserStats(f)} style={{ cursor: 'pointer' }} />
              <span className="friend-name" onClick={() => openUserStats(f)} style={{ cursor: 'pointer' }}>@{f.username || f.first_name}</span>
              <button className="friend-remove" onClick={() => removeFriend(f.user_id)}>✕</button>
            </div>
          ))}
        </>
      )}

      <button className="btn-gold invite-btn" onClick={inviteFriend}>
        ➕ Пригласить друга
      </button>

      {/* Уведомления */}
      <p className="field-label ach-block-title">
        Уведомления
        <button className="help-btn" onClick={() => setShowNotifyHelp(true)}>?</button>
      </p>
      <div className="privacy-row">
        <span>🔔 Уведомления о друзьях</span>
        <button
          className={notifyOn ? 'toggle on' : 'toggle'}
          onClick={toggleNotify}
        >
          <span className="toggle-knob" />
        </button>
      </div>

      {/* Приватность */}
      <p className="field-label ach-block-title">
        Приватность
        <button className="help-btn" onClick={() => setShowPrivacyHelp(true)}>?</button>
      </p>
      <div className="privacy-row">
        <span>🔒 Приватный аккаунт</span>
        <button
          className={isPrivate ? 'toggle on' : 'toggle'}
          onClick={togglePrivacy}
        >
          <span className="toggle-knob" />
        </button>
      </div>

      {/* Данные */}
      <p className="field-label ach-block-title">Данные</p>
      <button className="danger-btn" onClick={confirmClear}>
        🗑️ Очистить историю
      </button>

      {/* О приложении */}
      <p className="profile-about">На троне · версия 0.1</p>
      {shopOpen && (
        <div className="shop-overlay">
          <div className="shop-window">
            <div className="shop-header">
              <span className="shop-title">🎨 Скины</span>
              <div className="shop-balance"><img src={coinImg} className="coin-icon-sm" alt="🪙" />{coins}</div>
              <button className="ach-close-btn" onClick={() => setShopOpen(false)}>✕</button>
            </div>

            <button className="shop-sort" onClick={() => setSortAsc(!sortAsc)}>
              Цена {sortAsc ? '↑' : '↓'}
            </button>

            <div className="shop-grid">
              {[...shop.skins]
                .sort((a: any, b: any) => {
                  // free всегда сверху, потом по цене
                  if (a.tier === 'free' && b.tier !== 'free') return -1
                  if (b.tier === 'free' && a.tier !== 'free') return 1
                  return sortAsc ? a.price - b.price : b.price - a.price
                })
                .map((skin: any) => {
                  const info = TIER_INFO[skin.tier] || TIER_INFO.common
                  const isOwned = skin.tier === 'free' || shop.owned.includes(skin.id)
                  const isSelected = shop.selected === skin.id
                  const canAfford = coins >= skin.price
                  const img = AVATAR_MAP[skin.id] || AVATAR_MAP['king']
                  return (
                    <div key={skin.id} className="shop-cell" onClick={() => setPreviewSkin(skin)}>
                      <div className="shop-skin" style={{ borderColor: info.color, boxShadow: `0 0 10px ${info.color}55` }}>
                        <img src={img} className="shop-skin-img" alt={skin.id} />
                        {isSelected && <span className="shop-selected-badge">✓</span>}
                        {!isOwned && !canAfford && <span className="shop-lock">🔒</span>}
                      </div>
                      {skin.tier === 'free' ? (
                        <span className="shop-price free">Бесплатно</span>
                      ) : isOwned ? (
                        <span className="shop-price owned">Куплено</span>
                      ) : (
                        <span className="shop-price" style={{ color: canAfford ? 'var(--gold)' : '#e0455e' }}>
                          <img src={coinImg} className="coin-icon-xs" alt="🪙" />{skin.price}
                        </span>
                      )}
                    </div>
                  )
                })}
            </div>

            <p className="shop-soon">🔮 Скоро новые скины...</p>
          </div>
        </div>
      )}

      {previewSkin && (
        <div className="ach-popup-overlay" onClick={() => setPreviewSkin(null)}>
          <div className="ach-popup" onClick={(e) => e.stopPropagation()}>
            <button className="ach-close-btn" onClick={() => setPreviewSkin(null)}>✕</button>
            {(() => {
              const info = TIER_INFO[previewSkin.tier] || TIER_INFO.common
              const isOwned = previewSkin.tier === 'free' || shop.owned.includes(previewSkin.id)
              const isSelected = shop.selected === previewSkin.id
              const canAfford = coins >= previewSkin.price
              const img = AVATAR_MAP[previewSkin.id] || AVATAR_MAP['king']
              return (
                <>
                  <div className="preview-skin" style={{ borderColor: info.color, boxShadow: `0 0 24px ${info.color}66` }}>
                    <img src={img} className="preview-skin-img" alt={previewSkin.id} />
                  </div>
                  <div className="preview-tier" style={{ color: info.color }}>{info.name}</div>
                  {isSelected ? (
                    <div className="preview-used">Используется ✓</div>
                  ) : isOwned ? (
                    <button className="btn-gold" onClick={() => doSelect(previewSkin)}>Выбрать</button>
                  ) : previewSkin.tier === 'free' ? (
                    <button className="btn-gold" onClick={() => doSelect(previewSkin)}>Выбрать</button>
                  ) : canAfford ? (
                    <button className="btn-gold" onClick={() => doBuy(previewSkin)}>
                      Купить за {previewSkin.price} 🪙
                    </button>
                  ) : (
                    <button className="btn-gold" disabled style={{ opacity: 0.5 }}>
                      Не хватает {previewSkin.price - coins} 🪙
                    </button>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}
      {showNotifyHelp && (
        <div className="ach-popup-overlay" onClick={() => setShowNotifyHelp(false)}>
          <div className="ach-popup" onClick={(e) => e.stopPropagation()}>
            <button className="ach-close-btn" onClick={() => setShowNotifyHelp(false)}>✕</button>
            <div className="ach-popup-title">Уведомления о друзьях 🔔</div>
            <p className="privacy-help-text">
              Когда включено, тебе будут приходить уведомления о походах твоих друзей на трон.<br /><br />
              Выключишь — не будешь получать эти уведомления.
            </p>
          </div>
        </div>
      )}
      {showPrivacyHelp && (
        <div className="ach-popup-overlay" onClick={() => setShowPrivacyHelp(false)}>
          <div className="ach-popup" onClick={(e) => e.stopPropagation()}>
            <button className="ach-close-btn" onClick={() => setShowPrivacyHelp(false)}>✕</button>
            <div className="ach-popup-title">Приватный аккаунт 🔒</div>
            <p className="privacy-help-text">
              Если включить:<br /><br />
              • Тебя не видно в глобальном рейтинге<br />
              • Тебя нельзя найти по нику<br />
              • Друзья по-прежнему видят тебя и твою статистику<br />
              • Ты сам видишь все свои данные<br /><br />
              Выключишь — снова станешь виден всем.
            </p>
          </div>
        </div>
      )}
      {viewUser && (
        <div className="ach-popup-overlay" onClick={() => setViewUser(null)}>
          <div className="ach-popup" onClick={(e) => e.stopPropagation()}>
            <button className="ach-close-btn" onClick={() => setViewUser(null)}>✕</button>
            <img src={AVATAR_MAP[viewUser.base.avatar] || AVATAR_MAP['king']} className="profile-avatar-img" alt="" />
            <div className="ach-popup-title">@{viewUser.base.username || viewUser.base.first_name}</div>
            {viewUser.loading ? (
              <p className="subtitle">Загрузка…</p>
            ) : viewUser.stats?.ok ? (
              <div className="stats-grid" style={{ marginTop: 12 }}>
                <div className="stat-card"><div className="stat-value">📊 {viewUser.stats.total}</div><div className="stat-label">сеансов</div></div>
                <div className="stat-card"><div className="stat-value">⭐ {viewUser.stats.avg}</div><div className="stat-label">средняя</div></div>
                <div className="stat-card"><div className="stat-value">🧻 {viewUser.stats.totalSheets}</div><div className="stat-label">листов</div></div>
                <div className="stat-card"><div className="stat-value">🔥 {viewUser.stats.bestStreak}</div><div className="stat-label">лучший стрик</div></div>
              </div>
            ) : (
              <p className="subtitle">Нет данных</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
