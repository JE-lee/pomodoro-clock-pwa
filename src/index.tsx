import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.scss'
import * as Sentry from '@sentry/react'
import { Workbox } from 'workbox-window'
import App from './App'
import reportWebVitals from './reportWebVitals'

Sentry.init({
  dsn: 'https://9bfef45903984525958da0490a874e53@o4505571593617408.ingest.sentry.io/4505571634774016',
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ['localhost', 'https://pomodoro-clock-pwa.vercel.app/'],
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js')

    // Add an event listener to detect when the registered
    // service worker has installed but is waiting to activate.
    wb.addEventListener('waiting', () => {
      wb.messageSkipWaiting()
    })

    wb.addEventListener('controlling', () => {
      // At this point, reloading will ensure that the current
      // tab is loaded under the control of the new service worker.
      // Depending on your web app, you may want to auto-save or
      // persist transient state before triggering the reload.
      window.location.reload()
    })

    wb.register()
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
