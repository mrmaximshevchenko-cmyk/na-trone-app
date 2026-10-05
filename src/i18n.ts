// ===== СИСТЕМА ЛОКАЛИЗАЦИИ =====
// Автоопределение: ru -> русский, всё остальное -> английский.
// (hi/хинди добавим позже — просто дополнив словарь и detectLang.)

export type Lang = 'ru' | 'en' | 'hi'

// Определяем язык из Telegram (или браузера), с запоминанием выбора
function detectLang(): Lang {
  try {
    const saved = localStorage.getItem('throne_lang')
    if (saved === 'ru' || saved === 'en' || saved === 'hi') return saved
  } catch {}
  const tg = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.language_code
  const code = (tg || (navigator.language || 'en')).toLowerCase()
  if (code.startsWith('ru')) return 'ru'
  if (code.startsWith('hi')) return 'hi'
  return 'en'
}

export let LANG: Lang = detectLang()

export function setLang(l: Lang) {
  LANG = l
  try { localStorage.setItem('throne_lang', l) } catch {}
}

// Словарь. Ключи группируем по смыслу. en — простой, понятный не-носителю.
const DICT: Record<string, { ru: string; en: string; hi: string }> = {
  // --- Общее / навигация ---
  'tab.home': { ru: 'Главная', en: 'Home', hi: 'होम' },
  'tab.stats': { ru: 'Стата', en: 'Stats', hi: 'स्टैट्स' },
  'tab.ach': { ru: 'Ачивки', en: 'Badges', hi: 'बैजेस' },
  'tab.profile': { ru: 'Профиль', en: 'Profile', hi: 'प्रोफाइल' },
  'common.cancel': { ru: 'Отмена', en: 'Cancel', hi: 'कैंसल' },
  'common.back': { ru: 'Назад', en: 'Back', hi: 'वापस' },
  'common.save': { ru: 'Сохранить', en: 'Save', hi: 'सेव' },
  'common.done': { ru: 'Готово', en: 'Done', hi: 'हो गया' },
  'common.next': { ru: 'Далее', en: 'Next', hi: 'आगे' },
  'common.loading': { ru: 'Загрузка…', en: 'Loading…', hi: 'लोड हो रहा…' },

  // --- Главная / тапалка ---
  'home.buy': { ru: '💰 Купить $KAKA', en: '💰 Buy $KAKA', hi: '💰 $KAKA खरीदो' },
  'home.tapHint': { ru: '👆 Тапай и зарабатывай $KAKA', en: '👆 Tap and earn $KAKA', hi: '👆 टैप करो, $KAKA कमाओ' },
  'home.dailyLimit': { ru: 'Лимит на сегодня 👑', en: "Today's limit reached 👑", hi: 'आज की लिमिट पूरी 👑' },
  'home.todayProgress': { ru: 'за сегодня', en: 'today', hi: 'आज' },
  'home.buyCtaTop': { ru: '🚀 Войти в Early Bird', en: '🚀 Join Early Bird', hi: '🚀 Early Bird में घुसो' },
  'home.buyCtaSub': { ru: 'Потенциал 10–30x', en: '10–30x potential', hi: '10–30x पोटेंशियल' },

  // --- Таймер раунда ---
  'timer.early': { ru: 'Early Bird', en: 'Early Bird', hi: 'Early Bird' },
  'timer.presale': { ru: 'Presale', en: 'Presale', hi: 'Presale' },
  'timer.endsIn': { ru: 'заканчивается через', en: 'ends in', hi: 'में खत्म' },
  'timer.days': { ru: 'дн', en: 'd', hi: 'दिन' },
  'timer.hours': { ru: 'ч', en: 'h', hi: 'घं' },
  'timer.mins': { ru: 'мин', en: 'm', hi: 'मि' },
  'timer.secs': { ru: 'сек', en: 's', hi: 'से' },

  // --- Запись сеанса ---
  'rec.title': { ru: 'Новый поход 🚽', en: 'New visit 🚽', hi: 'नया विज़िट 🚽' },
  'rec.rate': { ru: 'Как прошло?', en: 'How did it go?', hi: 'कैसा रहा?' },
  'rec.amount': { ru: 'Сколько?', en: 'How much?', hi: 'कितना?' },
  'rec.consistency': { ru: 'Консистенция', en: 'Consistency', hi: 'टेक्स्चर' },
  'rec.paper': { ru: 'Бумага', en: 'Paper', hi: 'पेपर' },
  'rec.noPaper': { ru: 'Без бумаги', en: 'No paper', hi: 'बिना पेपर' },
  'rec.saveBtn': { ru: 'Сохранить', en: 'Save', hi: 'सेव' },
  // количество
  'amount.miss': { ru: 'Осечка', en: 'False alarm', hi: 'फॉल्स अलार्म' },
  'amount.little': { ru: 'Чуток', en: 'A bit', hi: 'थोड़ा' },
  'amount.normal': { ru: 'Стандарт', en: 'Normal', hi: 'नॉर्मल' },
  'amount.lot': { ru: 'Куча', en: 'Huge', hi: 'ढेर सारा' },
  // консистенция
  'cons.liquid': { ru: 'Жидко', en: 'Watery', hi: 'पतला' },
  'cons.soft': { ru: 'Мягко', en: 'Soft', hi: 'सॉफ्ट' },
  'cons.sausage': { ru: 'Колбаска', en: 'Sausage', hi: 'सॉसेज' },
  'cons.rock': { ru: 'Сухарь', en: 'Bricks', hi: 'पत्थर' },

  // --- Результат ---
  'res.great': { ru: 'Красота! 🎉', en: 'Beautiful! 🎉', hi: 'ज़बरदस्त! 🎉' },
  'res.ok': { ru: 'Нормально 😊', en: 'Not bad 😊', hi: 'ठीकठाक 😊' },
  'res.bad': { ru: 'Бывает 😔', en: 'It happens 😔', hi: 'होता है 😔' },
  'res.tipConstip': { ru: 'Пей больше воды и ешь клетчатку — поможет.', en: 'Drink more water and eat fiber — it helps.', hi: 'ज़्यादा पानी पी और फाइबर खा — फायदा होगा।' },
  'res.tipUpset': { ru: 'Расстройство? Отдохни и следи за питанием.', en: 'Upset tummy? Rest and watch what you eat.', hi: 'पेट खराब? आराम कर और खाने का ध्यान रख।' },

  // --- Статистика ---
  'stats.numbers': { ru: 'Цифры', en: 'Numbers', hi: 'नंबर्स' },
  'stats.calendar': { ru: 'Календарь', en: 'Calendar', hi: 'कैलेंडर' },
  'stats.rating': { ru: 'Рейтинг', en: 'Leaderboard', hi: 'लीडरबोर्ड' },
  'stats.total': { ru: 'сеансов', en: 'visits', hi: 'विज़िट्स' },
  'stats.avg': { ru: 'средняя', en: 'avg score', hi: 'औसत स्कोर' },
  'stats.sheets': { ru: 'листов', en: 'sheets', hi: 'शीट्स' },
  'stats.bestStreak': { ru: 'лучший стрик', en: 'best streak', hi: 'बेस्ट स्ट्रीक' },
  'stats.lbBalance': { ru: 'Баланс $KAKA 💰', en: '$KAKA balance 💰', hi: '$KAKA बैलेंस 💰' },
  'stats.lbEmpty': { ru: 'Добавь друзей в профиле 👥', en: 'Add friends in your profile 👥', hi: 'प्रोफाइल में दोस्त जोड़ो 👥' },
  'stats.you': { ru: '(ты)', en: '(you)', hi: '(तुम)' },
  'stats.titleFull': { ru: 'Статистика 📊', en: 'Stats 📊', hi: 'स्टैट्स 📊' },
  'stats.noDataYet': { ru: 'Пока нет данных. Запиши первый сеанс!', en: 'No data yet. Log your first visit!', hi: 'अभी कोई डेटा नहीं. पहला विज़िट लॉग करो!' },
  'stats.dayVisits': { ru: 'Сеансы за день', en: 'Visits that day', hi: 'उस दिन के विज़िट' },
  'stats.anon': { ru: 'Аноним', en: 'Anonymous', hi: 'अननोन' },
  'stats.global': { ru: 'Глобально', en: 'Global', hi: 'ग्लोबल' },
  'stats.favTime': { ru: 'любимое время', en: 'favorite time', hi: 'फेवरेट टाइम' },
  'stats.totalVisits': { ru: 'всего сеансов', en: 'total visits', hi: 'कुल विज़िट्स' },
  'stats.avgScore': { ru: 'средняя оценка', en: 'avg score', hi: 'औसत स्कोर' },
  'stats.totalSheets': { ru: 'листов всего', en: 'total sheets', hi: 'कुल शीट्स' },
  'stats.mostOften': { ru: 'чаще всего', en: 'most often', hi: 'सबसे ज़्यादा' },
  'stats.streakDays': { ru: 'дней подряд', en: 'day streak', hi: 'दिन की स्ट्रीक' },
  'stats.streakTomorrow': { ru: 'Завтра:', en: 'Tomorrow:', hi: 'कल:' },

  // --- Профиль ---
  'profile.title': { ru: 'Профиль 👤', en: 'Profile 👤', hi: 'प्रोफाइल 👤' },
  'profile.friends': { ru: 'Друзья', en: 'Friends', hi: 'दोस्त' },
  'profile.searchNick': { ru: 'Найти по нику', en: 'Search by nick', hi: 'निक से ढूंढो' },
  'profile.noneFound': { ru: 'Никого не нашли 🤷', en: 'No one found 🤷', hi: 'कोई नहीं मिला 🤷' },
  'profile.myFriends': { ru: 'Мои друзья', en: 'My friends', hi: 'मेरे दोस्त' },
  'profile.showAll': { ru: 'Показать всех', en: 'Show all', hi: 'सब दिखाओ' },
  'profile.collapse': { ru: 'Свернуть ▲', en: 'Collapse ▲', hi: 'छुपाओ ▲' },
  'profile.refHead': { ru: 'Зови друзей — получай $KAKA', en: 'Invite friends — earn $KAKA', hi: 'दोस्तों को बुलाओ — $KAKA कमाओ' },
  'profile.refYou': { ru: 'тебе за каждого друга', en: 'for you per friend', hi: 'हर दोस्त पर तुम्हें' },
  'profile.refFriend': { ru: 'другу, когда он сходит на трон 👑', en: 'for your friend after their first visit 👑', hi: 'दोस्त को, उसके पहले विज़िट पर 👑' },
  'profile.inviteBtn': { ru: '➕ Пригласить и получить 500 $KAKA', en: '➕ Invite and get 500 $KAKA', hi: '➕ बुलाओ और 500 $KAKA पाओ' },
  'profile.inviteTop': { ru: '➕ Пригласить друзей', en: '➕ Invite friends', hi: '➕ दोस्तों को बुलाओ' },
  'profile.inviteSub': { ru: 'Получить 500 $KAKA', en: 'Get 500 $KAKA', hi: '500 $KAKA पाओ' },
  'profile.inviteText': { ru: '👑 Залетай на Трон! Нам обоим по 500 $KAKA, когда сходишь первый раз 💩 Го?', en: '👑 Come to the Throne! We both get 500 $KAKA after your first visit 💩 Let\'s go?' , hi: '👑 Throne पे आजा! तेरे पहले विज़िट पर हम दोनों को 500-500 $KAKA 💩 चल?' },
  'profile.notifications': { ru: 'Уведомления', en: 'Notifications', hi: 'नोटिफिकेशन' },
  'profile.notifyFriends': { ru: '🔔 Уведомления о друзьях', en: '🔔 Friend notifications', hi: '🔔 दोस्तों के नोटिफिकेशन' },
  'profile.privacy': { ru: 'Приватность', en: 'Privacy', hi: 'प्राइवेसी' },
  'profile.privateAcc': { ru: '🔒 Приватный аккаунт', en: '🔒 Private account', hi: '🔒 प्राइवेट अकाउंट' },
  'profile.data': { ru: 'Данные', en: 'Data', hi: 'डेटा' },
  'profile.clearHistory': { ru: '🗑️ Очистить историю', en: '🗑️ Clear history', hi: '🗑️ हिस्ट्री मिटाओ' },
  'profile.about': { ru: 'Трон · Early Bird 👑', en: 'Throne · Early Bird 👑', hi: 'Throne · Early Bird 👑' },
  'profile.nickPh': { ru: 'ник', en: 'nick', hi: 'निक' },
  'profile.noData': { ru: 'Нет данных', en: 'No data', hi: 'कोई डेटा नहीं' },
  'profile.clearConfirm': { ru: 'Удалить всю историю и достижения? Это нельзя отменить.', en: 'Delete all history and badges? This cannot be undone.', hi: 'सारी हिस्ट्री और बैजेस मिटा दें? ये वापस नहीं होगा।' },
  'profile.notifyHelpTitle': { ru: 'Уведомления о друзьях 🔔', en: 'Friend notifications 🔔', hi: 'दोस्तों के नोटिफिकेशन 🔔' },
  'profile.notifyHelpText': { ru: 'Когда включено, тебе будут приходить уведомления о походах твоих друзей на трон.<br /><br />Выключишь — не будешь получать эти уведомления.', en: "When on, you'll get notified when your friends visit the throne.<br /><br />Turn it off to stop these notifications.", hi: 'ऑन होने पर, तेरे दोस्त जब ट्रोन पे जाएंगे तो तुझे नोटिफिकेशन आएगा।<br /><br />ऑफ कर दे तो ये नोटिफिकेशन बंद।' },
  'profile.privacyHelpTitle': { ru: 'Приватный аккаунт 🔒', en: 'Private account 🔒', hi: 'प्राइवेट अकाउंट 🔒' },
  'profile.privacyHelpText': { ru: 'Если включить:<br /><br />• Тебя не видно в глобальном рейтинге<br />• Тебя нельзя найти по нику<br />• Друзья по-прежнему видят тебя и твою статистику<br />• Ты сам видишь все свои данные<br /><br />Выключишь — снова станешь виден всем.', en: 'When on:<br /><br />• You\'re hidden from the global leaderboard<br />• You can\'t be found by nick<br />• Friends still see you and your stats<br />• You still see all your own data<br /><br />Turn it off to be visible to everyone again.' , hi: 'ऑन करने पर:<br /><br />• ग्लोबल लीडरबोर्ड में नहीं दिखेगा<br />• निक से नहीं ढूंढा जा सकता<br />• दोस्त फिर भी तुझे और स्टैट्स देखेंगे<br />• तू अपना सारा डेटा देख सकता है<br /><br />ऑफ कर दे तो फिर सबको दिखेगा।' },
  'profile.nickErr.short': { ru: 'Минимум 3 символа', en: 'At least 3 characters', hi: 'कम से कम 3 अक्षर' },
  'profile.nickErr.long': { ru: 'Максимум 20 символов', en: 'Max 20 characters', hi: 'ज़्यादा से ज़्यादा 20 अक्षर' },
  'profile.nickErr.chars': { ru: 'Только латиница, цифры и _', en: 'Only latin letters, numbers and _', hi: 'सिर्फ अंग्रेज़ी अक्षर, नंबर और _' },

  // --- Daily checkin ---
  'daily.day': { ru: 'День', en: 'Day', hi: 'दिन' },
  'daily.sub': { ru: 'Заходи каждый день — награда растёт!', en: 'Come back daily — the reward grows!', hi: 'रोज़ आओ — इनाम बढ़ता है!' },
  'daily.claim': { ru: 'Забрать 👑', en: 'Claim 👑', hi: 'ले लो 👑' },

  // --- Покупка (BuyScreen) ---
  'buy.title': { ru: '🚀 Войти в Early Bird', en: '🚀 Join Early Bird', hi: '🚀 Early Bird में घुसो' },
  'buy.subBase': { ru: 'Вот во что превратится твой баланс. Подвигай ползунок — докупи и смотри рост.', en: 'See what your balance can become. Move the slider — add more and watch it grow.', hi: 'देख तेरा बैलेंस क्या बन सकता है। स्लाइडर घुमा — और डाल और ग्रोथ देख।' },
  'buy.subBuy': { ru: 'Чем раньше зайдёшь — тем дешевле $KAKA. Потенциал 10–30x к листингу.', en: 'The earlier you join, the cheaper $KAKA. 10–30x potential by listing.', hi: 'जितना जल्दी घुसेगा, उतना सस्ता $KAKA। लिस्टिंग तक 10–30x पोटेंशियल।' },
  'buy.now': { ru: 'Сейчас', en: 'Now', hi: 'अभी' },
  'buy.yourEntry': { ru: 'Твой вход', en: 'Your entry', hi: 'तेरी एंट्री' },
  'buy.listing': { ru: 'Листинг', en: 'Listing', hi: 'लिस्टिंग' },
  'buy.addMove': { ru: 'Докупить (двигай)', en: 'Add more (slide)', hi: 'और डालो (स्लाइड)' },
  'buy.add': { ru: 'Докупить', en: 'Add more', hi: 'और डालो' },
  'buy.yourBalance': { ru: 'Твой баланс', en: 'Your balance', hi: 'तेरा बैलेंस' },
  'buy.sendHere': { ru: 'Отправь SOL сюда', en: 'Send SOL here', hi: 'SOL यहाँ भेजो' },
  'buy.network': { ru: 'Сеть Solana · минимум 0.5 SOL', en: 'Solana network · 0.5 SOL min', hi: 'Solana नेटवर्क · मिनिमम 0.5 SOL' },
  'buy.copy': { ru: 'Копир.', en: 'Copy', hi: 'कॉपी' },
  'buy.paidTop': { ru: 'Я оплатил', en: "I've paid", hi: 'मैंने पे किया' },
  'buy.paidSub': { ru: 'Подтвердить транзакцию →', en: 'Confirm transaction →', hi: 'ट्रांज़ैक्शन कन्फर्म करो →' },
  'buy.minSol': { ru: 'Минимум 0.5 SOL для входа', en: '0.5 SOL minimum to join', hi: 'घुसने के लिए मिनिमम 0.5 SOL' },
  'buy.legal': { ru: 'Оценка по цене текущего раунда. Потенциал роста — не гарантия. Участвуй ответственно.', en: 'Value at current round price. Growth potential is not guaranteed. Participate responsibly.', hi: 'अभी के राउंड की कीमत पर अनुमान। ग्रोथ की गारंटी नहीं। सोच-समझकर भाग लो।' },
  // форма заявки
  'buy.formTitle': { ru: 'Подтвердить транзакцию', en: 'Confirm transaction', hi: 'ट्रांज़ैक्शन कन्फर्म करो' },
  'buy.howMuchSol': { ru: 'Сколько SOL отправил', en: 'How much SOL did you send', hi: 'कितना SOL भेजा' },
  'buy.txHash': { ru: 'Хэш транзакции', en: 'Transaction hash', hi: 'ट्रांज़ैक्शन हैश' },
  'buy.txPlaceholder': { ru: 'Вставь хэш из кошелька', en: 'Paste the hash from your wallet', hi: 'वॉलेट से हैश पेस्ट करो' },
  'buy.youGet': { ru: 'Получишь:', en: 'You get:', hi: 'तुझे मिलेगा:' },
  'buy.sendReq': { ru: 'Отправить заявку', en: 'Send request', hi: 'रिक्वेस्ट भेजो' },
  'buy.sending': { ru: 'Отправка…', en: 'Sending…', hi: 'भेज रहे…' },
  'buy.reqHint': { ru: 'Начисление после проверки транзакции оператором', en: 'Credited after an operator checks your transaction', hi: 'ऑपरेटर के ट्रांज़ैक्शन चेक करने के बाद क्रेडिट होगा' },
  'buy.doneTitle': { ru: 'Заявка отправлена!', en: 'Request sent!', hi: 'रिक्वेस्ट भेज दी!' },
  'buy.doneSub': { ru: 'Проверим транзакцию и начислим $KAKA. Придёт уведомление в бот 👑', en: "We'll check it and credit your $KAKA. You'll get a bot notification 👑", hi: 'हम चेक करके $KAKA क्रेडिट करेंगे। बॉट में नोटिफिकेशन आएगा 👑' },
  'buy.gotIt': { ru: 'Понятно', en: 'Got it', hi: 'समझ गया' },

  // --- Новичок / бренд ---
  'brand.title': { ru: 'На троне', en: 'The Throne', hi: 'The Throne' },
  'brand.sub': { ru: 'Твой личный какашка-трекер', en: 'Your personal poop tracker', hi: 'तेरा अपना पॉटी ट्रैकर' },
  'newbie.cta': { ru: 'Запиши свой первый поход!', en: 'Log your first visit!', hi: 'अपना पहला विज़िट लॉग करो!' },

  // --- Заголовки записи ---
  'rec.q.rate': { ru: 'Как всё прошло?', en: 'Rate your poop 💩', hi: 'अपनी पॉटी रेट करो 💩' },
  'rec.q.rateSub': { ru: 'Оцени сеанс от 1 до 10', en: 'from 1 to 10', hi: '1 से 10 तक' },
  'rec.q.amount': { ru: 'Сколько добра?', en: 'How much?', hi: 'कितना?' },
  'rec.q.amountSub': { ru: 'Оцени объём', en: 'Pick the amount', hi: 'अमाउंट चुनो' },
  'rec.q.cons': { ru: 'Какая консистенция?', en: 'Describe your poop 💩', hi: 'अपनी पॉटी बताओ 💩' },
  'rec.q.consSub': { ru: 'Выбери, что ближе', en: '', hi: '' },
  'rec.q.paper': { ru: 'Сколько бумаги ушло?', en: 'How much paper?', hi: 'कितनी शीट्स?' },
  'rec.q.paperSub': { ru: 'Тапни по листам или проведи пальцем', en: 'Tap the sheets or swipe', hi: 'शीट्स पे टैप करो या स्वाइप' },
  'rec.noPaperBtn': { ru: '💩 Без бумаги 🚿', en: '💩 No paper 🚿', hi: '💩 बिना पेपर 🚿' },
  'rec.notPicked': { ru: 'Ещё не выбрано', en: 'Not picked yet', hi: 'अभी नहीं चुना' },
  'rec.torn': { ru: 'Оторвано:', en: 'Torn off:', hi: 'फाड़ी:' },

  // --- Ачивки ---
  'ach.title': { ru: 'Достижения 🏆', en: 'Badges 🏆', hi: 'बैजेस 🏆' },
  'ach.gotIt': { ru: 'Достижение получено!', en: 'Badge unlocked!', hi: 'बैज मिला!' },
  'ach.reader': { ru: 'Ты долистал до самого низа 🫡', en: 'You scrolled all the way down 🫡', hi: 'तू नीचे तक स्क्रॉल कर गया 🫡' },

  // --- Онбординг монет ---
  'onboard.ach': { ru: '🏆 Ачивки', en: '🏆 Badges', hi: '🏆 बैजेस' },
  'onboard.hint': { ru: 'Зарабатывай $KAKA и копи к листингу 👀', en: 'Earn $KAKA and stack up for listing 👀', hi: '$KAKA कमाओ और लिस्टिंग तक जमा करो 👀' },
  'ach.counter': { ru: 'Получено', en: 'Unlocked', hi: 'मिले' },
  'ach.tasks': { ru: '🎯 Задания', en: '🎯 Tasks', hi: '🎯 टास्क' },
  'ach.secret': { ru: '🕵️ Секретные', en: '🕵️ Secret', hi: '🕵️ सीक्रेट' },

  // --- Ачивки (названия + условия) ---
  'ach.first.name': { ru: 'Первое приземление', en: 'First Landing', hi: 'पहली लैंडिंग' },
  'ach.first.cond': { ru: 'Первый сеанс', en: 'Your first visit', hi: 'पहला विज़िट' },
  'ach.five.name': { ru: 'Пятёрочка', en: 'High Five', hi: 'हाई फाइव' },
  'ach.five.cond': { ru: '5 сеансов всего', en: '5 visits total', hi: 'कुल 5 विज़िट' },
  'ach.ten.name': { ru: 'Десятка сходов', en: 'Perfect Ten', hi: 'परफेक्ट टेन' },
  'ach.ten.cond': { ru: '10 сеансов всего', en: '10 visits total', hi: 'कुल 10 विज़िट' },
  'ach.hundred.name': { ru: 'Центурион', en: 'Centurion', hi: 'सेंचुरी' },
  'ach.hundred.cond': { ru: '100 сеансов всего', en: '100 visits total', hi: 'कुल 100 विज़िट' },
  'ach.perfect.name': { ru: 'Идеальный дроп', en: 'Perfect Drop', hi: 'परफेक्ट ड्रॉप' },
  'ach.perfect.cond': { ru: 'Оценка 10 + «Колбаска»', en: 'Score 10 + Sausage', hi: 'स्कोर 10 + सॉसेज' },
  'ach.paperking.name': { ru: 'Бумажный король', en: 'Paper King', hi: 'पेपर किंग' },
  'ach.paperking.cond': { ru: 'Больше 10 листов за раз', en: 'More than 10 sheets at once', hi: 'एक बार में 10 से ज़्यादा शीट' },
  'ach.ecoguard.name': { ru: 'Страж природы', en: 'Eco Warrior', hi: 'इको वॉरियर' },
  'ach.ecoguard.cond': { ru: '2 листа или меньше', en: '2 sheets or fewer', hi: '2 शीट या कम' },
  'ach.survival.name': { ru: 'Режим выживания', en: 'Survival Mode', hi: 'सर्वाइवल मोड' },
  'ach.survival.cond': { ru: 'Ровно 1 лист', en: 'Exactly 1 sheet', hi: 'सिर्फ 1 शीट' },
  'ach.aqua.name': { ru: 'Аквавоин', en: 'Water Warrior', hi: 'वॉटर वॉरियर' },
  'ach.aqua.cond': { ru: 'Отметить «Без бумаги»', en: 'Go "No paper"', hi: '"बिना पेपर" चुनो' },
  'ach.earlybird.name': { ru: 'Ранняя пташка', en: 'Early Bird', hi: 'अर्ली बर्ड' },
  'ach.earlybird.cond': { ru: 'Сеанс до 7 утра', en: 'A visit before 7 AM', hi: 'सुबह 7 बजे से पहले विज़िट' },
  'ach.midnight.name': { ru: 'Полуночник', en: 'Night Owl', hi: 'नाइट आउल' },
  'ach.midnight.cond': { ru: 'Сеанс после полуночи', en: 'A visit after midnight', hi: 'आधी रात के बाद विज़िट' },
  'ach.double.name': { ru: 'Дубль', en: 'Double Trouble', hi: 'डबल ट्रबल' },
  'ach.double.cond': { ru: '2 сеанса за один день', en: '2 visits in one day', hi: 'एक दिन में 2 विज़िट' },
  'ach.hattrick.name': { ru: 'Хет-трик', en: 'Hat-trick', hi: 'हैट्रिक' },
  'ach.hattrick.cond': { ru: '3 сеанса за один день', en: '3 visits in one day', hi: 'एक दिन में 3 विज़िट' },
  'ach.streak3.name': { ru: 'Разогрев', en: 'Warming Up', hi: 'वॉर्मिंग अप' },
  'ach.streak3.cond': { ru: 'Стрик 3 дня подряд', en: '3-day streak', hi: '3 दिन की स्ट्रीक' },
  'ach.streak7.name': { ru: 'Неделя дисциплины', en: 'Week of Discipline', hi: 'डिसिप्लिन का हफ्ता' },
  'ach.streak7.cond': { ru: 'Стрик 7 дней подряд', en: '7-day streak', hi: '7 दिन की स्ट्रीक' },
  'ach.loose.name': { ru: 'Прорыв плотины', en: 'Dam Burst', hi: 'डैम बर्स्ट' },
  'ach.loose.cond': { ru: 'Консистенция «Жидко»', en: 'Runny texture', hi: 'पतला टेक्स्चर' },
  'ach.hard.name': { ru: 'Каменная кладка', en: 'Solid as a Rock', hi: 'पत्थर जैसा सख्त' },
  'ach.hard.cond': { ru: 'Консистенция «Сухари»', en: 'Rock texture', hi: 'पत्थर टेक्स्चर' },
  'ach.sausage10.name': { ru: 'Идеальная форма', en: 'Perfect Shape', hi: 'परफेक्ट शेप' },
  'ach.sausage10.cond': { ru: '«Колбаска» 10 раз', en: 'Sausage 10 times', hi: '10 बार सॉसेज' },
  'ach.spectrum.name': { ru: 'Полный спектр', en: 'Full Spectrum', hi: 'फुल स्पेक्ट्रम' },
  'ach.spectrum.cond': { ru: 'Все 4 консистенции хоть раз', en: 'All 4 textures at least once', hi: 'चारों टेक्स्चर कम से कम एक बार' },
  'ach.artillery.name': { ru: 'Тяжёлая артиллерия', en: 'Heavy Artillery', hi: 'हेवी आर्टिलरी' },
  'ach.artillery.cond': { ru: '«Куча» три раза', en: 'A Load three times', hi: 'तीन बार "ढेर सारा"' },
  'ach.alien.name': { ru: 'Контакт с иным разумом', en: 'Alien Contact', hi: 'एलियन कॉन्टैक्ट' },
  'ach.alien.cond': { ru: 'Оценка 1 из 10', en: 'Score 1 out of 10', hi: 'स्कोर 1 out of 10' },
  'ach.nightwatch.name': { ru: 'Страж ночи', en: 'Night Watch', hi: 'नाइट वॉच' },
  'ach.nightwatch.cond': { ru: 'Сеанс между 2:00 и 4:00', en: 'A visit between 2 and 4 AM', hi: 'रात 2 से 4 बजे के बीच विज़िट' },
  'ach.doomsday.name': { ru: 'Судный день', en: 'Doomsday', hi: 'कयामत का दिन' },
  'ach.doomsday.cond': { ru: '5+ сеансов за один день', en: '5+ visits in one day', hi: 'एक दिन में 5+ विज़िट' },
  'ach.clean.name': { ru: 'Чистая работа', en: 'Clean Job', hi: 'क्लीन जॉब' },
  'ach.clean.cond': { ru: 'Оценка 10 + «Без бумаги»', en: 'Score 10 + No paper', hi: 'स्कोर 10 + बिना पेपर' },
  'ach.rollercoaster.name': { ru: 'Американские горки', en: 'Rollercoaster', hi: 'रोलरकोस्टर' },
  'ach.rollercoaster.cond': { ru: 'За день оценка 10 и оценка 1', en: 'Score 10 and score 1 in one day', hi: 'एक दिन में स्कोर 10 और स्कोर 1' },
  'ach.roadworks.name': { ru: 'Дорожные работы', en: 'Road Works', hi: 'रोड वर्क्स' },
  'ach.roadworks.cond': { ru: '«Осечка» 3 дня подряд', en: 'Misfire 3 days in a row', hi: '3 दिन लगातार फॉल्स अलार्म' },
  'ach.jackpot.name': { ru: 'Джекпот', en: 'Jackpot', hi: 'जैकपॉट' },
  'ach.jackpot.cond': { ru: 'Сеанс в 00:00–00:09', en: 'A visit at 00:00–00:09', hi: '00:00–00:09 पर विज़िट' },
  'ach.prophecy.name': { ru: 'Пророчество сбылось', en: 'Prophecy Fulfilled', hi: 'भविष्यवाणी सच हुई' },
  'ach.prophecy.cond': { ru: 'Оценка 7 семь раз подряд', en: 'Score 7 seven times in a row', hi: 'लगातार 7 बार स्कोर 7' },
  'ach.dragon.name': { ru: 'Победитель дракона', en: 'Dragon Slayer', hi: 'ड्रैगन स्लेयर' },
  'ach.dragon.cond': { ru: '«Куча» + больше 10 листов', en: 'A Load + more than 10 sheets', hi: '"ढेर सारा" + 10 से ज़्यादा शीट' },
  'ach.ninja.name': { ru: 'Бесшумный ниндзя', en: 'Silent Ninja', hi: 'साइलेंट निंजा' },
  'ach.ninja.cond': { ru: '«Без бумаги» 5 раз всего', en: 'No paper 5 times total', hi: 'कुल 5 बार बिना पेपर' },
  'ach.blackstreak.name': { ru: 'Чёрная полоса', en: 'Rough Patch', hi: 'बुरा दौर' },
  'ach.blackstreak.cond': { ru: 'Оценка 1–3 три раза подряд', en: 'Score 1–3 three times in a row', hi: 'लगातार 3 बार स्कोर 1–3' },
  'ach.goat.name': { ru: 'Величайший из всех', en: 'The GOAT', hi: 'द GOAT' },
  'ach.goat.cond': { ru: 'Оценка 8+ десять раз подряд', en: 'Score 8+ ten times in a row', hi: 'लगातार 10 बार स्कोर 8+' },
  'ach.thirty.name': { ru: 'Ритуал полнолуния', en: 'Full Moon Ritual', hi: 'फुल मून रिचुअल' },
  'ach.thirty.cond': { ru: '30 сеансов всего', en: '30 visits total', hi: 'कुल 30 विज़िट' },
  'ach.timeless.name': { ru: 'Вне времени', en: 'Timeless', hi: 'टाइमलेस' },
  'ach.timeless.cond': { ru: 'Сеансы во все 4 времени суток', en: 'Visits in all 4 parts of the day', hi: 'दिन के चारों समय विज़िट' },
  'ach.zen.name': { ru: 'Мастер дзена', en: 'Zen Master', hi: 'ज़ेन मास्टर' },
  'ach.zen.cond': { ru: 'Оценка 10 три раза подряд', en: 'Score 10 three times in a row', hi: 'लगातार 3 बार स्कोर 10' },
  'ach.reader.name': { ru: 'Конец есть!', en: 'The End!', hi: 'द एंड!' },
  'ach.reader.cond': { ru: 'Пролистать все ачивки', en: 'Scroll through all badges', hi: 'सारे बैजेस स्क्रॉल करो' },
}
// Главная функция перевода
export function t(key: string): string {
  const row = DICT[key]
  if (!row) return key            // нет ключа — вернём сам ключ (видно, что забыли)
  return row[LANG] || row.en || key
}

