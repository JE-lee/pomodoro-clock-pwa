export async function notify(message: string): Promise<void> {
  await grantNotification()
  const icon = './favicon.ico'
  const notification = new Notification('TAKE A NAP', {
    icon,
    image: icon,
    badge: icon,
    body: message,
    requireInteraction: true,
  })
  // wait for the interaction
  return new Promise((resolve) => {
    notification.addEventListener('click', () => {
      notification.close()
      resolve()
    }, { once: true })
  })
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
