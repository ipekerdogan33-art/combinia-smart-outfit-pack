import AsyncStorage from '@react-native-async-storage/async-storage';

export type CleanupStatusRecord = {
  itemId: string;
  source:
    | 'remove-and-detect'
    | 'remove-background+detect'
    | 'original-fallback'
    | 'manual-upload'
    | '';
  lastProcessedAt: string;
  attempts: number;
  cleaned: boolean;
  lastError?: string;
};

const CLEANUP_STATUS_KEY = 'combinia_cleanup_status';

function normalizeRecord(raw: any): CleanupStatusRecord {
  return {
    itemId: raw?.itemId || '',
    source: raw?.source || '',
    lastProcessedAt: raw?.lastProcessedAt || new Date().toISOString(),
    attempts: Number.isFinite(raw?.attempts) ? raw.attempts : 0,
    cleaned: !!raw?.cleaned,
    lastError: raw?.lastError || '',
  };
}

export async function getCleanupStatusMap(): Promise<Record<string, CleanupStatusRecord>> {
  const raw = await AsyncStorage.getItem(CLEANUP_STATUS_KEY);
  const parsed = raw ? JSON.parse(raw) : {};
  const normalized: Record<string, CleanupStatusRecord> = {};

  Object.entries(parsed).forEach(([key, value]) => {
    normalized[key] = normalizeRecord(value);
  });

  return normalized;
}

export async function getCleanupStatusList(): Promise<CleanupStatusRecord[]> {
  const map = await getCleanupStatusMap();
  return Object.values(map).sort((a, b) => b.lastProcessedAt.localeCompare(a.lastProcessedAt));
}

export async function saveCleanupStatusMap(map: Record<string, CleanupStatusRecord>) {
  await AsyncStorage.setItem(CLEANUP_STATUS_KEY, JSON.stringify(map));
}

export async function recordCleanupSuccess(
  itemId: string,
  source: CleanupStatusRecord['source'],
  cleaned: boolean
) {
  const map = await getCleanupStatusMap();
  const current = map[itemId];

  map[itemId] = normalizeRecord({
    itemId,
    source,
    cleaned,
    lastError: cleaned ? '' : 'Temizleme yapılamadı, ham görsel korundu.',
    attempts: (current?.attempts || 0) + 1,
    lastProcessedAt: new Date().toISOString(),
  });

  await saveCleanupStatusMap(map);
  return map[itemId];
}

export async function recordCleanupFailure(itemId: string, errorMessage?: string) {
  const map = await getCleanupStatusMap();
  const current = map[itemId];

  map[itemId] = normalizeRecord({
    itemId,
    source: current?.source || '',
    cleaned: false,
    lastError: errorMessage || 'İşleme sırasında hata oluştu.',
    attempts: (current?.attempts || 0) + 1,
    lastProcessedAt: new Date().toISOString(),
  });

  await saveCleanupStatusMap(map);
  return map[itemId];
}

export async function recordManualCleanup(itemId: string) {
  return recordCleanupSuccess(itemId, 'manual-upload', true)
}
