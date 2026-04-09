import { hatchPrompt } from './gemini'
import { saveSession } from './sessions'

interface QueuedHatch {
  id: string
  userId: string
  missionName: string
  prompt: string
  timestamp: number
}

const QUEUE_KEY = 'eggy_offline_queue'

export const queueHatch = (userId: string, missionName: string, prompt: string) => {
  const queue: QueuedHatch[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  const newHatch: QueuedHatch = {
    id: Math.random().toString(36).substring(7),
    userId,
    missionName,
    prompt,
    timestamp: Date.now()
  }
  queue.push(newHatch)
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  return newHatch.id
}

export const syncOfflineQueue = async () => {
  if (!navigator.onLine) return
  
  const queue: QueuedHatch[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  if (queue.length === 0) return

  const remaining: QueuedHatch[] = []

  for (const item of queue) {
    try {
      const result = await hatchPrompt(item.missionName, item.prompt)
      await saveSession(item.userId, `offline_${item.id}`, item.missionName, item.prompt, result)
      console.log(`Synced offline hatch: ${item.missionName}`)
    } catch (err) {
      console.error(`Failed to sync offline hatch: ${item.missionName}`, err)
      remaining.push(item)
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining))
}

// Initial sync on startup
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineQueue)
}
