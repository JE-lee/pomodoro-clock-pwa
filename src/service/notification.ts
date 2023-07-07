import { useRef } from 'react'

async function notify(message: string): Promise<Notification> {
  await grantNotification()
  const icon = './favicon.ico'
  const notification = new Notification('TAKE A BREAK', {
    icon,
    image: './logo512.png',
    badge: icon,
    body: message,
    requireInteraction: true,
  })
  return notification
}

export function useNotification() {
  const closeNotification = useRef(() => {})
  const confirm = async (message: string): Promise<void> => {
    const notification = await notify(message)
    closeNotification.current = () => notification.close()
    // wait for the interaction
    return new Promise((resolve, reject) => {
      notification.addEventListener('click', () => {
        notification.close()
        resolve()
      }, { once: true })
      notification.addEventListener('close', () => reject(new Error('You have closed the notification')), { once: true })
    })
  }
  return {
    closeNotification: () => closeNotification.current(),
    confirm,
  }
}

// grant the notification permission
export function grantNotification(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('Notification' in window)) {
      // alert('This browser does not support desktop notification')
      reject(new Error('This browser does not support desktop notification'))
    }
    else if (Notification.permission === 'granted') {
      resolve()
    }
    else if (Notification.permission !== 'denied') {
      return Notification.requestPermission().then((permission) => {
        if (permission !== 'granted')
          throw new Error('You have denied the notification permission')
      })
    }
    else {
      reject(new Error('You have denied the notification permission'))
    }
  })
}
