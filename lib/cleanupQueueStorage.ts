import AsyncStorage from '@react-native-async-storage/async-storage';

export type CleanupQueueItem = {
  itemId: string;
  reason: 'fallback' | 'failed' | 'missing';
  createdAt: string;
  retries: number;
  lastTriedAt?: string;
};

const CLEANUP_QUEUE_KEY = 'combinia_cleanup_queue';

function normalize(raw: any): CleanupQueueItem {
  return {
    itemId: raw?.itemId || '',
    reason: raw?.reason || 'missing',
    createdAt: raw?.createdAt || new Date().toISOString(),
    retries: Number.isFinite(raw?.retries) ? raw.retries : 0,
    lastTriedAt: raw?.lastTriedAt || '',
  };
}

export async function getCleanupQueue(): Promise<CleanupQueueItem[]> {
  const raw = await AsyncStorage.getItem(CLEANUP_QUEUE_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  return parsed.map(normalize).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

async function saveCleanupQueue(items: CleanupQueueItem[]) {
  await AsyncStorage.setItem(CLEANUP_QUEUE_KEY, JSON.stringify(items.map(normalize)));
}

export async function enqueueCleanupItem(
  itemId: string,
  reason: CleanupQueueItem['reason']
) {
  const queue = await getCleanupQueue();
  const existing = queue.find((item) => item.itemId === itemId);

  if (existing) {
    const updated = queue.map((item) =>
      item.itemId === itemId
        ? {
            ...item,
            reason,
          }
        : item
    );
    await saveCleanupQueue(updated);
    return;
  }

  queue.push(
    normalize({
      itemId,
      reason,
      createdAt: new Date().toISOString(),
      retries: 0,
    })
  );

  await saveCleanupQueue(queue);
}

export async function markCleanupQueueTried(itemId: string) {
  const queue = await getCleanupQueue();
  const updated = queue.map((item) =>
    item.itemId === itemId
      ? {
          ...item,
          retries: (item.retries || 0) + 1,
          lastTriedAt: new Date().toISOString(),
        }
      : item
  );

  await saveCleanupQueue(updated);
}

export async function removeCleanupQueueItem(itemId: string) {
  const queue = await getCleanupQueue();
  await saveCleanupQueue(queue.filter((item) => item.itemId !== itemId));
}

export async function clearCleanupQueue() {
  await saveCleanupQueue([]);
}
