import AsyncStorage from '@react-native-async-storage/async-storage';
import { Occasion, Precipitation, WeatherBand } from '../types/catalog';

export type WearEventContext = {
  lookTitle?: string;
  occasion?: Occasion;
  weatherBand?: WeatherBand;
  precipitation?: Precipitation;
  lookId?: string;
};

export type WearHistoryEntry = {
  id: string;
  itemIds: string[];
  wornAt: string;
  lookTitle?: string;
  occasion?: Occasion;
  weatherBand?: WeatherBand;
  precipitation?: Precipitation;
  lookId?: string;
};

const WEAR_HISTORY_KEY = 'combinia_wear_history';

function normalizeEntry(raw: any): WearHistoryEntry {
  return {
    id: raw?.id || `${Date.now()}`,
    itemIds: Array.isArray(raw?.itemIds) ? raw.itemIds : [],
    wornAt: raw?.wornAt || new Date().toISOString(),
    lookTitle: raw?.lookTitle || '',
    occasion: raw?.occasion || undefined,
    weatherBand: raw?.weatherBand || undefined,
    precipitation: raw?.precipitation || undefined,
    lookId: raw?.lookId || undefined,
  };
}

export async function getWearHistory(): Promise<WearHistoryEntry[]> {
  const raw = await AsyncStorage.getItem(WEAR_HISTORY_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  return parsed.map(normalizeEntry).sort((a, b) => b.wornAt.localeCompare(a.wornAt));
}

export async function logWearEvent(
  itemIds: string[],
  context?: WearEventContext
) {
  const existing = await getWearHistory();

  const entry: WearHistoryEntry = normalizeEntry({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemIds,
    wornAt: new Date().toISOString(),
    lookTitle: context?.lookTitle || '',
    occasion: context?.occasion,
    weatherBand: context?.weatherBand,
    precipitation: context?.precipitation,
    lookId: context?.lookId,
  });

  await AsyncStorage.setItem(
    WEAR_HISTORY_KEY,
    JSON.stringify([entry, ...existing].slice(0, 100))
  );

  return entry;
}
