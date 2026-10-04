import { useState, useEffect } from 'react'
import { getTelegramUser, searchUser, followUser, unfollowUser, loadFriends, loadUserStats, setPrivacy, setNotify, loadCoins } from './api'
import { t, LANG, setLang } from './i18n'
import coinImg from './assets/coin.png'




// Проверка ника: латиница, цифры, _ ; без пробелов и спецсимволов; 3-20 символов
function validateNick(nick: string): string {
  if (nick.length < 3) return t('profile.nickErr.short')
  if (nick.length > 20) return t('profile.nickErr.long')
  if (!/^[a-zA-Z0-9_]+$/.test(nick)) return t('profile.nickErr.chars')
  return '' // пусто = всё ок
}

function Profile({ onClearHistory, onOpenBuy }: { onClearHistory: () => void; onOpenBuy: () => void }) {
  // Имя: сначала из Telegram (username или имя), иначе из памяти
  const tgUser = getTelegramUser()
  const [nick, setNick] = useState(() => {
    if (tgUser?.username) return tgUser.username
    if (tgUser?.firstName) return tgUser.firstName
    return localStorage.getItem('throne_nick') || 'throne_user'
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
  const [friendsExpanded, setFriendsExpanded] = useState(false)

  useEffect(() => {
    loadFriends().then((list) => setFriends(Array.isArray(list) ? list : []))
    loadCoins().then((data) => setCoins(data.balance || 0))
  }, [])

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
    const text = t('profile.inviteText')
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





  const confirmClear = () => {
    if (window.confirm(t('profile.clearConfirm'))) {
      onClearHistory()
    }
  }

  return (
    <div className="tab-content profile">
      <h2 className="record-title">{t('profile.title')}</h2>

      <div className="lang-switch">
        <button
          className={LANG === 'en' ? 'lang-btn on' : 'lang-btn'}
          onClick={() => { localStorage.setItem('throne_return_tab', 'profile'); setLang('en'); location.reload() }}
        >🇬🇧 EN</button>
        <button
          className={LANG === 'ru' ? 'lang-btn on' : 'lang-btn'}
          onClick={() => { localStorage.setItem('throne_return_tab', 'profile'); setLang('ru'); location.reload() }}
        >🇷🇺 RU</button>
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
            placeholder={t('profile.nickPh')}
            maxLength={20}
          />
          {error && <p className="nick-error">{error}</p>}
          <div className="nick-actions">
            <button className="btn-gold small" onClick={saveNick}>{t('common.save')}</button>
            <button className="back-btn small" onClick={() => { setEditing(false); setError('') }}>{t('common.cancel')}</button>
          </div>
        </div>
      )}

      {/* Баланс $KAKA */}
      <div className="coin-balance">
        <img src={coinImg} className="coin-icon" alt="KAKA" />
        <span className="coin-amount">{coins}</span>
        <span className="coin-label">$KAKA</span>
        <span className="coin-usd">≈ ${(coins * 0.000075).toFixed(2)}</span>
      </div>

      <button className="buy-cta" onClick={onOpenBuy}>
        <span className="buy-cta-shine" />
        <span className="buy-cta-top">{t('home.buyCtaTop')}</span>
        <span className="buy-cta-sub">{t('home.buyCtaSub')}</span>
      </button>

      {/* Скины */}


      {/* Друзья */}
      <p className="field-label ach-block-title">{t('profile.friends')}</p>
      <div className="friend-search">
        <input
          className="nick-input"
          value={searchNick}
          onChange={(e) => setSearchNick(e.target.value)}
          placeholder={t('profile.searchNick')}
          onKeyDown={(e) => { if (e.key === 'Enter') doSearch() }}
        />
        <button className="btn-gold small" onClick={doSearch}>🔍</button>
      </div>

      {searched && searchResults.length === 0 && (
        <p className="subtitle">{t('profile.noneFound')}</p>
      )}
      {searchResults.map((u) => {
        const isMe = u.username === (tgUser?.username || '')
        return (
          <div key={u.user_id} className="friend-found">
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
          <p className="field-label ach-block-title">{t('profile.myFriends')} ({friends.length})</p>
          {(friendsExpanded ? friends : friends.slice(0, 3)).map((f) => (
            <div key={f.user_id} className="friend-found">
              <span className="friend-name" onClick={() => openUserStats(f)} style={{ cursor: 'pointer' }}>@{f.username || f.first_name}</span>
              <button className="friend-remove" onClick={() => removeFriend(f.user_id)}>✕</button>
            </div>
          ))}
          {friends.length > 3 && (
            <button className="friends-toggle" onClick={() => setFriendsExpanded(!friendsExpanded)}>
              {friendsExpanded ? t('profile.collapse') : `${t('profile.showAll')} (${friends.length}) ▼`}
            </button>
          )}
        </>
      )}

      <div className="ref-promo">
        <div className="ref-promo-head">
          <img src={coinImg} className="ref-coin" alt="" />
          {t('profile.refHead')}
        </div>
        <div className="ref-promo-row"><span className="ref-plus">+500</span> {t('profile.refYou')}</div>
        <div className="ref-promo-row"><span className="ref-plus">+500</span> {t('profile.refFriend')}</div>
      </div>

      <button className="buy-cta" onClick={inviteFriend}>
        <span className="buy-cta-shine" />
        <span className="buy-cta-top">{t('profile.inviteTop')}</span>
        <span className="buy-cta-sub">{t('profile.inviteSub')}</span>
      </button>

      {/* Уведомления */}
      <p className="field-label ach-block-title">
        {t('profile.notifications')}
        <button className="help-btn" onClick={() => setShowNotifyHelp(true)}>?</button>
      </p>
      <div className="privacy-row">
        <span>{t('profile.notifyFriends')}</span>
        <button
          className={notifyOn ? 'toggle on' : 'toggle'}
          onClick={toggleNotify}
        >
          <span className="toggle-knob" />
        </button>
      </div>

      {/* Приватность */}
      <p className="field-label ach-block-title">
        {t('profile.privacy')}
        <button className="help-btn" onClick={() => setShowPrivacyHelp(true)}>?</button>
      </p>
      <div className="privacy-row">
        <span>{t('profile.privateAcc')}</span>
        <button
          className={isPrivate ? 'toggle on' : 'toggle'}
          onClick={togglePrivacy}
        >
          <span className="toggle-knob" />
        </button>
      </div>

      {/* Данные */}
      <p className="field-label ach-block-title">{t('profile.data')}</p>
      <button className="danger-btn" onClick={confirmClear}>
        {t('profile.clearHistory')}
      </button>

      {/* О приложении */}
      <p className="profile-about">{t('profile.about')}</p>
      {showNotifyHelp && (
        <div className="ach-popup-overlay" onClick={() => setShowNotifyHelp(false)}>
          <div className="ach-popup" onClick={(e) => e.stopPropagation()}>
            <button className="ach-close-btn" onClick={() => setShowNotifyHelp(false)}>✕</button>
            <div className="ach-popup-title">{t('profile.notifyHelpTitle')}</div>
            <p className="privacy-help-text" dangerouslySetInnerHTML={{ __html: t('profile.notifyHelpText') }} />
          </div>
        </div>
      )}
      {showPrivacyHelp && (
        <div className="ach-popup-overlay" onClick={() => setShowPrivacyHelp(false)}>
          <div className="ach-popup" onClick={(e) => e.stopPropagation()}>
            <button className="ach-close-btn" onClick={() => setShowPrivacyHelp(false)}>✕</button>
            <div className="ach-popup-title">{t('profile.privacyHelpTitle')}</div>
            <p className="privacy-help-text" dangerouslySetInnerHTML={{ __html: t('profile.privacyHelpText') }} />
          </div>
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

export default Profile
