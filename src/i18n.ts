// ===== СИСТЕМА ЛОКАЛИЗАЦИИ =====
// Автоопределение: ru -> русский, всё остальное -> английский.
// (hi/хинди добавим позже — просто дополнив словарь и detectLang.)

export type Lang = 'ru' | 'en'

// Определяем язык из Telegram (или браузера), с запоминанием выбора
function detectLang(): Lang {
  try {
    const saved = localStorage.getItem('throne_lang')
    if (saved === 'ru' || saved === 'en') return saved
  } catch {}
  const tg = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.language_code
  const code = (tg || (navigator.language || 'en')).toLowerCase()
  if (code.startsWith('ru')) return 'ru'
  return 'en'
}

export let LANG: Lang = detectLang()

export function setLang(l: Lang) {
  LANG = l
  try { localStorage.setItem('throne_lang', l) } catch {}
}

// Словарь. Ключи группируем по смыслу. en — простой, понятный не-носителю.
const DICT: Record<string, { ru: string; en: string }> = {
  // --- Общее / навигация ---
  'tab.home': { ru: 'Главная', en: 'Home' },
  'tab.stats': { ru: 'Стата', en: 'Stats' },
  'tab.ach': { ru: 'Ачивки', en: 'Badges' },
  'tab.profile': { ru: 'Профиль', en: 'Profile' },
  'common.cancel': { ru: 'Отмена', en: 'Cancel' },
  'common.back': { ru: 'Назад', en: 'Back' },
  'common.save': { ru: 'Сохранить', en: 'Save' },
  'common.done': { ru: 'Готово', en: 'Done' },
  'common.next': { ru: 'Далее', en: 'Next' },
  'common.loading': { ru: 'Загрузка…', en: 'Loading…' },

  // --- Главная / тапалка ---
  'home.buy': { ru: '💰 Купить $KAKA', en: '💰 Buy $KAKA' },
  'home.tapHint': { ru: '👆 Тапай и зарабатывай $KAKA', en: '👆 Tap and earn $KAKA' },
  'home.dailyLimit': { ru: 'Лимит на сегодня 👑', en: "Today's limit reached 👑" },
  'home.todayProgress': { ru: 'за сегодня', en: 'today' },
  'home.buyCtaTop': { ru: '🚀 Войти в Early Bird', en: '🚀 Join Early Bird' },
  'home.buyCtaSub': { ru: 'Потенциал 10–30x', en: '10–30x potential' },

  // --- Таймер раунда ---
  'timer.early': { ru: 'Early Bird', en: 'Early Bird' },
  'timer.presale': { ru: 'Presale', en: 'Presale' },
  'timer.endsIn': { ru: 'заканчивается через', en: 'ends in' },
  'timer.days': { ru: 'дн', en: 'd' },
  'timer.hours': { ru: 'ч', en: 'h' },
  'timer.mins': { ru: 'мин', en: 'm' },
  'timer.secs': { ru: 'сек', en: 's' },

  // --- Запись сеанса ---
  'rec.title': { ru: 'Новый поход 🚽', en: 'New visit 🚽' },
  'rec.rate': { ru: 'Как прошло?', en: 'How did it go?' },
  'rec.amount': { ru: 'Сколько?', en: 'How much?' },
  'rec.consistency': { ru: 'Консистенция', en: 'Consistency' },
  'rec.paper': { ru: 'Бумага', en: 'Paper' },
  'rec.noPaper': { ru: 'Без бумаги', en: 'No paper' },
  'rec.saveBtn': { ru: 'Сохранить', en: 'Save' },
  // количество
  'amount.miss': { ru: 'Осечка', en: 'Misfire' },
  'amount.little': { ru: 'Чуток', en: 'A bit' },
  'amount.normal': { ru: 'Стандарт', en: 'Normal' },
  'amount.lot': { ru: 'Куча', en: 'A load' },
  // консистенция
  'cons.liquid': { ru: 'Жидко', en: 'Runny' },
  'cons.soft': { ru: 'Мягко', en: 'Soft' },
  'cons.sausage': { ru: 'Колбаска', en: 'Sausage' },
  'cons.rock': { ru: 'Сухарь', en: 'Rock' },

  // --- Результат ---
  'res.great': { ru: 'Красота! 🎉', en: 'Beautiful! 🎉' },
  'res.ok': { ru: 'Нормально 😊', en: 'Not bad 😊' },
  'res.bad': { ru: 'Бывает 😔', en: 'It happens 😔' },
  'res.tipConstip': { ru: 'Пей больше воды и ешь клетчатку — поможет.', en: 'Drink more water and eat fiber — it helps.' },
  'res.tipUpset': { ru: 'Расстройство? Отдохни и следи за питанием.', en: 'Upset tummy? Rest and watch what you eat.' },

  // --- Статистика ---
  'stats.numbers': { ru: 'Цифры', en: 'Numbers' },
  'stats.calendar': { ru: 'Календарь', en: 'Calendar' },
  'stats.rating': { ru: 'Рейтинг', en: 'Leaderboard' },
  'stats.total': { ru: 'сеансов', en: 'visits' },
  'stats.avg': { ru: 'средняя', en: 'avg score' },
  'stats.sheets': { ru: 'листов', en: 'sheets' },
  'stats.bestStreak': { ru: 'лучший стрик', en: 'best streak' },
  'stats.lbBalance': { ru: 'Баланс $KAKA 💰', en: '$KAKA balance 💰' },
  'stats.lbEmpty': { ru: 'Добавь друзей в профиле 👥', en: 'Add friends in your profile 👥' },
  'stats.you': { ru: '(ты)', en: '(you)' },
  'stats.titleFull': { ru: 'Статистика 📊', en: 'Stats 📊' },
  'stats.noDataYet': { ru: 'Пока нет данных. Запиши первый сеанс!', en: 'No data yet. Log your first visit!' },
  'stats.dayVisits': { ru: 'Сеансы за день', en: 'Visits that day' },
  'stats.anon': { ru: 'Аноним', en: 'Anonymous' },
  'stats.global': { ru: 'Глобально', en: 'Global' },
  'stats.favTime': { ru: 'любимое время', en: 'favorite time' },
  'stats.totalVisits': { ru: 'всего сеансов', en: 'total visits' },
  'stats.avgScore': { ru: 'средняя оценка', en: 'avg score' },
  'stats.totalSheets': { ru: 'листов всего', en: 'total sheets' },
  'stats.mostOften': { ru: 'чаще всего', en: 'most often' },
  'stats.streakDays': { ru: 'дней подряд', en: 'day streak' },
  'stats.streakTomorrow': { ru: 'Завтра:', en: 'Tomorrow:' },

  // --- Профиль ---
  'profile.title': { ru: 'Профиль 👤', en: 'Profile 👤' },
  'profile.friends': { ru: 'Друзья', en: 'Friends' },
  'profile.searchNick': { ru: 'Найти по нику', en: 'Search by nick' },
  'profile.noneFound': { ru: 'Никого не нашли 🤷', en: 'No one found 🤷' },
  'profile.myFriends': { ru: 'Мои друзья', en: 'My friends' },
  'profile.showAll': { ru: 'Показать всех', en: 'Show all' },
  'profile.collapse': { ru: 'Свернуть ▲', en: 'Collapse ▲' },
  'profile.refHead': { ru: 'Зови друзей — получай $KAKA', en: 'Invite friends — earn $KAKA' },
  'profile.refYou': { ru: 'тебе за каждого друга', en: 'for you per friend' },
  'profile.refFriend': { ru: 'другу, когда он сходит на трон 👑', en: 'for your friend after their first visit 👑' },
  'profile.inviteBtn': { ru: '➕ Пригласить и получить 500 $KAKA', en: '➕ Invite and get 500 $KAKA' },
  'profile.inviteTop': { ru: '➕ Пригласить друзей', en: '➕ Invite friends' },
  'profile.inviteSub': { ru: 'Получить 500 $KAKA', en: 'Get 500 $KAKA' },
  'profile.inviteText': { ru: '👑 Залетай на Трон! Нам обоим по 500 $KAKA, когда сходишь первый раз 💩 Го?', en: '👑 Come to the Throne! We both get 500 $KAKA after your first visit 💩 Let\'s go?' },
  'profile.notifications': { ru: 'Уведомления', en: 'Notifications' },
  'profile.notifyFriends': { ru: '🔔 Уведомления о друзьях', en: '🔔 Friend notifications' },
  'profile.privacy': { ru: 'Приватность', en: 'Privacy' },
  'profile.privateAcc': { ru: '🔒 Приватный аккаунт', en: '🔒 Private account' },
  'profile.data': { ru: 'Данные', en: 'Data' },
  'profile.clearHistory': { ru: '🗑️ Очистить историю', en: '🗑️ Clear history' },
  'profile.about': { ru: 'Трон · Early Bird 👑', en: 'Throne · Early Bird 👑' },
  'profile.nickPh': { ru: 'ник', en: 'nick' },
  'profile.noData': { ru: 'Нет данных', en: 'No data' },
  'profile.clearConfirm': { ru: 'Удалить всю историю и достижения? Это нельзя отменить.', en: 'Delete all history and badges? This cannot be undone.' },
  'profile.notifyHelpTitle': { ru: 'Уведомления о друзьях 🔔', en: 'Friend notifications 🔔' },
  'profile.notifyHelpText': { ru: 'Когда включено, тебе будут приходить уведомления о походах твоих друзей на трон.<br /><br />Выключишь — не будешь получать эти уведомления.', en: "When on, you'll get notified when your friends visit the throne.<br /><br />Turn it off to stop these notifications." },
  'profile.privacyHelpTitle': { ru: 'Приватный аккаунт 🔒', en: 'Private account 🔒' },
  'profile.privacyHelpText': { ru: 'Если включить:<br /><br />• Тебя не видно в глобальном рейтинге<br />• Тебя нельзя найти по нику<br />• Друзья по-прежнему видят тебя и твою статистику<br />• Ты сам видишь все свои данные<br /><br />Выключишь — снова станешь виден всем.', en: 'When on:<br /><br />• You\'re hidden from the global leaderboard<br />• You can\'t be found by nick<br />• Friends still see you and your stats<br />• You still see all your own data<br /><br />Turn it off to be visible to everyone again.' },
  'profile.nickErr.short': { ru: 'Минимум 3 символа', en: 'At least 3 characters' },
  'profile.nickErr.long': { ru: 'Максимум 20 символов', en: 'Max 20 characters' },
  'profile.nickErr.chars': { ru: 'Только латиница, цифры и _', en: 'Only latin letters, numbers and _' },

  // --- Daily checkin ---
  'daily.day': { ru: 'День', en: 'Day' },
  'daily.sub': { ru: 'Заходи каждый день — награда растёт!', en: 'Come back daily — the reward grows!' },
  'daily.claim': { ru: 'Забрать 👑', en: 'Claim 👑' },

  // --- Покупка (BuyScreen) ---
  'buy.title': { ru: '🚀 Войти в Early Bird', en: '🚀 Join Early Bird' },
  'buy.subBase': { ru: 'Вот во что превратится твой баланс. Подвигай ползунок — докупи и смотри рост.', en: 'See what your balance can become. Move the slider — add more and watch it grow.' },
  'buy.subBuy': { ru: 'Чем раньше зайдёшь — тем дешевле $KAKA. Потенциал 10–30x к листингу.', en: 'The earlier you join, the cheaper $KAKA. 10–30x potential by listing.' },
  'buy.now': { ru: 'Сейчас', en: 'Now' },
  'buy.yourEntry': { ru: 'Твой вход', en: 'Your entry' },
  'buy.listing': { ru: 'Листинг', en: 'Listing' },
  'buy.addMove': { ru: 'Докупить (двигай)', en: 'Add more (slide)' },
  'buy.add': { ru: 'Докупить', en: 'Add more' },
  'buy.yourBalance': { ru: 'Твой баланс', en: 'Your balance' },
  'buy.sendHere': { ru: 'Отправь SOL сюда', en: 'Send SOL here' },
  'buy.network': { ru: 'Сеть Solana · минимум 0.5 SOL', en: 'Solana network · 0.5 SOL min' },
  'buy.copy': { ru: 'Копир.', en: 'Copy' },
  'buy.paidTop': { ru: 'Я оплатил', en: "I've paid" },
  'buy.paidSub': { ru: 'Подтвердить транзакцию →', en: 'Confirm transaction →' },
  'buy.minSol': { ru: 'Минимум 0.5 SOL для входа', en: '0.5 SOL minimum to join' },
  'buy.legal': { ru: 'Оценка по цене текущего раунда. Потенциал роста — не гарантия. Участвуй ответственно.', en: 'Value at current round price. Growth potential is not guaranteed. Participate responsibly.' },
  // форма заявки
  'buy.formTitle': { ru: 'Подтвердить транзакцию', en: 'Confirm transaction' },
  'buy.howMuchSol': { ru: 'Сколько SOL отправил', en: 'How much SOL did you send' },
  'buy.txHash': { ru: 'Хэш транзакции', en: 'Transaction hash' },
  'buy.txPlaceholder': { ru: 'Вставь хэш из кошелька', en: 'Paste the hash from your wallet' },
  'buy.youGet': { ru: 'Получишь:', en: 'You get:' },
  'buy.sendReq': { ru: 'Отправить заявку', en: 'Send request' },
  'buy.sending': { ru: 'Отправка…', en: 'Sending…' },
  'buy.reqHint': { ru: 'Начисление после проверки транзакции оператором', en: 'Credited after an operator checks your transaction' },
  'buy.doneTitle': { ru: 'Заявка отправлена!', en: 'Request sent!' },
  'buy.doneSub': { ru: 'Проверим транзакцию и начислим $KAKA. Придёт уведомление в бот 👑', en: "We'll check it and credit your $KAKA. You'll get a bot notification 👑" },
  'buy.gotIt': { ru: 'Понятно', en: 'Got it' },

  // --- Новичок / бренд ---
  'brand.title': { ru: 'На троне', en: 'The Throne' },
  'brand.sub': { ru: 'Твой личный какашка-трекер', en: 'Your personal poop tracker' },
  'newbie.cta': { ru: 'Запиши свой первый поход!', en: 'Log your first visit!' },

  // --- Заголовки записи ---
  'rec.q.rate': { ru: 'Как всё прошло?', en: 'How did it go?' },
  'rec.q.rateSub': { ru: 'Оцени сеанс от 1 до 10', en: 'Rate it from 1 to 10' },
  'rec.q.amount': { ru: 'Сколько добра?', en: 'How much?' },
  'rec.q.amountSub': { ru: 'Оцени объём', en: 'Pick the amount' },
  'rec.q.cons': { ru: 'Какая консистенция?', en: "What's the texture?" },
  'rec.q.consSub': { ru: 'Выбери, что ближе', en: 'Pick the closest' },
  'rec.q.paper': { ru: 'Сколько бумаги ушло?', en: 'How much paper?' },
  'rec.q.paperSub': { ru: 'Тапни по листам или проведи пальцем', en: 'Tap the sheets or swipe' },
  'rec.noPaperBtn': { ru: '💩 Без бумаги 🚿', en: '💩 No paper 🚿' },
  'rec.notPicked': { ru: 'Ещё не выбрано', en: 'Not picked yet' },
  'rec.torn': { ru: 'Оторвано:', en: 'Torn off:' },

  // --- Ачивки ---
  'ach.title': { ru: 'Достижения 🏆', en: 'Badges 🏆' },
  'ach.gotIt': { ru: 'Достижение получено!', en: 'Badge unlocked!' },
  'ach.reader': { ru: 'Ты долистал до самого низа 🫡', en: 'You scrolled all the way down 🫡' },

  // --- Онбординг монет ---
  'onboard.ach': { ru: '🏆 Ачивки', en: '🏆 Badges' },
  'onboard.hint': { ru: 'Зарабатывай $KAKA и копи к листингу 👀', en: 'Earn $KAKA and stack up for listing 👀' },
  'ach.counter': { ru: 'Получено', en: 'Unlocked' },
  'ach.tasks': { ru: '🎯 Задания', en: '🎯 Tasks' },
  'ach.secret': { ru: '🕵️ Секретные', en: '🕵️ Secret' },

  // --- Ачивки (названия + условия) ---
  'ach.first.name': { ru: 'Первое приземление', en: 'First Landing' },
  'ach.first.cond': { ru: 'Первый сеанс', en: 'Your first visit' },
  'ach.five.name': { ru: 'Пятёрочка', en: 'High Five' },
  'ach.five.cond': { ru: '5 сеансов всего', en: '5 visits total' },
  'ach.ten.name': { ru: 'Десятка сходов', en: 'Perfect Ten' },
  'ach.ten.cond': { ru: '10 сеансов всего', en: '10 visits total' },
  'ach.hundred.name': { ru: 'Центурион', en: 'Centurion' },
  'ach.hundred.cond': { ru: '100 сеансов всего', en: '100 visits total' },
  'ach.perfect.name': { ru: 'Идеальный дроп', en: 'Perfect Drop' },
  'ach.perfect.cond': { ru: 'Оценка 10 + «Колбаска»', en: 'Score 10 + Sausage' },
  'ach.paperking.name': { ru: 'Бумажный король', en: 'Paper King' },
  'ach.paperking.cond': { ru: 'Больше 10 листов за раз', en: 'More than 10 sheets at once' },
  'ach.ecoguard.name': { ru: 'Страж природы', en: 'Eco Warrior' },
  'ach.ecoguard.cond': { ru: '2 листа или меньше', en: '2 sheets or fewer' },
  'ach.survival.name': { ru: 'Режим выживания', en: 'Survival Mode' },
  'ach.survival.cond': { ru: 'Ровно 1 лист', en: 'Exactly 1 sheet' },
  'ach.aqua.name': { ru: 'Аквавоин', en: 'Water Warrior' },
  'ach.aqua.cond': { ru: 'Отметить «Без бумаги»', en: 'Go "No paper"' },
  'ach.earlybird.name': { ru: 'Ранняя пташка', en: 'Early Bird' },
  'ach.earlybird.cond': { ru: 'Сеанс до 7 утра', en: 'A visit before 7 AM' },
  'ach.midnight.name': { ru: 'Полуночник', en: 'Night Owl' },
  'ach.midnight.cond': { ru: 'Сеанс после полуночи', en: 'A visit after midnight' },
  'ach.double.name': { ru: 'Дубль', en: 'Double Trouble' },
  'ach.double.cond': { ru: '2 сеанса за один день', en: '2 visits in one day' },
  'ach.hattrick.name': { ru: 'Хет-трик', en: 'Hat-trick' },
  'ach.hattrick.cond': { ru: '3 сеанса за один день', en: '3 visits in one day' },
  'ach.streak3.name': { ru: 'Разогрев', en: 'Warming Up' },
  'ach.streak3.cond': { ru: 'Стрик 3 дня подряд', en: '3-day streak' },
  'ach.streak7.name': { ru: 'Неделя дисциплины', en: 'Week of Discipline' },
  'ach.streak7.cond': { ru: 'Стрик 7 дней подряд', en: '7-day streak' },
  'ach.loose.name': { ru: 'Прорыв плотины', en: 'Dam Burst' },
  'ach.loose.cond': { ru: 'Консистенция «Жидко»', en: 'Runny texture' },
  'ach.hard.name': { ru: 'Каменная кладка', en: 'Solid as a Rock' },
  'ach.hard.cond': { ru: 'Консистенция «Сухари»', en: 'Rock texture' },
  'ach.sausage10.name': { ru: 'Идеальная форма', en: 'Perfect Shape' },
  'ach.sausage10.cond': { ru: '«Колбаска» 10 раз', en: 'Sausage 10 times' },
  'ach.spectrum.name': { ru: 'Полный спектр', en: 'Full Spectrum' },
  'ach.spectrum.cond': { ru: 'Все 4 консистенции хоть раз', en: 'All 4 textures at least once' },
  'ach.artillery.name': { ru: 'Тяжёлая артиллерия', en: 'Heavy Artillery' },
  'ach.artillery.cond': { ru: '«Куча» три раза', en: 'A Load three times' },
  'ach.alien.name': { ru: 'Контакт с иным разумом', en: 'Alien Contact' },
  'ach.alien.cond': { ru: 'Оценка 1 из 10', en: 'Score 1 out of 10' },
  'ach.nightwatch.name': { ru: 'Страж ночи', en: 'Night Watch' },
  'ach.nightwatch.cond': { ru: 'Сеанс между 2:00 и 4:00', en: 'A visit between 2 and 4 AM' },
  'ach.doomsday.name': { ru: 'Судный день', en: 'Doomsday' },
  'ach.doomsday.cond': { ru: '5+ сеансов за один день', en: '5+ visits in one day' },
  'ach.clean.name': { ru: 'Чистая работа', en: 'Clean Job' },
  'ach.clean.cond': { ru: 'Оценка 10 + «Без бумаги»', en: 'Score 10 + No paper' },
  'ach.rollercoaster.name': { ru: 'Американские горки', en: 'Rollercoaster' },
  'ach.rollercoaster.cond': { ru: 'За день оценка 10 и оценка 1', en: 'Score 10 and score 1 in one day' },
  'ach.roadworks.name': { ru: 'Дорожные работы', en: 'Road Works' },
  'ach.roadworks.cond': { ru: '«Осечка» 3 дня подряд', en: 'Misfire 3 days in a row' },
  'ach.jackpot.name': { ru: 'Джекпот', en: 'Jackpot' },
  'ach.jackpot.cond': { ru: 'Сеанс в 00:00–00:09', en: 'A visit at 00:00–00:09' },
  'ach.prophecy.name': { ru: 'Пророчество сбылось', en: 'Prophecy Fulfilled' },
  'ach.prophecy.cond': { ru: 'Оценка 7 семь раз подряд', en: 'Score 7 seven times in a row' },
  'ach.dragon.name': { ru: 'Победитель дракона', en: 'Dragon Slayer' },
  'ach.dragon.cond': { ru: '«Куча» + больше 10 листов', en: 'A Load + more than 10 sheets' },
  'ach.ninja.name': { ru: 'Бесшумный ниндзя', en: 'Silent Ninja' },
  'ach.ninja.cond': { ru: '«Без бумаги» 5 раз всего', en: 'No paper 5 times total' },
  'ach.blackstreak.name': { ru: 'Чёрная полоса', en: 'Rough Patch' },
  'ach.blackstreak.cond': { ru: 'Оценка 1–3 три раза подряд', en: 'Score 1–3 three times in a row' },
  'ach.goat.name': { ru: 'Величайший из всех', en: 'The GOAT' },
  'ach.goat.cond': { ru: 'Оценка 8+ десять раз подряд', en: 'Score 8+ ten times in a row' },
  'ach.thirty.name': { ru: 'Ритуал полнолуния', en: 'Full Moon Ritual' },
  'ach.thirty.cond': { ru: '30 сеансов всего', en: '30 visits total' },
  'ach.timeless.name': { ru: 'Вне времени', en: 'Timeless' },
  'ach.timeless.cond': { ru: 'Сеансы во все 4 времени суток', en: 'Visits in all 4 parts of the day' },
  'ach.zen.name': { ru: 'Мастер дзена', en: 'Zen Master' },
  'ach.zen.cond': { ru: 'Оценка 10 три раза подряд', en: 'Score 10 three times in a row' },
  'ach.reader.name': { ru: 'Конец есть!', en: 'The End!' },
  'ach.reader.cond': { ru: 'Пролистать все ачивки', en: 'Scroll through all badges' },
}
// Главная функция перевода
export function t(key: string): string {
  const row = DICT[key]
  if (!row) return key            // нет ключа — вернём сам ключ (видно, что забыли)
  return row[LANG] || row.en || key
}

// Месяцы, дни недели, время суток (зависят от языка)
export function MONTHS(): string[] {
  return LANG === 'ru'
    ? ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
    : ['January','February','March','April','May','June','July','August','September','October','November','December']
}
export function WEEKDAYS(): string[] {
  return LANG === 'ru'
    ? ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
}
export function TIMES(): string[] {
  return LANG === 'ru'
    ? ['Утро 🌅','День ☀️','Вечер 🌆','Ночь 🌙']
    : ['Morning 🌅','Day ☀️','Evening 🌆','Night 🌙']
}
