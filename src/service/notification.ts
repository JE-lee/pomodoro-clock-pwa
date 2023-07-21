import { useRef } from 'react'

async function notify(message: string, image = './logo512.png'): Promise<Notification> {
  if (Notification.permission !== 'granted')
    throw new Error('You have denied the notification permission')

  const icon = './favicon.ico'
  const notification = new Notification('TAKE A BREAK', {
    icon: image,
    image,
    badge: icon,
    body: message,
    requireInteraction: true,
  })
  return notification
}

export function useNotification() {
  const closeNotification = useRef(() => {})
  const confirm = async (message: string, image?: string): Promise<void> => {
    const notification = await notify(message, image)
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
