import { useRef } from 'react'

async function notify(message: string): Promise<Notification> {
  if (Notification.permission !== 'granted')
    throw new Error('You have denied the notification permission')

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
