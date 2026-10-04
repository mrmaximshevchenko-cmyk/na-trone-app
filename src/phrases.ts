// Фразы-реакции и медсоветы. EN — простой, понятный не-носителю.
import { LANG } from './i18n'

const PHRASES = {
  praise: {
    ru: [
      'Шедевр! Можно вешать в галерею 🖼️',
      'Чистая работа, король трона 👑',
      'Вот это ты выдал! Стоячая овация 👏',
      'Идеально. Прям учебное пособие 📚',
      'Ты сегодня в ударе! 🔥',
      'Профессионал своего дела 🏆',
      'Легенда трона проснулась 🐉',
      'Ты справился на все сто! 💯',
      'Космос! Прям взлёт без турбулентности 🚀',
      'Ювелирная работа 💎',
      'Ты сегодня победитель. Официально 🥇',
      'Как швейцарские часы. Точно и надёжно',
      'Это было эпично. Титры 🎬',
      'Вот она — гармония с собой ☯️',
      'Изящно! Балет, а не поход',
      'Вот это контроль! Мастер дзена 🧘',
      'Триумф! Можно и похвастаться друзьям 📣',
    ],
    en: [
      'Masterpiece! Frame it 🖼️',
      'Clean work, throne king 👑',
      'Now that was good! Standing ovation 👏',
      'Perfect. Like a textbook 📚',
      "You're on fire today! 🔥",
      'True pro 🏆',
      'The throne legend wakes up 🐉',
      'You nailed it! 💯',
      'Smooth liftoff, no bumps 🚀',
      'Top quality 💎',
      "Today's winner. Official 🥇",
      'Like a clock. On time, every time',
      'Epic. Roll the credits 🎬',
      'Pure harmony ☯️',
      'So smooth! Pure art',
      'Full control! Zen master 🧘',
      'Big win! Go flex to friends 📣',
    ],
  },
  neutral: {
    ru: [
      'Норм заход. Дело сделано 👍',
      'Стабильно. Без сюрпризов',
      'Рабочий вариант. Живём дальше',
      'Ок, задача выполнена ✅',
      'Обычный день на троне. И это нормально',
      'Сойдёт! Не каждый раз шедевр',
      'Твёрдая серединка. Всё по плану',
      'Без фанфар, но чётко 🫡',
    ],
    en: [
      'Solid one. Job done 👍',
      'Steady. No surprises',
      'Works fine. Moving on',
      'OK, task done ✅',
      'A normal day on the throne. All good',
      'Good enough! Not always a masterpiece',
      'Solid middle. All on plan',
      'No fireworks, but clean 🫡',
    ],
  },
  sympathy: {
    ru: [
      'Бывает и такое. В следующий раз будет легче 💛',
      'Не переживай, у всех бывают трудные дни',
      'Организм капризничает — это пройдёт',
      'Держись, дружище. Мы это переживём 🫂',
      'Иногда трон испытывает нас на прочность',
      'Это временно. Верю в твой кишечник 🙏',
      'Обнимаю. Пусть следующий раз будет мягче 🫂',
      'Организму сегодня непросто. Побереги себя',
      'Сложный заход. Отдохни, попей водички',
      'Ты сильнее, чем кажется. Даже на троне 💪',
      'Немного сбой в системе — перезагрузимся 🔄',
      'Крепись. И побольше воды, ага? 💧',
      'Пусть следующий трон будет добрее к тебе',
    ],
    en: [
      'It happens. Next time will be easier 💛',
      "Don't worry, everyone has hard days",
      'Your body is fussy today — it will pass',
      'Hang in there, buddy. We got this 🫂',
      'Sometimes the throne tests us',
      "It's temporary. I believe in your gut 🙏",
      'Big hug. May next time be softer 🫂',
      'Tough day for your body. Take care',
      'Hard one. Rest and drink some water',
      "You're stronger than you think 💪",
      'Small system glitch — reboot time 🔄',
      'Stay strong. And more water, ok? 💧',
      'May your next throne be kinder',
    ],
  },
  encourage: {
    ru: [
      'Бывает! Не всё сразу 🫡',
      'Ложная тревога — тоже результат 😄',
      'Организм просто передумал. Ничего страшного',
      'Не вышло — значит, не время. Всё ок 👍',
    ],
    en: [
      'It happens! Not everything at once 🫡',
      'False alarm — still counts 😄',
      'Your body just changed its mind. No big deal',
      "Didn't work? Wrong time. All good 👍",
    ],
  },
  tipsHard: {
    ru: [
      'Съешь сегодня свёклу или морковь — они помогают 🥕',
      'Чернослив — твой друг. Пара штук творят чудеса',
      'Закинься киви или грушей, организм скажет спасибо 🥝',
      'Выпей стакан кефира на ночь 🥛',
      'Побольше воды сегодня — сухость любит влагу 💧',
      'Прогуляйся 20–30 минут, движение помогает кишечнику 🚶',
      'Овсянка на завтрак — и станет легче',
    ],
    en: [
      'Eat some beets or carrots today — they help 🥕',
      'Prunes are your friend. A few do wonders',
      'Try kiwi or a pear, your body will thank you 🥝',
      'Drink a glass of kefir at night 🥛',
      'More water today — dryness loves water 💧',
      'Walk 20–30 min, moving helps your gut 🚶',
      'Oatmeal for breakfast — it gets easier',
    ],
  },
  tipsLoose: {
    ru: [
      'Сегодня рис и бананы — они закрепляют 🍌',
      'Побольше воды! При жидком легко обезводиться 💧',
      'Сухарики и тосты — простая спасительная еда',
      'Избегай сегодня жирного и острого 🌶️',
      'Крепкий несладкий чай тоже выручает 🍵',
      'Дай желудку отдохнуть — лёгкая еда сегодня',
    ],
    en: [
      'Rice and bananas today — they firm things up 🍌',
      'More water! Runny can dehydrate you fast 💧',
      'Crackers and toast — simple safe food',
      'Avoid oily and spicy food today 🌶️',
      'Strong tea with no sugar also helps 🍵',
      'Let your stomach rest — light food today',
    ],
  },
}

function pickFrom(group: { ru: string[]; en: string[] }): string {
  const arr = group[LANG] || group.en
  return arr[Math.floor(Math.random() * arr.length)]
}

export const PRAISE = () => pickFrom(PHRASES.praise)
export const NEUTRAL = () => pickFrom(PHRASES.neutral)
export const SYMPATHY = () => pickFrom(PHRASES.sympathy)
export const ENCOURAGE = () => pickFrom(PHRASES.encourage)
export const TIP_HARD = () => pickFrom(PHRASES.tipsHard)
export const TIP_LOOSE = () => pickFrom(PHRASES.tipsLoose)
