import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function startApp() {
  const tg = (window as any).Telegram?.WebApp
  if (tg) {
    tg.ready()
    tg.expand()
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// Ждём, пока загрузится Telegram SDK, потом стартуем
if ((window as any).Telegram?.WebApp) {
  startApp()
} else {
  const script = document.createElement('script')
  script.src = 'https://telegram.org/js/telegram-web-app.js'
  script.onload = startApp
  script.onerror = startApp
  document.head.appendChild(script)
}