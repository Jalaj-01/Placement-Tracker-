import { formatDate } from './dateHelpers'

// Request permission for showing notifications
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Fire a browser notification
export function showNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  // Register notification
  try {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [200, 100, 200],
      })
    }).catch(() => {
      // Fallback if service worker is not active
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png',
      })
    })
  } catch {
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
    })
  }
}

// Scheduled check for daily streaks & application deadlines
export function runNotificationScheduler(streakData, applications) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const todayStr = new Date().toISOString().split('T')[0]

  // 1. Streak reminder (fire at 8:00 PM if no activity today)
  const lastActive = streakData?.lastActiveDate
  if (lastActive !== todayStr) {
    const currentHour = new Date().getHours()
    // Fire evening reminder if user is inactive
    if (currentHour >= 19) {
      const lastKey = 'streak_notified_today'
      const notified = localStorage.getItem(lastKey)
      if (notified !== todayStr) {
        showNotification(
          'Streak Warning! 🔥',
          `Keep your ${streakData?.currentStreak || 0}-day preparation streak alive! Log a problem or topic now.`
        )
        localStorage.setItem(lastKey, todayStr)
      }
    }
  }

  // 2. Deadline alert (fire notification if interview/OA is within 24 hours)
  applications.forEach((app) => {
    if (!app.roundDate) return
    const d = app.roundDate.toDate ? app.roundDate.toDate() : new Date(app.roundDate)
    const diff = d.getTime() - Date.now()

    // 24 hours limit
    if (diff > 0 && diff <= 24 * 60 * 60 * 1000) {
      const appKey = `app_notified_${app.id}`
      const notified = localStorage.getItem(appKey)
      if (!notified) {
        showNotification(
          'Upcoming Round Reminder 🚀',
          `Your interview/OA round for ${app.companyName} (${app.role}) is scheduled for ${formatDate(app.roundDate)}!`
        )
        localStorage.setItem(appKey, 'true')
      }
    }
  })
}