// Месяцы, дни недели, время суток (зависят от языка)
export function MONTHS(): string[] {
  if (LANG === 'hi') return ['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर']
  return LANG === 'ru'
    ? ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
    : ['January','February','March','April','May','June','July','August','September','October','November','December']
}
export function WEEKDAYS(): string[] {
  if (LANG === 'hi') return ['सोम','मंगल','बुध','गुरु','शुक्र','शनि','रवि']
  return LANG === 'ru'
    ? ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
}
export function TIMES(): string[] {
  if (LANG === 'hi') return ['सुबह 🌅','दिन ☀️','शाम 🌆','रात 🌙']
  return LANG === 'ru'
    ? ['Утро 🌅','День ☀️','Вечер 🌆','Ночь 🌙']
    : ['Morning 🌅','Day ☀️','Evening 🌆','Night 🌙']
}

// Перевод значений количества/консистенции (данные хранятся по-русски)
export function amountLabel(v: string): string {
  const map: Record<string, string> = {
    'Осечка': t('amount.miss'), 'Чуток': t('amount.little'),
    'Стандарт': t('amount.normal'), 'Куча': t('amount.lot'),
  }
  return map[v] || v
}
export function consLabel(v: string): string {
  const map: Record<string, string> = {
    'Жидко': t('cons.liquid'), 'Мягко': t('cons.soft'),
    'Колбаска': t('cons.sausage'), 'Сухарь': t('cons.rock'),
  }
  return map[v] || v
}
